"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { safeApiCall, handleApiError } from "./apiHelpers";
import type { Category } from "@/sanity.types";
import { makeKey, slugify } from "./productEditorUtils";

const WEIGHT_CHOICES = ["125G", "250G", "500G", "1KG"] as const;
const GRIND_CHOICES = [
  { value: "whole-bean", label: "Whole Bean" },
  { value: "cafetiere", label: "Cafetiere" },
  { value: "filter", label: "Filter" },
  { value: "espresso", label: "Espresso" },
] as const;
const VARIANT_CHOICES = [
  "Light Roast",
  "Medium Roast",
  "Dark Roast",
  "Extra Dark",
] as const;
const PROCESSING_CHOICES = [
  { value: "washed", label: "Washed" },
  { value: "natural", label: "Natural" },
  { value: "honey", label: "Honey" },
  { value: "anaerobic", label: "Anaerobic" },
  { value: "experimental", label: "Experimental" },
] as const;
const GRIND_REC_CHOICES = [
  { value: "extra-fine", label: "Extra Fine" },
  { value: "fine", label: "Fine" },
  { value: "medium-fine", label: "Medium-Fine" },
  { value: "medium", label: "Medium" },
  { value: "coarse", label: "Coarse" },
] as const;
const LOT_CHOICES = [
  { value: "core-blend", label: "Core Blend" },
  { value: "single-origin", label: "Single Origin" },
  { value: "micro-lot", label: "Micro-lot" },
  { value: "seasonal-release", label: "Seasonal Release" },
] as const;
const BEAN_FORMAT_CHOICES = [
  { value: "whole-bean", label: "Whole Bean" },
  { value: "ground", label: "Ground" },
  { value: "both", label: "Whole Bean & Ground" },
] as const;
const CAFFEINE_CHOICES = [
  { value: "caffeinated", label: "Caffeinated" },
  { value: "half-caff", label: "Half-Caff" },
  { value: "decaf", label: "Decaf" },
] as const;

type PackagingOption = {
  _id: string;
  title: string;
  price?: number;
  isDefault?: boolean;
};

type FormImage = {
  _key: string;
  assetId: string;
  url: string;
};

type FormWeight = {
  _key: string;
  weight: string;
  price: string;
  stock: string;
  isDefault: boolean;
};

type FormGrind = {
  _key: string;
  grindType: string;
  isDefault: boolean;
  available: boolean;
};

type FormPackaging = {
  _key: string;
  packagingId: string;
  isDefault: boolean;
  available: boolean;
};

export type ProductEditorState =
  | { mode: "create" }
  | { mode: "edit"; productId: string };

interface ProductEditorProps {
  open: boolean;
  state: ProductEditorState | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

type FormCoffeeDetails = {
  originCountry: string;
  originRegion: string;
  producer: string;
  altitudeMeters: string;
  processingMethod: string;
  flavorNotes: string;
  recommendedBrewMethods: string;
  grindRecommendation: string;
  brewRatio: string;
  roastDate: string;
  harvestYear: string;
  lotType: string;
  packageSizeGrams: string;
  beanFormat: string;
  caffeineLevel: string;
};

type FormState = {
  name: string;
  slug: string;
  description: string;
  price: string;
  discount: string;
  stock: string;
  status: "" | "new" | "hot" | "sale";
  variant: string;
  isFeatured: boolean;
  isArchived: boolean;
  categoryId: string;
  images: FormImage[];
  weights: FormWeight[];
  grinds: FormGrind[];
  packaging: FormPackaging[];
  coffee: FormCoffeeDetails;
};

function emptyCoffee(): FormCoffeeDetails {
  return {
    originCountry: "",
    originRegion: "",
    producer: "",
    altitudeMeters: "",
    processingMethod: "",
    flavorNotes: "",
    recommendedBrewMethods: "",
    grindRecommendation: "",
    brewRatio: "",
    roastDate: "",
    harvestYear: "",
    lotType: "",
    packageSizeGrams: "",
    beanFormat: "",
    caffeineLevel: "",
  };
}

function coffeeToForm(details: any): FormCoffeeDetails {
  if (!details) return emptyCoffee();
  return {
    originCountry: details.originCountry || "",
    originRegion: details.originRegion || "",
    producer: details.producer || "",
    altitudeMeters:
      typeof details.altitudeMeters === "number"
        ? String(details.altitudeMeters)
        : "",
    processingMethod: details.processingMethod || "",
    flavorNotes: (details.flavorNotes || []).join(", "),
    recommendedBrewMethods: (details.recommendedBrewMethods || []).join(", "),
    grindRecommendation: details.grindRecommendation || "",
    brewRatio: details.brewRatio || "",
    roastDate: details.roastDate || "",
    harvestYear:
      typeof details.harvestYear === "number"
        ? String(details.harvestYear)
        : "",
    lotType: details.lotType || "",
    packageSizeGrams:
      typeof details.packageSizeGrams === "number"
        ? String(details.packageSizeGrams)
        : "",
    beanFormat: details.beanFormat || "",
    caffeineLevel: details.caffeineLevel || "",
  };
}

function defaultGrinds(): FormGrind[] {
  return GRIND_CHOICES.map((g, i) => ({
    _key: makeKey("gr"),
    grindType: g.value,
    isDefault: i === 0,
    available: true,
  }));
}

function emptyForm(): FormState {
  return {
    name: "",
    slug: "",
    description: "",
    price: "0",
    discount: "0",
    stock: "0",
    status: "",
    variant: "",
    isFeatured: false,
    isArchived: false,
    categoryId: "",
    images: [],
    weights: [],
    grinds: defaultGrinds(),
    packaging: [],
    coffee: emptyCoffee(),
  };
}

function productToForm(product: any): FormState {
  return {
    name: product.name || "",
    slug: product.slug?.current || "",
    description: product.description || "",
    price: String(product.price ?? 0),
    discount: String(product.discount ?? 0),
    stock: String(product.stock ?? 0),
    status: (product.status as FormState["status"]) || "",
    variant: product.variant || "",
    isFeatured: Boolean(product.featured || product.isFeatured),
    isArchived: Boolean(product.isArchived),
    categoryId:
      product.categories?.[0]?._id || product.category?._id || "",
    images: (product.images || [])
      .map((img: any) => ({
        _key: img._key || makeKey("img"),
        assetId: img.asset?._id || img.asset?._ref || "",
        url: img.asset?.url || "",
      }))
      .filter((img: FormImage) => img.assetId),
    weights: (product.weightOptions || []).map((w: any) => ({
      _key: w._key || makeKey("wt"),
      weight: w.weight || "250G",
      price: String(w.price ?? 0),
      stock: String(w.stock ?? 0),
      isDefault: Boolean(w.isDefault),
    })),
    grinds:
      product.grindOptions?.length > 0
        ? product.grindOptions.map((g: any) => ({
            _key: g._key || makeKey("gr"),
            grindType: g.grindType,
            isDefault: Boolean(g.isDefault),
            available: g.available !== false,
          }))
        : defaultGrinds(),
    packaging: (product.packagingOptions || [])
      .map((p: any) => ({
        _key: p._key || makeKey("pk"),
        packagingId: p.packaging?._id || "",
        isDefault: Boolean(p.isDefault),
        available: p.available !== false,
      }))
      .filter((p: FormPackaging) => p.packagingId),
    coffee: coffeeToForm(product.coffeeDetails),
  };
}

export default function ProductEditor({
  open,
  state,
  categories,
  onClose,
  onSaved,
}: ProductEditorProps) {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [packagingCatalog, setPackagingCatalog] = useState<PackagingOption[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const title = state?.mode === "edit" ? "Edit product" : "Add product";

  const loadMeta = useCallback(async () => {
    try {
      const data = await safeApiCall("/api/admin/products/meta");
      setPackagingCatalog(data.packaging || []);
    } catch (error) {
      handleApiError(error, "Product catalogs");
      toast.error("Failed to load packaging options");
    }
  }, []);

  const loadProduct = useCallback(async (productId: string) => {
    setLoading(true);
    try {
      const data = await safeApiCall(`/api/admin/products?id=${productId}`);
      setForm(productToForm(data.product));
      setSlugTouched(true);
    } catch (error) {
      handleApiError(error, "Load product");
      toast.error("Failed to load product");
      onClose();
    } finally {
      setLoading(false);
    }
  }, [onClose]);

  useEffect(() => {
    if (!open || !state) return;
    setForm(emptyForm());
    setSlugTouched(false);
    loadMeta();
    if (state.mode === "edit") {
      loadProduct(state.productId);
    }
  }, [open, state, loadMeta, loadProduct]);

  const unusedWeights = useMemo(
    () => WEIGHT_CHOICES.filter((w) => !form.weights.some((x) => x.weight === w)),
    [form.weights],
  );

  const buildPayload = () => {
    const price = Number(form.price);
    const stock = Number(form.stock);
    const discount = Number(form.discount);
    if (!form.name.trim()) throw new Error("Product name is required");
    if (Number.isNaN(price) || price < 0) throw new Error("Invalid price");
    if (!Number.isInteger(stock) || stock < 0) throw new Error("Invalid stock");
    if (Number.isNaN(discount) || discount < 0) {
      throw new Error("Invalid discount");
    }

    return {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      description: form.description.trim(),
      price,
      stock,
      discount,
      status: form.status,
      variant: form.variant,
      isFeatured: form.isFeatured,
      isArchived: form.isArchived,
      categoryIds: form.categoryId ? [form.categoryId] : [],
      images: form.images.map((img) => ({
        _key: img._key,
        assetId: img.assetId,
      })),
      weightOptions: form.weights.map((w) => ({
        _key: w._key,
        weight: w.weight,
        price: Number(w.price),
        stock: parseInt(w.stock, 10) || 0,
        isDefault: w.isDefault,
      })),
      grindOptions: form.grinds.map((g) => ({
        _key: g._key,
        grindType: g.grindType,
        isDefault: g.isDefault,
        available: g.available,
      })),
      packagingOptions: form.packaging.map((p) => ({
        _key: p._key,
        packagingId: p.packagingId,
        isDefault: p.isDefault,
        available: p.available,
      })),
      coffeeDetails: {
        originCountry: form.coffee.originCountry,
        originRegion: form.coffee.originRegion,
        producer: form.coffee.producer,
        altitudeMeters: form.coffee.altitudeMeters
          ? Number(form.coffee.altitudeMeters)
          : null,
        processingMethod: form.coffee.processingMethod,
        flavorNotes: form.coffee.flavorNotes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        recommendedBrewMethods: form.coffee.recommendedBrewMethods
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        grindRecommendation: form.coffee.grindRecommendation,
        brewRatio: form.coffee.brewRatio,
        roastDate: form.coffee.roastDate || null,
        harvestYear: form.coffee.harvestYear
          ? parseInt(form.coffee.harvestYear, 10)
          : null,
        lotType: form.coffee.lotType,
        packageSizeGrams: form.coffee.packageSizeGrams
          ? Number(form.coffee.packageSizeGrams)
          : null,
        beanFormat: form.coffee.beanFormat,
        caffeineLevel: form.coffee.caffeineLevel,
      },
    };
  };

  const handleSave = async () => {
    if (!state) return;
    setSaving(true);
    try {
      const payload = buildPayload();
      if (state.mode === "create") {
        await safeApiCall("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Product created");
      } else {
        await safeApiCall("/api/admin/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: state.productId, ...payload }),
        });
        toast.success("Product updated");
      }
      onSaved();
      onClose();
    } catch (error) {
      handleApiError(error, "Save product");
      toast.error(
        error instanceof Error ? error.message : "Failed to save product",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        const data = await safeApiCall("/api/admin/products/upload", {
          method: "POST",
          body,
        });
        setForm((prev) => ({
          ...prev,
          images: [
            ...prev.images,
            {
              _key: data.image._key || makeKey("img"),
              assetId: data.image.asset._ref,
              url: data.image.url,
            },
          ],
        }));
      }
      toast.success("Image uploaded");
    } catch (error) {
      handleApiError(error, "Upload image");
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const moveImage = (index: number, dir: -1 | 1) => {
    setForm((prev) => {
      const next = [...prev.images];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, images: next };
    });
  };

  const togglePackaging = (packagingId: string, checked: boolean) => {
    setForm((prev) => {
      if (checked) {
        return {
          ...prev,
          packaging: [
            ...prev.packaging,
            {
              _key: makeKey("pk"),
              packagingId,
              isDefault: prev.packaging.length === 0,
              available: true,
            },
          ],
        };
      }
      const remaining = prev.packaging.filter(
        (p) => p.packagingId !== packagingId,
      );
      if (remaining.length && !remaining.some((p) => p.isDefault)) {
        remaining[0].isDefault = true;
      }
      return { ...prev, packaging: remaining };
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[92vh] w-full max-w-4xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Create and manage catalog products without using Content.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-shop_dark_green" />
          </div>
        ) : (
          <div className="flex-1 space-y-8 overflow-y-auto px-6 py-5">
            {/* Core */}
            <section className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="name">Product name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      name,
                      slug: slugTouched ? prev.slug : slugify(name),
                    }));
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setForm((prev) => ({
                      ...prev,
                      slug: slugify(e.target.value),
                    }));
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Roast type</Label>
                <Select
                  value={form.variant || "none"}
                  onValueChange={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      variant: v === "none" ? "" : v,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select roast" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {VARIANT_CHOICES.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
            </section>

            {/* Pricing */}
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Base price</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Discount %</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.discount}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, discount: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Base stock</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={form.stock}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, stock: e.target.value }))
                  }
                />
              </div>
            </section>

            {/* Classification */}
            <section className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={form.categoryId || "none"}
                  onValueChange={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      categoryId: v === "none" ? "" : v,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Marketing status</Label>
                <Select
                  value={form.status || "none"}
                  onValueChange={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      status:
                        v === "none" ? "" : (v as FormState["status"]),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="hot">Hot</SelectItem>
                    <SelectItem value="sale">Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-3 rounded-md border px-3 py-2">
                <Checkbox
                  checked={form.isFeatured}
                  onCheckedChange={(c) =>
                    setForm((prev) => ({
                      ...prev,
                      isFeatured: c === true,
                    }))
                  }
                />
                <span className="text-sm">Featured product</span>
              </label>
              <label className="flex items-center gap-3 rounded-md border px-3 py-2">
                <Checkbox
                  checked={form.isArchived}
                  onCheckedChange={(c) =>
                    setForm((prev) => ({
                      ...prev,
                      isArchived: c === true,
                    }))
                  }
                />
                <span className="text-sm">Archived (hidden from storefront)</span>
              </label>
            </section>

            {/* Images */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Images</Label>
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-shop_dark_green hover:underline">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Upload
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      void handleUpload(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              {form.images.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No images yet. Upload at least one for the storefront.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {form.images.map((img, index) => (
                    <div
                      key={img._key}
                      className="flex items-center gap-3 rounded-lg border p-2"
                    >
                      <div className="relative h-16 w-16 overflow-hidden rounded bg-muted">
                        {img.url ? (
                          <Image
                            src={img.url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : null}
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <span className="text-xs text-muted-foreground">
                          Image {index + 1}
                          {index === 0 ? " · primary" : ""}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => moveImage(index, -1)}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => moveImage(index, 1)}
                            disabled={index === form.images.length - 1}
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-600"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                images: prev.images.filter(
                                  (_, i) => i !== index,
                                ),
                              }))
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Weights */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Weight options</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={unusedWeights.length === 0}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      weights: [
                        ...prev.weights,
                        {
                          _key: makeKey("wt"),
                          weight: unusedWeights[0],
                          price: prev.price || "0",
                          stock: "0",
                          isDefault: prev.weights.length === 0,
                        },
                      ],
                    }))
                  }
                >
                  <Plus className="me-1 h-4 w-4" />
                  Add weight
                </Button>
              </div>
              {form.weights.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Optional. If empty, base price/stock are used.
                </p>
              ) : (
                <div className="space-y-2">
                  {form.weights.map((w) => (
                    <div
                      key={w._key}
                      className="grid grid-cols-2 gap-2 rounded-lg border p-3 sm:grid-cols-5"
                    >
                      <Select
                        value={w.weight}
                        onValueChange={(value) =>
                          setForm((prev) => ({
                            ...prev,
                            weights: prev.weights.map((item) =>
                              item._key === w._key
                                ? { ...item, weight: value }
                                : item,
                            ),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WEIGHT_CHOICES.filter(
                            (choice) =>
                              choice === w.weight ||
                              !form.weights.some((x) => x.weight === choice),
                          ).map((choice) => (
                            <SelectItem key={choice} value={choice}>
                              {choice}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="Price"
                        value={w.price}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            weights: prev.weights.map((item) =>
                              item._key === w._key
                                ? { ...item, price: e.target.value }
                                : item,
                            ),
                          }))
                        }
                      />
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        placeholder="Stock"
                        value={w.stock}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            weights: prev.weights.map((item) =>
                              item._key === w._key
                                ? { ...item, stock: e.target.value }
                                : item,
                            ),
                          }))
                        }
                      />
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={w.isDefault}
                          onCheckedChange={(c) =>
                            setForm((prev) => ({
                              ...prev,
                              weights: prev.weights.map((item) => ({
                                ...item,
                                isDefault:
                                  item._key === w._key ? c === true : false,
                              })),
                            }))
                          }
                        />
                        Default
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() =>
                          setForm((prev) => {
                            const weights = prev.weights.filter(
                              (item) => item._key !== w._key,
                            );
                            if (
                              weights.length &&
                              !weights.some((item) => item.isDefault)
                            ) {
                              weights[0].isDefault = true;
                            }
                            return { ...prev, weights };
                          })
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Grinds */}
            <section className="space-y-3">
              <Label>Grind options</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {form.grinds.map((g) => {
                  const label =
                    GRIND_CHOICES.find((x) => x.value === g.grindType)?.label ||
                    g.grindType;
                  return (
                    <div
                      key={g._key}
                      className="flex items-center justify-between rounded-lg border px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                          <label className="flex items-center gap-1.5">
                            <Checkbox
                              checked={g.available}
                              onCheckedChange={(c) =>
                                setForm((prev) => ({
                                  ...prev,
                                  grinds: prev.grinds.map((item) =>
                                    item._key === g._key
                                      ? { ...item, available: c === true }
                                      : item,
                                  ),
                                }))
                              }
                            />
                            Available
                          </label>
                          <label className="flex items-center gap-1.5">
                            <Checkbox
                              checked={g.isDefault}
                              onCheckedChange={(c) =>
                                setForm((prev) => ({
                                  ...prev,
                                  grinds: prev.grinds.map((item) => ({
                                    ...item,
                                    isDefault:
                                      item._key === g._key ? c === true : false,
                                  })),
                                }))
                              }
                            />
                            Default
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Coffee details */}
            <section className="space-y-3">
              <div>
                <Label>Coffee details</Label>
                <p className="text-xs text-muted-foreground">
                  Origin, processing, and tasting notes for the product page.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Origin country</Label>
                  <Input
                    value={form.coffee.originCountry}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        coffee: {
                          ...prev.coffee,
                          originCountry: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Origin region</Label>
                  <Input
                    value={form.coffee.originRegion}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        coffee: {
                          ...prev.coffee,
                          originRegion: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Farm / producer</Label>
                  <Input
                    value={form.coffee.producer}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        coffee: { ...prev.coffee, producer: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Altitude (m)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.coffee.altitudeMeters}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        coffee: {
                          ...prev.coffee,
                          altitudeMeters: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Processing</Label>
                  <Select
                    value={form.coffee.processingMethod || "none"}
                    onValueChange={(v) =>
                      setForm((prev) => ({
                        ...prev,
                        coffee: {
                          ...prev.coffee,
                          processingMethod: v === "none" ? "" : v,
                        },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Processing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {PROCESSING_CHOICES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Lot type</Label>
                  <Select
                    value={form.coffee.lotType || "none"}
                    onValueChange={(v) =>
                      setForm((prev) => ({
                        ...prev,
                        coffee: {
                          ...prev.coffee,
                          lotType: v === "none" ? "" : v,
                        },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Lot type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {LOT_CHOICES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs">
                    Flavor notes (comma-separated, max 6)
                  </Label>
                  <Input
                    value={form.coffee.flavorNotes}
                    placeholder="Bergamot, jasmine, honey"
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        coffee: {
                          ...prev.coffee,
                          flavorNotes: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs">
                    Recommended brew methods (comma-separated)
                  </Label>
                  <Input
                    value={form.coffee.recommendedBrewMethods}
                    placeholder="Pour over, espresso"
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        coffee: {
                          ...prev.coffee,
                          recommendedBrewMethods: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Grind recommendation</Label>
                  <Select
                    value={form.coffee.grindRecommendation || "none"}
                    onValueChange={(v) =>
                      setForm((prev) => ({
                        ...prev,
                        coffee: {
                          ...prev.coffee,
                          grindRecommendation: v === "none" ? "" : v,
                        },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Grind" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {GRIND_REC_CHOICES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Brew ratio</Label>
                  <Input
                    value={form.coffee.brewRatio}
                    placeholder="1:16"
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        coffee: { ...prev.coffee, brewRatio: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Roast date</Label>
                  <Input
                    type="date"
                    value={form.coffee.roastDate}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        coffee: { ...prev.coffee, roastDate: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Harvest year</Label>
                  <Input
                    type="number"
                    min={2000}
                    max={2100}
                    value={form.coffee.harvestYear}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        coffee: {
                          ...prev.coffee,
                          harvestYear: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Package size (g)</Label>
                  <Input
                    type="number"
                    min={50}
                    value={form.coffee.packageSizeGrams}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        coffee: {
                          ...prev.coffee,
                          packageSizeGrams: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Bean format</Label>
                  <Select
                    value={form.coffee.beanFormat || "none"}
                    onValueChange={(v) =>
                      setForm((prev) => ({
                        ...prev,
                        coffee: {
                          ...prev.coffee,
                          beanFormat: v === "none" ? "" : v,
                        },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {BEAN_FORMAT_CHOICES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Caffeine</Label>
                  <Select
                    value={form.coffee.caffeineLevel || "none"}
                    onValueChange={(v) =>
                      setForm((prev) => ({
                        ...prev,
                        coffee: {
                          ...prev.coffee,
                          caffeineLevel: v === "none" ? "" : v,
                        },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Caffeine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {CAFFEINE_CHOICES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Packaging */}
            <section className="space-y-3">
              <Label>Packaging options</Label>
              {packagingCatalog.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No packaging documents yet. Add bag types under{" "}
                  <a
                    href="/admin/packaging"
                    className="underline hover:text-shop_dark_green"
                  >
                    Packaging
                  </a>
                  .
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {packagingCatalog.map((pkg) => {
                    const selected = form.packaging.find(
                      (p) => p.packagingId === pkg._id,
                    );
                    return (
                      <div
                        key={pkg._id}
                        className="rounded-lg border px-3 py-2"
                      >
                        <label className="flex items-center gap-2 text-sm font-medium">
                          <Checkbox
                            checked={Boolean(selected)}
                            onCheckedChange={(c) =>
                              togglePackaging(pkg._id, c === true)
                            }
                          />
                          {pkg.title}
                          {typeof pkg.price === "number" ? (
                            <span className="text-xs font-normal text-muted-foreground">
                              {pkg.price === 0 ? "(Free)" : `+$${pkg.price}`}
                            </span>
                          ) : null}
                        </label>
                        {selected ? (
                          <div className="mt-2 ms-6 flex gap-3 text-xs text-muted-foreground">
                            <label className="flex items-center gap-1.5">
                              <Checkbox
                                checked={selected.available}
                                onCheckedChange={(c) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    packaging: prev.packaging.map((item) =>
                                      item.packagingId === pkg._id
                                        ? {
                                            ...item,
                                            available: c === true,
                                          }
                                        : item,
                                    ),
                                  }))
                                }
                              />
                              Available
                            </label>
                            <label className="flex items-center gap-1.5">
                              <Checkbox
                                checked={selected.isDefault}
                                onCheckedChange={(c) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    packaging: prev.packaging.map((item) => ({
                                      ...item,
                                      isDefault:
                                        item.packagingId === pkg._id
                                          ? c === true
                                          : false,
                                    })),
                                  }))
                                }
                              />
                              Default
                            </label>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving || loading}>
            {saving ? (
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="me-2 h-4 w-4" />
            )}
            {state?.mode === "edit" ? "Save product" : "Create product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
