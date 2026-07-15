"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import {
  RefreshCw,
  Eye,
  Package,
  Calendar,
  Tag,
  Star,
  Package2,
  ChevronLeft,
  ChevronRight,
  Save,
  Loader2,
  Plus,
  Pencil,
  Archive,
  ArchiveRestore,
  Scale,
  Download,
} from "lucide-react";
import { ProductsSkeleton } from "./SkeletonLoaders";
import { Product } from "./types";
import { safeApiCall, handleApiError } from "./apiHelpers";
import type { Category } from "@/sanity.types";
import { toast } from "sonner";
import { downloadAdminCsv } from "@/lib/downloadAdminCsv";
import ProductEditor, { type ProductEditorState } from "./ProductEditor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface AdminProductsProps {
  initialCategories?: Category[];
}

type ProductEditForm = {
  price: string;
  stock: string;
  discount: string;
  status: "" | "new" | "hot" | "sale";
  isFeatured: boolean;
};

function toEditForm(product: Product): ProductEditForm {
  return {
    price: String(product.price ?? 0),
    stock: String(product.stock ?? 0),
    discount: String(product.discount ?? 0),
    status: (product.status as ProductEditForm["status"]) || "",
    isFeatured: Boolean(product.featured || product.isFeatured),
  };
}

const AdminProducts: React.FC<AdminProductsProps> = ({
  initialCategories = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [productCategory, setProductCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);
  const [categories, setCategories] =
    useState<Category[]>(initialCategories);
  const [editForm, setEditForm] = useState<ProductEditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingFieldId, setSavingFieldId] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<ProductEditorState | null>(
    null,
  );
  const [archiveFilter, setArchiveFilter] = useState<"active" | "archived" | "all">(
    "active",
  );
  const [weightStockProduct, setWeightStockProduct] = useState<Product | null>(
    null,
  );
  const [weightStocks, setWeightStocks] = useState<
    Array<{ _key: string; weight: string; stock: string }>
  >([]);
  const [savingWeights, setSavingWeights] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const limit = 10;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when search changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setCurrentPage(0);
    }
  }, [debouncedSearchTerm, searchTerm]);

  // Utility functions
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Fetch products
  const fetchProducts = useCallback(
    async (page = 0) => {
      setLoading(true);
      try {
        const categoryParam = productCategory === "all" ? "" : productCategory;
        const data = await safeApiCall(
          `/api/admin/products?limit=${limit}&offset=${
            page * limit
          }&category=${categoryParam}&search=${debouncedSearchTerm}&archived=${archiveFilter}`
        );
        setProducts(data.products);
      } catch (error) {
        handleApiError(error, "Products fetch");
      } finally {
        setLoading(false);
      }
    },
    [productCategory, debouncedSearchTerm, archiveFilter, limit]
  );

  // Effects
  useEffect(() => {
    fetchProducts(currentPage);
  }, [fetchProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(0);
  }, [productCategory, debouncedSearchTerm, archiveFilter]);

  const openWeightStock = async (product: Product) => {
    try {
      const response = await safeApiCall(
        `/api/admin/products?id=${product._id}`,
      );
      const full = response.product as Product;
      const weights = full.weightOptions || [];
      if (weights.length === 0) {
        toast.message("No weight options on this product — edit it fully first.");
        return;
      }
      setWeightStockProduct(full);
      setWeightStocks(
        weights.map((w) => ({
          _key: w._key || w.weight,
          weight: w.weight,
          stock: String(w.stock ?? 0),
        })),
      );
    } catch (error) {
      handleApiError(error, "Weight stock load");
    }
  };

  const saveWeightStocks = async () => {
    if (!weightStockProduct) return;
    setSavingWeights(true);
    try {
      const existing = weightStockProduct.weightOptions || [];
      const weightOptions = existing.map((w) => {
        const draft = weightStocks.find(
          (d) => d._key === w._key || d.weight === w.weight,
        );
        return {
          _key: w._key,
          weight: w.weight,
          price: w.price,
          isDefault: Boolean(w.isDefault),
          stock: parseInt(draft?.stock ?? String(w.stock ?? 0), 10) || 0,
        };
      });
      await safeApiCall("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: weightStockProduct._id,
          weightOptions,
        }),
      });
      toast.success("Weight stock updated");
      setWeightStockProduct(null);
      fetchProducts(currentPage);
    } catch (error) {
      handleApiError(error, "Weight stock save");
      toast.error("Failed to update weight stock");
    } finally {
      setSavingWeights(false);
    }
  };

  const toggleArchive = async (product: Product) => {
    const next = !product.isArchived;
    const label = next ? "Archive" : "Restore";
    if (
      !window.confirm(
        next
          ? `Archive "${product.name}"? It will be hidden from the storefront.`
          : `Restore "${product.name}" to the catalog?`,
      )
    ) {
      return;
    }
    try {
      await safeApiCall("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          isArchived: next,
        }),
      });
      toast.success(`${label}d`);
      fetchProducts(currentPage);
    } catch (error) {
      handleApiError(error, label);
      toast.error(`Failed to ${label.toLowerCase()} product`);
    }
  };

  // Keyboard navigation for image carousel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        !isProductDetailsOpen ||
        !selectedProduct?.images ||
        selectedProduct.images.length <= 1
      ) {
        return;
      }

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          goToPrevImage();
          break;
        case "ArrowRight":
          event.preventDefault();
          goToNextImage();
          break;
        case "Escape":
          event.preventDefault();
          setIsProductDetailsOpen(false);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isProductDetailsOpen, selectedProduct?.images]);

  // Handle product view
  const handleViewProduct = async (product: Product) => {
    try {
      setCurrentImageIndex(0);
      const response = await safeApiCall(
        `/api/admin/products?id=${product._id}`,
      );
      setSelectedProduct(response.product);
      setEditForm(toEditForm(response.product));
      setIsProductDetailsOpen(true);
    } catch (error) {
      handleApiError(error, "Product details fetch");
      setCurrentImageIndex(0);
      setSelectedProduct(product);
      setEditForm(toEditForm(product));
      setIsProductDetailsOpen(true);
    }
  };

  const applyLocalProductUpdate = (
    productId: string,
    patch: Partial<Product>,
  ) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === productId ? { ...p, ...patch } : p)),
    );
    setSelectedProduct((prev) =>
      prev && prev._id === productId ? { ...prev, ...patch } : prev,
    );
  };

  const patchProduct = async (
    productId: string,
    body: Record<string, unknown>,
    fieldKey?: string,
  ) => {
    if (fieldKey) setSavingFieldId(`${productId}:${fieldKey}`);
    else setSaving(true);

    try {
      const data = await safeApiCall("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...body }),
      });
      const updated = data.product as Partial<Product>;
      applyLocalProductUpdate(productId, {
        price: updated.price,
        stock: updated.stock,
        discount: updated.discount,
        status: updated.status as Product["status"],
        featured: Boolean(updated.featured ?? updated.isFeatured),
        isFeatured: Boolean(updated.isFeatured ?? updated.featured),
      });
      if (selectedProduct?._id === productId) {
        setEditForm(
          toEditForm({
            ...selectedProduct,
            ...updated,
            featured: Boolean(updated.featured ?? updated.isFeatured),
          } as Product),
        );
      }
      toast.success("Product updated");
      return true;
    } catch (error) {
      handleApiError(error, "Product update");
      toast.error("Failed to update product");
      return false;
    } finally {
      setSaving(false);
      setSavingFieldId(null);
    }
  };

  const handleSaveSheetEdits = async () => {
    if (!selectedProduct || !editForm) return;

    const price = Number(editForm.price);
    const stock = Number(editForm.stock);
    const discount = Number(editForm.discount);

    if (Number.isNaN(price) || price < 0) {
      toast.error("Enter a valid price");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      toast.error("Stock must be a whole number >= 0");
      return;
    }
    if (Number.isNaN(discount) || discount < 0) {
      toast.error("Enter a valid discount");
      return;
    }

    await patchProduct(selectedProduct._id, {
      price,
      stock,
      discount,
      status: editForm.status,
      isFeatured: editForm.isFeatured,
    });
  };

  const handleQuickNumberBlur = async (
    product: Product,
    field: "price" | "stock",
    raw: string,
  ) => {
    const value = field === "stock" ? parseInt(raw, 10) : Number(raw);
    if (Number.isNaN(value) || value < 0) {
      toast.error(`Invalid ${field}`);
      await fetchProducts(currentPage);
      return;
    }
    if (field === "stock" && !Number.isInteger(value)) {
      toast.error("Stock must be a whole number");
      await fetchProducts(currentPage);
      return;
    }
    if (product[field] === value) return;
    await patchProduct(product._id, { [field]: value }, field);
  };

  // Carousel navigation functions
  const goToPrevImage = () => {
    if (selectedProduct?.images && selectedProduct.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedProduct.images!.length - 1 : prev - 1
      );
    }
  };

  const goToNextImage = () => {
    if (selectedProduct?.images && selectedProduct.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === selectedProduct.images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "hot":
        return "destructive";
      case "new":
        return "default";
      case "sale":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleExportCsv = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (productCategory && productCategory !== "all") {
        params.set("category", productCategory);
      }
      if (debouncedSearchTerm) {
        params.set("search", debouncedSearchTerm);
      }
      if (archiveFilter) {
        params.set("archived", archiveFilter);
      }
      const qs = params.toString();
      await downloadAdminCsv(
        `/api/admin/products/export${qs ? `?${qs}` : ""}`,
        `products-${new Date().toISOString().slice(0, 10)}.csv`,
      );
      toast.success("Products CSV downloaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to export products CSV",
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Products"
        description="Create and edit catalog products, stock, and variants."
        actions={
          <>
            <Button onClick={() => setEditorState({ mode: "create" })}>
              <Plus className="me-2 h-4 w-4" />
              Add product
            </Button>
            <Button
              onClick={handleExportCsv}
              variant="outline"
              disabled={isExporting}
            >
              <Download
                className={`me-2 h-4 w-4 ${isExporting ? "animate-pulse" : ""}`}
              />
              {isExporting ? "Exporting..." : "Export CSV"}
            </Button>
            <Button
              onClick={() => fetchProducts(currentPage)}
              variant="outline"
            >
              <RefreshCw className="me-2 h-4 w-4" />
              Refresh
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md sm:w-48"
        />
        <Select value={productCategory} onValueChange={setProductCategory}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category._id} value={category.title || ""}>
                {category.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={archiveFilter}
          onValueChange={(v) =>
            setArchiveFilter(v as "active" | "archived" | "all")
          }
        >
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <ProductsSkeleton />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No products found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow key={product._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {/* Product Image */}
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                {product.images && product.images[0] ? (
                                  <Image
                                    src={urlFor(product.images[0])
                                      .width(48)
                                      .height(48)
                                      .url()}
                                    alt={product.name || "Product"}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Package className="w-6 h-6" />
                                  </div>
                                )}
                              </div>
                              {/* Product Info */}
                              <div className="min-w-0">
                                <div className="font-medium truncate">
                                  {product.name}
                                </div>
                                {(product.featured || product.isFeatured) && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Featured
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {product.category?.name ||
                              product.category?.title ||
                              "N/A"}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              defaultValue={product.price}
                              disabled={savingFieldId === `${product._id}:price`}
                              className="h-8 w-24"
                              onBlur={(e) =>
                                handleQuickNumberBlur(
                                  product,
                                  "price",
                                  e.target.value,
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              step={1}
                              defaultValue={product.stock}
                              disabled={savingFieldId === `${product._id}:stock`}
                              className="h-8 w-20"
                              onBlur={(e) =>
                                handleQuickNumberBlur(
                                  product,
                                  "stock",
                                  e.target.value,
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="capitalize">
                            {product.status}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewProduct(product)}
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setEditorState({
                                    mode: "edit",
                                    productId: product._id,
                                  })
                                }
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openWeightStock(product)}
                                title="Weight stock"
                              >
                                <Scale className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleArchive(product)}
                                title={
                                  product.isArchived ? "Restore" : "Archive"
                                }
                              >
                                {product.isArchived ? (
                                  <ArchiveRestore className="h-4 w-4" />
                                ) : (
                                  <Archive className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {products.length === 0 ? (
              <Card>
                <div className="p-8 text-center text-muted-foreground">
                  No products found.
                </div>
              </Card>
            ) : (
              products.map((product) => (
                <Card key={product._id}>
                  <div className="p-4 space-y-4">
                    {/* Product Header */}
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {product.images && product.images[0] ? (
                          <Image
                            src={urlFor(product.images[0])
                              .width(64)
                              .height(64)
                              .url()}
                            alt={product.name || "Product"}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {(product.featured || product.isFeatured) && (
                                <Badge variant="secondary" className="text-xs">
                                  <Star className="w-3 h-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewProduct(product)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setEditorState({
                                  mode: "edit",
                                  productId: product._id,
                                })
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Product Details Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Category</div>
                        <div className="font-medium">
                          {product.category?.name ||
                            product.category?.title ||
                            "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Price</div>
                        <div className="font-medium text-green-600">
                          {formatCurrency(product.price)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Stock</div>
                        <Badge
                          variant={
                            product.stock > 0 ? "default" : "destructive"
                          }
                          className="text-xs"
                        >
                          {product.stock} units
                        </Badge>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Status:</span>
                        <Badge
                          variant={getStatusColor(product.status)}
                          className="text-xs capitalize"
                        >
                          {product.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 pt-4">
            <Button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Previous
            </Button>
            <div className="hidden sm:flex items-center text-sm text-gray-500">
              Page {currentPage + 1}
            </div>
            <Button
              onClick={() => setCurrentPage(currentPage + 1)}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Next
            </Button>
          </div>
        </>
      )}

      {/* Product Details Sidebar */}
      <Sheet open={isProductDetailsOpen} onOpenChange={setIsProductDetailsOpen}>
        <SheetContent className="w-full sm:w-[480px] md:w-[640px] overflow-y-auto">
          <SheetHeader className="pb-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <SheetTitle>Product Details</SheetTitle>
                <SheetDescription>
                  Quick price/stock edits below, or open the full editor.
                </SheetDescription>
              </div>
              {selectedProduct && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsProductDetailsOpen(false);
                    setEditorState({
                      mode: "edit",
                      productId: selectedProduct._id,
                    });
                  }}
                >
                  <Pencil className="me-2 h-4 w-4" />
                  Full editor
                </Button>
              )}
            </div>
          </SheetHeader>

          {selectedProduct && (
            <div className="space-y-8 px-2">
              {/* Product Images Carousel */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h4 className="text-sm font-medium text-gray-900">Images</h4>
                  {selectedProduct.images &&
                    selectedProduct.images.length > 1 && (
                      <span className="text-xs text-gray-500">
                        Use ← → keys to navigate
                      </span>
                    )}
                </div>
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main Image Display */}
                    <div className="relative w-full">
                      <div className="aspect-square max-w-sm mx-auto rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-lg relative">
                        {imageLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                          </div>
                        )}
                        <Image
                          src={urlFor(selectedProduct.images[currentImageIndex])
                            .width(400)
                            .height(400)
                            .url()}
                          alt={`${selectedProduct.name} - Image ${
                            currentImageIndex + 1
                          }`}
                          width={400}
                          height={400}
                          className="w-full h-full object-cover"
                          priority
                          onLoadStart={() => setImageLoading(true)}
                          onLoad={() => setImageLoading(false)}
                          onError={() => setImageLoading(false)}
                        />
                      </div>

                      {/* Navigation Buttons */}
                      {selectedProduct.images.length > 1 && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                            onClick={goToPrevImage}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                            onClick={goToNextImage}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Thumbnail Navigation */}
                    {selectedProduct.images.length > 1 && (
                      <div className="space-y-2">
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide justify-center">
                          {selectedProduct.images.map((image, index) => (
                            <button
                              key={image._key || index}
                              onClick={() => goToImage(index)}
                              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                index === currentImageIndex
                                  ? "border-blue-500 shadow-md"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <Image
                                src={urlFor(image).width(64).height(64).url()}
                                alt={`${selectedProduct.name} - Thumbnail ${
                                  index + 1
                                }`}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          {currentImageIndex + 1} of{" "}
                          {selectedProduct.images.length} images
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square max-w-sm mx-auto rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                    <div className="text-center">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm text-gray-500">
                        No images available
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">
                  Basic Information
                </h4>
                <div className="grid gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-600 min-w-[80px]">
                      Product ID:
                    </span>
                    <span className="text-sm font-mono bg-white px-3 py-1 rounded border text-right break-all ml-2">
                      {selectedProduct._id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="text-sm font-medium text-right ml-2 flex-1">
                      {selectedProduct.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-600 min-w-[80px]">
                      Slug:
                    </span>
                    <span className="text-sm font-mono bg-white px-3 py-1 rounded border text-right break-all ml-2">
                      {selectedProduct.slug?.current || "N/A"}
                    </span>
                  </div>
                  {selectedProduct.description && (
                    <div className="flex flex-col gap-2">
                      <span className="text-sm text-gray-600">
                        Description:
                      </span>
                      <span className="text-sm text-gray-800 bg-white p-3 rounded border leading-relaxed">
                        {selectedProduct.description}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Pricing & Stock */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    Pricing & Inventory
                  </h4>
                  <Button
                    size="sm"
                    onClick={handleSaveSheetEdits}
                    disabled={saving || !editForm}
                  >
                    {saving ? (
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="me-2 h-4 w-4" />
                    )}
                    Save changes
                  </Button>
                </div>
                {editForm && (
                  <div className="grid gap-4 rounded-lg bg-gray-50 p-4">
                    <label className="grid gap-1.5">
                      <span className="text-sm text-gray-600">Price (USD)</span>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={editForm.price}
                        onChange={(e) =>
                          setEditForm((prev) =>
                            prev ? { ...prev, price: e.target.value } : prev,
                          )
                        }
                      />
                    </label>
                    <label className="grid gap-1.5">
                      <span className="text-sm text-gray-600">
                        Discount (%)
                      </span>
                      <Input
                        type="number"
                        min={0}
                        step="1"
                        value={editForm.discount}
                        onChange={(e) =>
                          setEditForm((prev) =>
                            prev
                              ? { ...prev, discount: e.target.value }
                              : prev,
                          )
                        }
                      />
                    </label>
                    <label className="grid gap-1.5">
                      <span className="text-sm text-gray-600">Stock</span>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        value={editForm.stock}
                        onChange={(e) =>
                          setEditForm((prev) =>
                            prev ? { ...prev, stock: e.target.value } : prev,
                          )
                        }
                      />
                    </label>
                    <label className="grid gap-1.5">
                      <span className="text-sm text-gray-600">
                        Marketing status
                      </span>
                      <Select
                        value={editForm.status || "none"}
                        onValueChange={(value) =>
                          setEditForm((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  status:
                                    value === "none"
                                      ? ""
                                      : (value as ProductEditForm["status"]),
                                }
                              : prev,
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="hot">Hot</SelectItem>
                          <SelectItem value="sale">Sale</SelectItem>
                        </SelectContent>
                      </Select>
                    </label>
                    <label className="flex items-center justify-between gap-3 rounded-md border bg-white px-3 py-2">
                      <span className="text-sm text-gray-600">
                        Featured product
                      </span>
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={editForm.isFeatured}
                        onChange={(e) =>
                          setEditForm((prev) =>
                            prev
                              ? { ...prev, isFeatured: e.target.checked }
                              : prev,
                          )
                        }
                      />
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Current listed price:{" "}
                      {formatCurrency(Number(editForm.price) || 0)}
                      {Number(editForm.discount) > 0
                        ? ` · ${editForm.discount}% off`
                        : ""}
                    </p>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              {/* Categories & Brand */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">
                  Classification
                </h4>
                <div className="grid gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Category:</span>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 px-3 py-1"
                    >
                      <Tag className="w-3 h-3" />
                      {selectedProduct.category?.name ||
                        selectedProduct.category?.title ||
                        "N/A"}
                    </Badge>
                  </div>
                  {selectedProduct.variant && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Product Type:
                      </span>
                      <Badge variant="secondary" className="px-3 py-1">
                        {selectedProduct.variant}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Status & Features */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">
                  Status & Features
                </h4>
                <div className="grid gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge
                      variant={getStatusColor(selectedProduct.status)}
                      className="px-3 py-1"
                    >
                      {selectedProduct.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Featured:</span>
                    <Badge
                      variant={
                        selectedProduct.featured || selectedProduct.isFeatured
                          ? "default"
                          : "outline"
                      }
                      className="px-3 py-1"
                    >
                      {selectedProduct.featured ||
                      selectedProduct.isFeatured ? (
                        <>
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Featured
                        </>
                      ) : (
                        "Not Featured"
                      )}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Metadata */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Metadata</h4>
                <div className="grid gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="text-sm font-mono bg-white px-3 py-1 rounded border">
                      {selectedProduct._type}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Created:</span>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1 rounded border">
                      <Calendar className="w-3 h-3" />
                      {formatDate(selectedProduct._createdAt)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Updated:</span>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1 rounded border">
                      <Calendar className="w-3 h-3" />
                      {formatDate(selectedProduct._updatedAt)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-gray-600">Revision:</span>
                    <span className="text-xs font-mono bg-white px-3 py-2 rounded border break-all leading-relaxed">
                      {selectedProduct._rev}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog
        open={Boolean(weightStockProduct)}
        onOpenChange={(open) => {
          if (!open) setWeightStockProduct(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Weight-level stock</DialogTitle>
            <DialogDescription>
              {weightStockProduct
                ? `Update bag sizes for ${weightStockProduct.name}`
                : "Update stock per weight"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {weightStocks.map((row) => (
              <div
                key={row._key}
                className="flex items-center justify-between gap-3"
              >
                <Label className="w-16 font-medium">{row.weight}</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={row.stock}
                  onChange={(e) =>
                    setWeightStocks((prev) =>
                      prev.map((item) =>
                        item._key === row._key
                          ? { ...item, stock: e.target.value }
                          : item,
                      ),
                    )
                  }
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setWeightStockProduct(null)}
              disabled={savingWeights}
            >
              Cancel
            </Button>
            <Button onClick={saveWeightStocks} disabled={savingWeights}>
              {savingWeights ? (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              ) : null}
              Save stock
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ProductEditor
        open={Boolean(editorState)}
        state={editorState}
        categories={categories}
        onClose={() => setEditorState(null)}
        onSaved={() => fetchProducts(currentPage)}
      />
    </div>
  );
};

export default AdminProducts;
