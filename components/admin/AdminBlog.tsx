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
  FileText,
  Tags,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import BlogBodyEditor, {
  hydratePortableTextForEditor,
  normalizePortableText,
  type PortableTextBlock,
} from "./BlogBodyEditor";

type BlogCategoryOption = {
  _id: string;
  title?: string;
  slug?: { current?: string };
  description?: string;
  postCount?: number;
};

type AdminBlogItem = {
  _id: string;
  title?: string;
  slug?: { current?: string };
  publishedAt?: string;
  isLatest?: boolean;
  body?: PortableTextBlock[];
  blogcategoryIds?: string[];
  blogcategories?: Array<{ _id: string; title?: string }>;
  mainImage?: {
    asset?: { _id?: string; url?: string };
  };
};

type PostEditorMode = { mode: "create" } | { mode: "edit"; blogId: string };
type CatEditorMode =
  | { mode: "create" }
  | { mode: "edit"; categoryId: string };

type PostFormState = {
  title: string;
  slug: string;
  publishedAt: string;
  isLatest: boolean;
  blogcategoryIds: string[];
  imageAssetId: string;
  imageUrl: string;
  body: PortableTextBlock[];
  bodyEditorKey: string;
};

type CatFormState = {
  title: string;
  slug: string;
  description: string;
};

function emptyPostForm(): PostFormState {
  return {
    title: "",
    slug: "",
    publishedAt: new Date().toISOString().slice(0, 16),
    isLatest: true,
    blogcategoryIds: [],
    imageAssetId: "",
    imageUrl: "",
    body: [],
    bodyEditorKey: `new-${Date.now()}`,
  };
}

function toDatetimeLocal(iso?: string) {
  if (!iso) return new Date().toISOString().slice(0, 16);
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 16);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function blogToForm(blog: AdminBlogItem): PostFormState {
  return {
    title: blog.title || "",
    slug: blog.slug?.current || "",
    publishedAt: toDatetimeLocal(blog.publishedAt),
    isLatest: Boolean(blog.isLatest),
    blogcategoryIds: blog.blogcategoryIds || [],
    imageAssetId: blog.mainImage?.asset?._id || "",
    imageUrl: blog.mainImage?.asset?.url || "",
    body: hydratePortableTextForEditor(
      (blog.body as PortableTextBlock[]) || [],
    ),
    bodyEditorKey: `edit-${blog._id}-${Date.now()}`,
  };
}

function emptyCatForm(): CatFormState {
  return { title: "", slug: "", description: "" };
}

export default function AdminBlog() {
  const [tab, setTab] = useState("posts");
  const [blogs, setBlogs] = useState<AdminBlogItem[]>([]);
  const [categories, setCategories] = useState<BlogCategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [postEditor, setPostEditor] = useState<PostEditorMode | null>(null);
  const [postForm, setPostForm] = useState<PostFormState>(emptyPostForm());
  const [slugTouched, setSlugTouched] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const [catEditor, setCatEditor] = useState<CatEditorMode | null>(null);
  const [catForm, setCatForm] = useState<CatFormState>(emptyCatForm());
  const [catSlugTouched, setCatSlugTouched] = useState(false);
  const [savingCat, setSavingCat] = useState(false);
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await safeApiCall(
        `/api/admin/blog?search=${encodeURIComponent(debouncedSearch)}`,
      );
      setBlogs(data.blogs || []);
    } catch (error) {
      handleApiError(error, "Blog fetch");
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await safeApiCall("/api/admin/blog-categories");
      setCategories(data.categories || []);
    } catch (error) {
      handleApiError(error, "Blog categories fetch");
      toast.error("Failed to load blog categories");
    }
  }, []);

  useEffect(() => {
    void fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const openCreatePost = () => {
    setPostForm(emptyPostForm());
    setSlugTouched(false);
    setPostEditor({ mode: "create" });
  };

  const openEditPost = async (blogId: string) => {
    setPostEditor({ mode: "edit", blogId });
    setSlugTouched(true);
    try {
      const data = await safeApiCall(`/api/admin/blog?id=${blogId}`);
      setPostForm(blogToForm(data.blog));
    } catch (error) {
      handleApiError(error, "Blog load");
      toast.error("Failed to load post");
      setPostEditor(null);
    }
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const data = await safeApiCall("/api/admin/products/upload", {
        method: "POST",
        body,
      });
      setPostForm((prev) => ({
        ...prev,
        imageAssetId: data.image.asset._ref,
        imageUrl: data.image.url,
      }));
      toast.success("Image uploaded");
    } catch (error) {
      handleApiError(error, "Blog image upload");
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSavePost = async () => {
    if (!postEditor) return;
    setSavingPost(true);
    try {
      if (!postForm.title.trim()) throw new Error("Title is required");

      const publishedAt = postForm.publishedAt
        ? new Date(postForm.publishedAt).toISOString()
        : null;

      const payload = {
        title: postForm.title.trim(),
        slug: postForm.slug.trim() || slugify(postForm.title),
        publishedAt,
        isLatest: postForm.isLatest,
        blogcategoryIds: postForm.blogcategoryIds,
        imageAssetId: postForm.imageAssetId || null,
        body: normalizePortableText(postForm.body),
      };

      if (postEditor.mode === "create") {
        await safeApiCall("/api/admin/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Post created");
      } else {
        await safeApiCall("/api/admin/blog", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blogId: postEditor.blogId,
            ...payload,
          }),
        });
        toast.success("Post updated");
      }
      setPostEditor(null);
      await fetchBlogs();
    } catch (error) {
      handleApiError(error, "Save blog");
      toast.error(
        error instanceof Error ? error.message : "Failed to save post",
      );
    } finally {
      setSavingPost(false);
    }
  };

  const handleDeletePost = async (item: AdminBlogItem) => {
    if (
      !window.confirm(
        `Delete post "${item.title}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    setDeletingPostId(item._id);
    try {
      await safeApiCall(`/api/admin/blog?id=${item._id}`, {
        method: "DELETE",
      });
      toast.success("Post deleted");
      await fetchBlogs();
    } catch (error) {
      handleApiError(error, "Delete blog");
      toast.error(
        error instanceof Error ? error.message : "Failed to delete post",
      );
    } finally {
      setDeletingPostId(null);
    }
  };

  const openCreateCat = () => {
    setCatForm(emptyCatForm());
    setCatSlugTouched(false);
    setCatEditor({ mode: "create" });
  };

  const openEditCat = (cat: BlogCategoryOption) => {
    setCatForm({
      title: cat.title || "",
      slug: cat.slug?.current || "",
      description: cat.description || "",
    });
    setCatSlugTouched(true);
    setCatEditor({ mode: "edit", categoryId: cat._id });
  };

  const handleSaveCat = async () => {
    if (!catEditor) return;
    setSavingCat(true);
    try {
      if (!catForm.title.trim()) throw new Error("Title is required");
      const payload = {
        title: catForm.title.trim(),
        slug: catForm.slug.trim() || slugify(catForm.title),
        description: catForm.description.trim(),
      };
      if (catEditor.mode === "create") {
        await safeApiCall("/api/admin/blog-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Category created");
      } else {
        await safeApiCall("/api/admin/blog-categories", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryId: catEditor.categoryId,
            ...payload,
          }),
        });
        toast.success("Category updated");
      }
      setCatEditor(null);
      await fetchCategories();
    } catch (error) {
      handleApiError(error, "Save blog category");
      toast.error(
        error instanceof Error ? error.message : "Failed to save category",
      );
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCat = async (cat: BlogCategoryOption) => {
    if (
      !window.confirm(
        `Delete category "${cat.title}"? Posts using it must be reassigned first.`,
      )
    ) {
      return;
    }
    setDeletingCatId(cat._id);
    try {
      await safeApiCall(`/api/admin/blog-categories?id=${cat._id}`, {
        method: "DELETE",
      });
      toast.success("Category deleted");
      await fetchCategories();
    } catch (error) {
      handleApiError(error, "Delete blog category");
      toast.error(
        error instanceof Error ? error.message : "Failed to delete category",
      );
    } finally {
      setDeletingCatId(null);
    }
  };

  const toggleCategory = (id: string) => {
    setPostForm((prev) => ({
      ...prev,
      blogcategoryIds: prev.blogcategoryIds.includes(id)
        ? prev.blogcategoryIds.filter((x) => x !== id)
        : [...prev.blogcategoryIds, id],
    }));
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-shop_dark_green md:text-3xl">
            Blog
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Write posts and manage blog categories without opening Studio.
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white/80">
          <TabsTrigger value="posts" className="gap-2">
            <FileText className="h-4 w-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Tags className="h-4 w-4" />
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              onClick={openCreatePost}
              className="bg-shop_dark_green hover:bg-shop_btn_dark_green"
            >
              <Plus className="mr-2 h-4 w-4" />
              New post
            </Button>
            <Input
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:max-w-xs"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => void fetchBlogs()}
              aria-label="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
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
                        <TableHead className="w-[280px]">Post</TableHead>
                        <TableHead>Categories</TableHead>
                        <TableHead>Published</TableHead>
                        <TableHead>Latest</TableHead>
                        <TableHead className="w-28">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blogs.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="py-10 text-center text-muted-foreground"
                          >
                            No posts found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        blogs.map((item) => (
                          <TableRow key={item._id}>
                            <TableCell className="max-w-[280px]">
                              <div className="flex items-center gap-3">
                                {item.mainImage?.asset?.url ? (
                                  <Image
                                    src={item.mainImage.asset.url}
                                    alt=""
                                    width={48}
                                    height={48}
                                    className="h-12 w-12 rounded object-cover"
                                  />
                                ) : (
                                  <div className="flex h-12 w-12 items-center justify-center rounded bg-shop_light_bg text-shop_dark_green/40">
                                    <FileText className="h-5 w-5" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="truncate font-medium">
                                    {item.title || "Untitled"}
                                  </div>
                                  <div className="truncate font-mono text-xs text-muted-foreground">
                                    {item.slug?.current || "—"}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {(item.blogcategories || []).length === 0 ? (
                                  <span className="text-xs text-muted-foreground">
                                    —
                                  </span>
                                ) : (
                                  item.blogcategories?.map((c) => (
                                    <Badge
                                      key={c._id}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {c.title}
                                    </Badge>
                                  ))
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {item.publishedAt
                                ? new Date(
                                    item.publishedAt,
                                  ).toLocaleDateString()
                                : "—"}
                            </TableCell>
                            <TableCell>
                              {item.isLatest ? (
                                <Badge className="bg-shop_dark_green">
                                  Latest
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  —
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => void openEditPost(item._id)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600"
                                  disabled={deletingPostId === item._id}
                                  onClick={() => void handleDeletePost(item)}
                                >
                                  {deletingPostId === item._id ? (
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
                {blogs.length === 0 ? (
                  <Card className="p-6 text-center text-sm text-muted-foreground">
                    No posts found.
                  </Card>
                ) : (
                  blogs.map((item) => (
                    <Card key={item._id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">
                            {item.title || "Untitled"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.publishedAt
                              ? new Date(
                                  item.publishedAt,
                                ).toLocaleDateString()
                              : "Unpublished"}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void openEditPost(item._id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600"
                            onClick={() => void handleDeletePost(item)}
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
        </TabsContent>

        <TabsContent value="categories" className="mt-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              onClick={openCreateCat}
              className="bg-shop_dark_green hover:bg-shop_btn_dark_green"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add category
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => void fetchCategories()}
              aria-label="Refresh categories"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Description
                  </TableHead>
                  <TableHead>Posts</TableHead>
                  <TableHead className="w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No categories yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((cat) => (
                    <TableRow key={cat._id}>
                      <TableCell className="font-medium">
                        {cat.title || "Untitled"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {cat.slug?.current || "—"}
                      </TableCell>
                      <TableCell className="hidden max-w-[240px] truncate text-sm text-muted-foreground sm:table-cell">
                        {cat.description || "—"}
                      </TableCell>
                      <TableCell>{cat.postCount ?? 0}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditCat(cat)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600"
                            disabled={deletingCatId === cat._id}
                            onClick={() => void handleDeleteCat(cat)}
                          >
                            {deletingCatId === cat._id ? (
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
        </TabsContent>
      </Tabs>

      {/* Post editor */}
      <Dialog
        open={Boolean(postEditor)}
        onOpenChange={(v) => !v && setPostEditor(null)}
      >
        <DialogContent className="flex max-h-[92vh] w-[min(960px,96vw)] max-w-5xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>
              {postEditor?.mode === "edit" ? "Edit post" : "New post"}
            </DialogTitle>
            <DialogDescription>
              Metadata and body for Sheba Cup Coffee blog content.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="blog-title">Title</Label>
                <Input
                  id="blog-title"
                  value={postForm.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setPostForm((prev) => ({
                      ...prev,
                      title,
                      slug: slugTouched ? prev.slug : slugify(title),
                    }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-slug">Slug</Label>
                <Input
                  id="blog-slug"
                  value={postForm.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setPostForm((prev) => ({
                      ...prev,
                      slug: slugify(e.target.value),
                    }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blog-published">Published at</Label>
                <Input
                  id="blog-published"
                  type="datetime-local"
                  value={postForm.publishedAt}
                  onChange={(e) =>
                    setPostForm((prev) => ({
                      ...prev,
                      publishedAt: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <Checkbox
                  id="blog-latest"
                  checked={postForm.isLatest}
                  onCheckedChange={(v) =>
                    setPostForm((prev) => ({
                      ...prev,
                      isLatest: Boolean(v),
                    }))
                  }
                />
                <Label htmlFor="blog-latest">Show in latest / featured</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categories</Label>
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No categories yet — create some in the Categories tab.
                </p>
              ) : (
                <div className="grid max-h-36 grid-cols-1 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">
                  {categories.map((cat) => (
                    <label
                      key={cat._id}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={postForm.blogcategoryIds.includes(cat._id)}
                        onCheckedChange={() => toggleCategory(cat._id)}
                      />
                      {cat.title}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Main image</Label>
              <div className="flex flex-wrap items-center gap-3">
                {postForm.imageUrl ? (
                  <Image
                    src={postForm.imageUrl}
                    alt=""
                    width={120}
                    height={80}
                    className="h-20 w-[120px] rounded object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-[120px] items-center justify-center rounded bg-shop_light_bg text-xs text-muted-foreground">
                    No image
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() =>
                    document.getElementById("blog-main-image")?.click()
                  }
                >
                  {uploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Upload
                </Button>
                <input
                  id="blog-main-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    void handleImageUpload(e.target.files?.[0] || null);
                    e.target.value = "";
                  }}
                />
                {postForm.imageAssetId ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() =>
                      setPostForm((prev) => ({
                        ...prev,
                        imageAssetId: "",
                        imageUrl: "",
                      }))
                    }
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Body</Label>
              <BlogBodyEditor
                editorKey={postForm.bodyEditorKey}
                initialValue={postForm.body}
                onChange={(body) =>
                  setPostForm((prev) => ({ ...prev, body }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t px-6 py-4">
            <Button variant="outline" onClick={() => setPostEditor(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleSavePost()}
              disabled={savingPost}
              className="bg-shop_dark_green hover:bg-shop_btn_dark_green"
            >
              {savingPost ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save post
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category editor */}
      <Dialog
        open={Boolean(catEditor)}
        onOpenChange={(v) => !v && setCatEditor(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {catEditor?.mode === "edit"
                ? "Edit category"
                : "Add category"}
            </DialogTitle>
            <DialogDescription>
              Blog categories used to group posts on the storefront.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bcat-title">Title</Label>
              <Input
                id="bcat-title"
                value={catForm.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setCatForm((prev) => ({
                    ...prev,
                    title,
                    slug: catSlugTouched ? prev.slug : slugify(title),
                  }));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bcat-slug">Slug</Label>
              <Input
                id="bcat-slug"
                value={catForm.slug}
                onChange={(e) => {
                  setCatSlugTouched(true);
                  setCatForm((prev) => ({
                    ...prev,
                    slug: slugify(e.target.value),
                  }));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bcat-desc">Description</Label>
              <Textarea
                id="bcat-desc"
                rows={3}
                value={catForm.description}
                onChange={(e) =>
                  setCatForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCatEditor(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => void handleSaveCat()}
                disabled={savingCat}
                className="bg-shop_dark_green hover:bg-shop_btn_dark_green"
              >
                {savingCat ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
