"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { safeApiCall, handleApiError } from "./apiHelpers";

type Locale = "en" | "es" | "ar";
type LocaleStrings = Record<Locale, string>;

type AdminBanner = {
  _id: string;
  title?: Partial<LocaleStrings>;
  description?: Partial<LocaleStrings>;
  badge?: Partial<LocaleStrings>;
  subtitle?: Partial<LocaleStrings>;
  priceTitle?: Partial<LocaleStrings>;
  buttonText?: Partial<LocaleStrings>;
  discountAmount?: number;
  price?: number;
  weight?: number;
  disableVideoOnMobile?: boolean;
  link?: string;
  image?: {
    asset?: { _id?: string; url?: string };
  };
  backgroundVideo?: {
    asset?: {
      _id?: string;
      url?: string;
      mimeType?: string;
      size?: number;
      duration?: number;
    };
  };
  backgroundVideoUrl?: string;
};

type EditorMode = { mode: "create" } | { mode: "edit"; bannerId: string };

type FormState = {
  title: LocaleStrings;
  description: LocaleStrings;
  badge: LocaleStrings;
  subtitle: LocaleStrings;
  priceTitle: LocaleStrings;
  buttonText: LocaleStrings;
  discountAmount: string;
  price: string;
  weight: string;
  disableVideoOnMobile: boolean;
  link: string;
  imageAssetId: string;
  imageUrl: string;
  videoAssetId: string;
  videoUrl: string;
};

const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "es", label: "ES" },
  { id: "ar", label: "AR" },
];

function emptyLocale(): LocaleStrings {
  return { en: "", es: "", ar: "" };
}

function toLocale(value?: Partial<LocaleStrings>): LocaleStrings {
  return {
    en: value?.en || "",
    es: value?.es || "",
    ar: value?.ar || "",
  };
}

function emptyForm(): FormState {
  return {
    title: emptyLocale(),
    description: emptyLocale(),
    badge: emptyLocale(),
    subtitle: emptyLocale(),
    priceTitle: emptyLocale(),
    buttonText: { en: "Shop Now", es: "", ar: "" },
    discountAmount: "",
    price: "",
    weight: "100",
    disableVideoOnMobile: true,
    link: "/shop",
    imageAssetId: "",
    imageUrl: "",
    videoAssetId: "",
    videoUrl: "",
  };
}

function bannerToForm(banner: AdminBanner): FormState {
  return {
    title: toLocale(banner.title),
    description: toLocale(banner.description),
    badge: toLocale(banner.badge),
    subtitle: toLocale(banner.subtitle),
    priceTitle: toLocale(banner.priceTitle),
    buttonText: {
      en: banner.buttonText?.en || "Shop Now",
      es: banner.buttonText?.es || "",
      ar: banner.buttonText?.ar || "",
    },
    discountAmount:
      typeof banner.discountAmount === "number"
        ? String(banner.discountAmount)
        : "",
    price: typeof banner.price === "number" ? String(banner.price) : "",
    weight: typeof banner.weight === "number" ? String(banner.weight) : "100",
    disableVideoOnMobile: banner.disableVideoOnMobile !== false,
    link: banner.link || "",
    imageAssetId: banner.image?.asset?._id || "",
    imageUrl: banner.image?.asset?.url || "",
    videoAssetId: banner.backgroundVideo?.asset?._id || "",
    videoUrl:
      banner.backgroundVideoUrl || banner.backgroundVideo?.asset?.url || "",
  };
}

function setLocaleField(
  form: FormState,
  field: keyof Pick<
    FormState,
    "title" | "description" | "badge" | "subtitle" | "priceTitle" | "buttonText"
  >,
  locale: Locale,
  value: string,
): FormState {
  return {
    ...form,
    [field]: {
      ...form[field],
      [locale]: value,
    },
  };
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editor, setEditor] = useState<EditorMode | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [localeTab, setLocaleTab] = useState<Locale>("en");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await safeApiCall(
        `/api/admin/banners?search=${encodeURIComponent(debouncedSearch)}`,
      );
      setBanners(data.banners || []);
    } catch (error) {
      handleApiError(error, "Banners fetch");
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    void fetchBanners();
  }, [fetchBanners]);

  const openCreate = () => {
    setForm(emptyForm());
    setLocaleTab("en");
    setEditor({ mode: "create" });
  };

  const openEdit = async (bannerId: string) => {
    setEditor({ mode: "edit", bannerId });
    setLocaleTab("en");
    try {
      const data = await safeApiCall(`/api/admin/banners?id=${bannerId}`);
      setForm(bannerToForm(data.banner));
    } catch (error) {
      handleApiError(error, "Banner load");
      toast.error("Failed to load banner");
      setEditor(null);
    }
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    setUploadingImage(true);
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
      handleApiError(error, "Banner image upload");
      toast.error(
        error instanceof Error ? error.message : "Image upload failed",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVideoUpload = async (file: File | null) => {
    if (!file) return;
    setUploadingVideo(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const data = await safeApiCall("/api/admin/banners/upload-video", {
        method: "POST",
        body,
      });
      setForm((prev) => ({
        ...prev,
        videoAssetId: data.video.asset._ref,
        videoUrl: data.video.url,
      }));
      toast.success("Video uploaded");
    } catch (error) {
      handleApiError(error, "Banner video upload");
      toast.error(
        error instanceof Error ? error.message : "Video upload failed",
      );
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);
    try {
      if (!form.title.en.trim()) {
        throw new Error("English title is required");
      }

      const weight =
        form.weight.trim() === "" ? 100 : Number(form.weight);
      if (Number.isNaN(weight)) {
        throw new Error("Weight must be a number");
      }

      const discountAmount =
        form.discountAmount.trim() === ""
          ? null
          : Number(form.discountAmount);
      if (
        discountAmount !== null &&
        (Number.isNaN(discountAmount) || discountAmount < 0)
      ) {
        throw new Error("Discount amount must be a number >= 0");
      }

      const price =
        form.price.trim() === "" ? null : Number(form.price);
      if (price !== null && (Number.isNaN(price) || price < 0)) {
        throw new Error("Price must be a number >= 0");
      }

      const payload = {
        title: form.title,
        description: form.description,
        badge: form.badge,
        subtitle: form.subtitle,
        priceTitle: form.priceTitle,
        buttonText: form.buttonText,
        discountAmount,
        price,
        weight,
        disableVideoOnMobile: form.disableVideoOnMobile,
        link: form.link.trim() || null,
        imageAssetId: form.imageAssetId || null,
        videoAssetId: form.videoAssetId || null,
      };

      if (editor.mode === "create") {
        await safeApiCall("/api/admin/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Banner created");
      } else {
        await safeApiCall("/api/admin/banners", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bannerId: editor.bannerId,
            ...payload,
          }),
        });
        toast.success("Banner updated");
      }
      setEditor(null);
      await fetchBanners();
    } catch (error) {
      handleApiError(error, "Save banner");
      toast.error(
        error instanceof Error ? error.message : "Failed to save banner",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: AdminBanner) => {
    const label = item.title?.en || item._id;
    if (!window.confirm(`Delete banner "${label}"? This cannot be undone.`)) {
      return;
    }
    setDeletingId(item._id);
    try {
      await safeApiCall(`/api/admin/banners?id=${item._id}`, {
        method: "DELETE",
      });
      toast.success("Banner deleted");
      if (editor?.mode === "edit" && editor.bannerId === item._id) {
        setEditor(null);
      }
      await fetchBanners();
    } catch (error) {
      handleApiError(error, "Delete banner");
      toast.error(
        error instanceof Error ? error.message : "Failed to delete banner",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Banners"
        description="Homepage carousel slides — copy, media, order, and CTAs."
        actions={
          <>
            <Button onClick={openCreate}>
              <Plus className="me-2 h-4 w-4" />
              Add banner
            </Button>
            <Button
              variant="outline"
              onClick={() => void fetchBanners()}
              disabled={loading}
            >
              <RefreshCw
                className={cn("me-2 h-4 w-4", loading && "animate-spin")}
              />
              Refresh
            </Button>
          </>
        }
      />

      <Input
        placeholder="Search title, subtitle, description…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-shop_dark_green" />
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Media</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">Weight</TableHead>
                <TableHead className="hidden md:table-cell">Price</TableHead>
                <TableHead className="hidden lg:table-cell">CTA</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    <ImageIcon className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    No banners yet. Create one for the homepage carousel.
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div className="relative h-12 w-16 overflow-hidden rounded-md bg-muted">
                        {item.image?.asset?.url ? (
                          <Image
                            src={item.image.asset.url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground">
                            {item.backgroundVideoUrl ||
                            item.backgroundVideo?.asset?.url ? (
                              <Video className="h-4 w-4" />
                            ) : (
                              <ImageIcon className="h-4 w-4" />
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {item.title?.en || "Untitled"}
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.badge?.en ? (
                          <Badge variant="outline" className="shadow-none">
                            {item.badge.en}
                          </Badge>
                        ) : null}
                        {(item.backgroundVideoUrl ||
                          item.backgroundVideo?.asset?.url) && (
                          <Badge
                            variant="outline"
                            className="shadow-none text-sky-700"
                          >
                            Video
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {item.weight ?? 100}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {typeof item.price === "number"
                        ? `$${item.price}`
                        : "—"}
                    </TableCell>
                    <TableCell className="hidden max-w-[160px] truncate text-sm text-muted-foreground lg:table-cell">
                      {item.buttonText?.en || "Shop Now"}
                      {item.link ? ` → ${item.link}` : ""}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void openEdit(item._id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          disabled={deletingId === item._id}
                          onClick={() => void handleDelete(item)}
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
      )}

      <Dialog
        open={Boolean(editor)}
        onOpenChange={(open) => !open && setEditor(null)}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editor?.mode === "create" ? "New banner" : "Edit banner"}
            </DialogTitle>
            <DialogDescription>
              Localized copy uses EN / ES / AR. Lower weight appears earlier in
              the carousel.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 text-sm">
            <section className="space-y-3">
              <h3 className="font-medium text-shop_dark_green">Media</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Banner image</Label>
                  <div className="relative h-36 overflow-hidden rounded-md border bg-muted">
                    {form.imageUrl ? (
                      <Image
                        src={form.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="320px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-8 w-8 opacity-40" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) =>
                          void handleImageUpload(e.target.files?.[0] || null)
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingImage}
                        asChild
                      >
                        <span>
                          {uploadingImage ? (
                            <Loader2 className="me-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="me-2 h-4 w-4" />
                          )}
                          Upload image
                        </span>
                      </Button>
                    </label>
                    {form.imageAssetId ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
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
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Background video (optional)</Label>
                  <div className="flex h-36 items-center justify-center overflow-hidden rounded-md border bg-muted">
                    {form.videoUrl ? (
                      <video
                        src={form.videoUrl}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        controls
                      />
                    ) : (
                      <Video className="h-8 w-8 text-muted-foreground opacity-40" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    MP4 or WebM, max 8MB and 15 seconds.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <label>
                      <input
                        type="file"
                        accept="video/mp4,video/webm"
                        className="hidden"
                        onChange={(e) =>
                          void handleVideoUpload(e.target.files?.[0] || null)
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingVideo}
                        asChild
                      >
                        <span>
                          {uploadingVideo ? (
                            <Loader2 className="me-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="me-2 h-4 w-4" />
                          )}
                          Upload video
                        </span>
                      </Button>
                    </label>
                    {form.videoAssetId ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            videoAssetId: "",
                            videoUrl: "",
                          }))
                        }
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Checkbox
                      id="disableVideoOnMobile"
                      checked={form.disableVideoOnMobile}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({
                          ...prev,
                          disableVideoOnMobile: Boolean(checked),
                        }))
                      }
                    />
                    <Label htmlFor="disableVideoOnMobile" className="font-normal">
                      Disable video on mobile
                    </Label>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-medium text-shop_dark_green">
                CTA & ordering
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="weight">Order weight</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={form.weight}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, weight: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="link">Link</Label>
                  <Input
                    id="link"
                    placeholder="/shop"
                    value={form.link}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, link: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="price">Starting price</Label>
                  <Input
                    id="price"
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
                  <Label htmlFor="discountAmount">Discount amount %</Label>
                  <Input
                    id="discountAmount"
                    type="number"
                    min={0}
                    value={form.discountAmount}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        discountAmount: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-medium text-shop_dark_green">
                Localized copy
              </h3>
              <Tabs
                value={localeTab}
                onValueChange={(value) => setLocaleTab(value as Locale)}
              >
                <TabsList>
                  {LOCALES.map((locale) => (
                    <TabsTrigger key={locale.id} value={locale.id}>
                      {locale.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {LOCALES.map((locale) => (
                  <TabsContent
                    key={locale.id}
                    value={locale.id}
                    className="space-y-3 pt-2"
                  >
                    <div className="space-y-1.5">
                      <Label>
                        Title{locale.id === "en" ? " *" : ""}
                      </Label>
                      <Input
                        value={form.title[locale.id]}
                        onChange={(e) =>
                          setForm((prev) =>
                            setLocaleField(
                              prev,
                              "title",
                              locale.id,
                              e.target.value,
                            ),
                          )
                        }
                        dir={locale.id === "ar" ? "rtl" : "ltr"}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Subtitle</Label>
                      <Input
                        value={form.subtitle[locale.id]}
                        onChange={(e) =>
                          setForm((prev) =>
                            setLocaleField(
                              prev,
                              "subtitle",
                              locale.id,
                              e.target.value,
                            ),
                          )
                        }
                        dir={locale.id === "ar" ? "rtl" : "ltr"}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Description</Label>
                      <Textarea
                        rows={3}
                        value={form.description[locale.id]}
                        onChange={(e) =>
                          setForm((prev) =>
                            setLocaleField(
                              prev,
                              "description",
                              locale.id,
                              e.target.value,
                            ),
                          )
                        }
                        dir={locale.id === "ar" ? "rtl" : "ltr"}
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Badge</Label>
                        <Input
                          value={form.badge[locale.id]}
                          onChange={(e) =>
                            setForm((prev) =>
                              setLocaleField(
                                prev,
                                "badge",
                                locale.id,
                                e.target.value,
                              ),
                            )
                          }
                          dir={locale.id === "ar" ? "rtl" : "ltr"}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Price title</Label>
                        <Input
                          value={form.priceTitle[locale.id]}
                          placeholder="Starting at"
                          onChange={(e) =>
                            setForm((prev) =>
                              setLocaleField(
                                prev,
                                "priceTitle",
                                locale.id,
                                e.target.value,
                              ),
                            )
                          }
                          dir={locale.id === "ar" ? "rtl" : "ltr"}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Button text</Label>
                      <Input
                        value={form.buttonText[locale.id]}
                        onChange={(e) =>
                          setForm((prev) =>
                            setLocaleField(
                              prev,
                              "buttonText",
                              locale.id,
                              e.target.value,
                            ),
                          )
                        }
                        dir={locale.id === "ar" ? "rtl" : "ltr"}
                      />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </section>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setEditor(null)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={() => void handleSave()} disabled={saving}>
                {saving ? (
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="me-2 h-4 w-4" />
                )}
                Save banner
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
