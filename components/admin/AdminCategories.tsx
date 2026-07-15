"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Upload,
  Tags,
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
import AdminPageHeader from "@/components/admin/AdminPageHeader";

type AdminCategory = {
  _id: string;
  _createdAt?: string;
  title?: string;
  slug?: { current?: string };
  description?: string;
  range?: number;
  featured?: boolean;
  productCount?: number;
  image?: {
    asset?: { _id?: string; url?: string };
  };
};

type EditorMode = { mode: "create" } | { mode: "edit"; categoryId: string };

type FormState = {
  title: string;
  slug: string;
  description: string;
  range: string;
  featured: boolean;
  imageAssetId: string;
  imageUrl: string;
};

function emptyForm(): FormState {
  return {
    title: "",
    slug: "",
    description: "",
    range: "",
    featured: false,
    imageAssetId: "",
    imageUrl: "",
  };
}

function categoryToForm(category: AdminCategory): FormState {
  return {
    title: category.title || "",
    slug: category.slug?.current || "",
    description: category.description || "",
    range:
      typeof category.range === "number" ? String(category.range) : "",
    featured: Boolean(category.featured),
    imageAssetId: category.image?.asset?._id || "",
    imageUrl: category.image?.asset?.url || "",
  };
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
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

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await safeApiCall(
        `/api/admin/categories?search=${encodeURIComponent(debouncedSearch)}`,
      );
      setCategories(data.categories || []);
    } catch (error) {
      handleApiError(error, "Categories fetch");
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setForm(emptyForm());
    setSlugTouched(false);
    setEditor({ mode: "create" });
  };

  const openEdit = async (categoryId: string) => {
    setEditor({ mode: "edit", categoryId });
    setSlugTouched(true);
    try {
      const data = await safeApiCall(`/api/admin/categories?id=${categoryId}`);
      setForm(categoryToForm(data.category));
    } catch (error) {
      handleApiError(error, "Category load");
      toast.error("Failed to load category");
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
      handleApiError(error, "Category image upload");
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
      const rangeValue =
        form.range.trim() === "" ? null : Number(form.range);
      if (
        rangeValue !== null &&
        (Number.isNaN(rangeValue) || rangeValue < 0)
      ) {
        throw new Error("Range must be a number >= 0");
      }

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        description: form.description.trim(),
        range: rangeValue,
        featured: form.featured,
        imageAssetId: form.imageAssetId || null,
      };

      if (editor.mode === "create") {
        await safeApiCall("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Category created");
      } else {
        await safeApiCall("/api/admin/categories", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryId: editor.categoryId,
            ...payload,
          }),
        });
        toast.success("Category updated");
      }
      setEditor(null);
      await fetchCategories();
    } catch (error) {
      handleApiError(error, "Save category");
      toast.error(
        error instanceof Error ? error.message : "Failed to save category",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: AdminCategory) => {
    if (
      !window.confirm(
        `Delete category "${category.title}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    setDeletingId(category._id);
    try {
      await safeApiCall(`/api/admin/categories?id=${category._id}`, {
        method: "DELETE",
      });
      toast.success("Category deleted");
      await fetchCategories();
    } catch (error) {
      handleApiError(error, "Delete category");
      const message =
        error instanceof Error ? error.message : "Failed to delete category";
      // Extract nested JSON error if present
      const match = message.match(/\{.*"error"\s*:\s*"([^"]+)"/);
      toast.error(match?.[1] || message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Categories"
        description="Organize the storefront catalog into browsable groups."
        actions={
          <>
            <Button onClick={openCreate}>
              <Plus className="me-2 h-4 w-4" />
              Add category
            </Button>
            <Button variant="outline" onClick={() => fetchCategories()}>
              <RefreshCw className="me-2 h-4 w-4" />
              Refresh
            </Button>
          </>
        }
      />

      <Input
        placeholder="Search categories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

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
                    <TableHead>Category</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Range</TableHead>
                    <TableHead className="w-28">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-10 text-center text-muted-foreground"
                      >
                        No categories found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow key={category._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                              {category.image?.asset?.url ? (
                                <Image
                                  src={category.image.asset.url}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                  <Tags className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">
                                {category.title || "Untitled"}
                              </div>
                              {category.description ? (
                                <div className="line-clamp-1 text-xs text-muted-foreground">
                                  {category.description}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {category.slug?.current || "—"}
                        </TableCell>
                        <TableCell>{category.productCount ?? 0}</TableCell>
                        <TableCell>
                          {category.featured ? (
                            <Badge>Featured</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {typeof category.range === "number"
                            ? category.range
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEdit(category._id)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600"
                              disabled={deletingId === category._id}
                              onClick={() => handleDelete(category)}
                            >
                              {deletingId === category._id ? (
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
            {categories.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">
                No categories found.
              </Card>
            ) : (
              categories.map((category) => (
                <Card key={category._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                        {category.image?.asset?.url ? (
                          <Image
                            src={category.image.asset.url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Tags className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {category.title || "Untitled"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {category.productCount ?? 0} products
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(category._id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600"
                        onClick={() => handleDelete(category)}
                      >
                        <Trash2 className="h-4 w-4" />
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
              {editor?.mode === "edit" ? "Edit category" : "Add category"}
            </DialogTitle>
            <DialogDescription>
              Categories power filters and product grouping on the storefront.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-title">Title</Label>
              <Input
                id="cat-title"
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
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
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
              <Label htmlFor="cat-description">Description</Label>
              <textarea
                id="cat-description"
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
              <Label htmlFor="cat-range">Range (starting from)</Label>
              <Input
                id="cat-range"
                type="number"
                min={0}
                value={form.range}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, range: e.target.value }))
                }
              />
            </div>
            <label className="flex items-center gap-3 rounded-md border px-3 py-2">
              <Checkbox
                checked={form.featured}
                onCheckedChange={(c) =>
                  setForm((prev) => ({ ...prev, featured: c === true }))
                }
              />
              <span className="text-sm">Featured category</span>
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
