"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Loader2,
  Package2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { safeApiCall, handleApiError } from "./apiHelpers";
import { slugify } from "./productEditorUtils";

type AdminPackagingItem = {
  _id: string;
  title?: string;
  slug?: { current?: string };
  description?: string;
  price?: number;
  default?: boolean;
  productCount?: number;
  image?: {
    asset?: { _id?: string; url?: string };
  };
};

type EditorMode = { mode: "create" } | { mode: "edit"; packagingId: string };

type FormState = {
  title: string;
  slug: string;
  description: string;
  price: string;
  default: boolean;
  imageAssetId: string;
  imageUrl: string;
};

function emptyForm(): FormState {
  return {
    title: "",
    slug: "",
    description: "",
    price: "0",
    default: false,
    imageAssetId: "",
    imageUrl: "",
  };
}

function packagingToForm(packaging: AdminPackagingItem): FormState {
  return {
    title: packaging.title || "",
    slug: packaging.slug?.current || "",
    description: packaging.description || "",
    price: typeof packaging.price === "number" ? String(packaging.price) : "0",
    default: Boolean(packaging.default),
    imageAssetId: packaging.image?.asset?._id || "",
    imageUrl: packaging.image?.asset?.url || "",
  };
}

export default function AdminPackaging() {
  const [packaging, setPackaging] = useState<AdminPackagingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editor, setEditor] = useState<EditorMode | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchPackaging = useCallback(async () => {
    setLoading(true);
    try {
      const data = await safeApiCall(
        `/api/admin/packaging?search=${encodeURIComponent(debouncedSearch)}`,
      );
      setPackaging(data.packaging || []);
    } catch (error) {
      handleApiError(error, "Packaging fetch");
      toast.error("Failed to load packaging");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchPackaging();
  }, [fetchPackaging]);

  const openCreate = () => {
    setForm(emptyForm());
    setSlugTouched(false);
    setEditor({ mode: "create" });
  };

  const openEdit = async (packagingId: string) => {
    setEditor({ mode: "edit", packagingId });
    setSlugTouched(true);
    try {
      const data = await safeApiCall(`/api/admin/packaging?id=${packagingId}`);
      setForm(packagingToForm(data.packaging));
    } catch (error) {
      handleApiError(error, "Packaging load");
      toast.error("Failed to load packaging");
      setEditor(null);
    }
  };

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const data = await safeApiCall("/api/admin/products/upload", {
        method: "POST",
        body,
      });
      setForm((prev) => ({
        ...prev,
        imageAssetId: data.image.asset._ref,
        imageUrl: data.image.url,
      }));
      toast.success("Image uploaded");
    } catch (error) {
      handleApiError(error, "Packaging image upload");
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);
    try {
      if (!form.title.trim()) throw new Error("Title is required");
      const price = form.price.trim() === "" ? 0 : Number(form.price);
      if (Number.isNaN(price) || price < 0) {
        throw new Error("Price must be a number >= 0");
      }

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        description: form.description.trim(),
        price,
        default: form.default,
        imageAssetId: form.imageAssetId || null,
      };

      if (editor.mode === "create") {
        await safeApiCall("/api/admin/packaging", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Packaging created");
      } else {
        await safeApiCall("/api/admin/packaging", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            packagingId: editor.packagingId,
            ...payload,
          }),
        });
        toast.success("Packaging updated");
      }
      setEditor(null);
      await fetchPackaging();
    } catch (error) {
      handleApiError(error, "Save packaging");
      toast.error(
        error instanceof Error ? error.message : "Failed to save packaging",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: AdminPackagingItem) => {
    if (
      !window.confirm(
        `Delete packaging "${item.title}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    setDeletingId(item._id);
    try {
      await safeApiCall(`/api/admin/packaging?id=${item._id}`, {
        method: "DELETE",
      });
      toast.success("Packaging deleted");
      await fetchPackaging();
    } catch (error) {
      handleApiError(error, "Delete packaging");
      const message =
        error instanceof Error ? error.message : "Failed to delete packaging";
      const match = message.match(/\{.*"error"\s*:\s*"([^"]+)"/);
      toast.error(match?.[1] || message);
    } finally {
      setDeletingId(null);
    }
  };

  const imageOrIcon = (item: AdminPackagingItem, size: "sm" | "md") => {
    const classes =
      size === "sm" ? "relative h-10 w-10" : "relative h-12 w-12";
    const imageSize = size === "sm" ? "40px" : "48px";
    return (
      <div className={`${classes} overflow-hidden rounded-md bg-muted`}>
        {item.image?.asset?.url ? (
          <Image
            src={item.image.asset.url}
            alt=""
            fill
            className="object-cover"
            sizes={imageSize}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Package2 className="h-4 w-4" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Packaging</h3>
          <p className="text-xs text-muted-foreground">
            Create and manage packaging options for products.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button onClick={openCreate}>
            <Plus className="me-2 h-4 w-4" />
            Add packaging
          </Button>
          <Input
            placeholder="Search packaging..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-52"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchPackaging()}
            aria-label="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-shop_dark_green" />
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[240px]">Packaging</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="w-24">Products</TableHead>
                    <TableHead className="w-36">Additional cost</TableHead>
                    <TableHead className="w-28">Default</TableHead>
                    <TableHead className="w-28">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packaging.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-10 text-center text-muted-foreground"
                      >
                        No packaging options found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    packaging.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="max-w-[240px]">
                          <div className="flex items-center gap-3">
                            {imageOrIcon(item, "sm")}
                            <div className="min-w-0 flex-1">
                              <div className="truncate font-medium">
                                {item.title || "Untitled"}
                              </div>
                              {item.description ? (
                                <div
                                  className="truncate text-xs text-muted-foreground"
                                  title={item.description}
                                >
                                  {item.description}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {item.slug?.current || "—"}
                        </TableCell>
                        <TableCell>{item.productCount ?? 0}</TableCell>
                        <TableCell>
                          {typeof item.price === "number" ? `+$${item.price}` : "—"}
                        </TableCell>
                        <TableCell>
                          {item.default ? (
                            <Badge>Default</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEdit(item._id)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600"
                              disabled={deletingId === item._id}
                              onClick={() => handleDelete(item)}
                            >
                              {deletingId === item._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>

          <div className="grid gap-3 md:hidden">
            {packaging.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">
                No packaging options found.
              </Card>
            ) : (
              packaging.map((item) => (
                <Card key={item._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {imageOrIcon(item, "md")}
                      <div>
                        <p className="font-medium">{item.title || "Untitled"}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.productCount ?? 0} products · +$
                          {item.price ?? 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(item._id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600"
                        disabled={deletingId === item._id}
                        onClick={() => handleDelete(item)}
                      >
                        {deletingId === item._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      <Dialog open={Boolean(editor)} onOpenChange={(v) => !v && setEditor(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editor?.mode === "edit" ? "Edit packaging" : "Add packaging"}
            </DialogTitle>
            <DialogDescription>
              Packaging options can add a cost to a product.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="packaging-title">Title</Label>
              <Input
                id="packaging-title"
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    title,
                    slug: slugTouched ? prev.slug : slugify(title),
                  }));
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="packaging-slug">Slug</Label>
              <Input
                id="packaging-slug"
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
              <Label htmlFor="packaging-description">Description</Label>
              <textarea
                id="packaging-description"
                className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="packaging-price">Additional cost</Label>
              <Input
                id="packaging-price"
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, price: e.target.value }))
                }
              />
            </div>
            <label className="flex items-center gap-3 rounded-md border px-3 py-2">
              <Checkbox
                checked={form.default}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, default: checked === true }))
                }
              />
              <span className="text-sm">Default packaging</span>
            </label>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Image</Label>
                <div className="flex items-center gap-2">
                  {form.imageAssetId ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          imageAssetId: "",
                          imageUrl: "",
                        }))
                      }
                    >
                      Remove
                    </Button>
                  ) : null}
                  <label className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-shop_dark_green hover:underline">
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        void handleUpload(e.target.files?.[0] || null);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
              {form.imageUrl ? (
                <div className="relative h-32 w-full overflow-hidden rounded-md border bg-muted">
                  <Image
                    src={form.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No image yet.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditor(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="me-2 h-4 w-4" />
              )}
              {editor?.mode === "edit" ? "Save" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
