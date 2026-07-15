import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/client";
import { requireAdminUser } from "@/lib/adminAuth";
import { invalidateBanners } from "@/lib/cache";

const LOCALES = ["en", "es", "ar"] as const;
type Locale = (typeof LOCALES)[number];

const BANNER_PROJECTION = `{
  _id,
  _createdAt,
  _updatedAt,
  title,
  description,
  badge,
  discountAmount,
  subtitle,
  priceTitle,
  price,
  weight,
  disableVideoOnMobile,
  buttonText,
  link,
  image{
    _type,
    asset->{
      _id,
      url
    }
  },
  backgroundVideo{
    _type,
    asset->{
      _id,
      url,
      mimeType,
      size,
      "duration": metadata.duration
    }
  },
  "backgroundVideoUrl": backgroundVideo.asset->url
}`;

type LocaleStrings = Partial<Record<Locale, string>>;

type BannerBody = {
  title?: LocaleStrings;
  description?: LocaleStrings;
  badge?: LocaleStrings;
  subtitle?: LocaleStrings;
  priceTitle?: LocaleStrings;
  buttonText?: LocaleStrings;
  discountAmount?: number | null;
  price?: number | null;
  weight?: number | null;
  disableVideoOnMobile?: boolean;
  link?: string | null;
  imageAssetId?: string | null;
  videoAssetId?: string | null;
};

function cleanLocaleObject(
  value: LocaleStrings | undefined,
  { allowEmpty }: { allowEmpty: boolean },
): LocaleStrings | undefined {
  if (value === undefined) return undefined;
  const next: LocaleStrings = {};
  for (const locale of LOCALES) {
    const raw = value[locale];
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (trimmed || allowEmpty) next[locale] = trimmed;
    }
  }
  return next;
}

function buildBannerFields(
  body: BannerBody,
  { forCreate }: { forCreate: boolean },
) {
  const doc: Record<string, unknown> = {};
  const unset: string[] = [];

  const title = cleanLocaleObject(body.title, { allowEmpty: false });
  if (forCreate || body.title !== undefined) {
    if (!title?.en) throw new Error("English title is required");
    doc.title = title;
  }

  const description = cleanLocaleObject(body.description, { allowEmpty: true });
  if (body.description !== undefined) {
    doc.description = description || { en: "", es: "", ar: "" };
  } else if (forCreate) {
    doc.description = { en: "", es: "", ar: "" };
  }

  const badge = cleanLocaleObject(body.badge, { allowEmpty: true });
  if (body.badge !== undefined) {
    doc.badge = badge || { en: "", es: "", ar: "" };
  } else if (forCreate) {
    doc.badge = { en: "", es: "", ar: "" };
  }

  const subtitle = cleanLocaleObject(body.subtitle, { allowEmpty: true });
  if (body.subtitle !== undefined) {
    doc.subtitle = subtitle || { en: "", es: "", ar: "" };
  } else if (forCreate) {
    doc.subtitle = { en: "", es: "", ar: "" };
  }

  const priceTitle = cleanLocaleObject(body.priceTitle, { allowEmpty: true });
  if (body.priceTitle !== undefined) {
    doc.priceTitle = priceTitle || { en: "", es: "", ar: "" };
  } else if (forCreate) {
    doc.priceTitle = { en: "", es: "", ar: "" };
  }

  const buttonText = cleanLocaleObject(body.buttonText, { allowEmpty: true });
  if (body.buttonText !== undefined) {
    doc.buttonText = buttonText || {
      en: "Shop Now",
      es: "",
      ar: "",
    };
  } else if (forCreate) {
    doc.buttonText = { en: "Shop Now", es: "", ar: "" };
  }

  if (body.discountAmount !== undefined) {
    if (body.discountAmount === null) {
      unset.push("discountAmount");
    } else if (
      typeof body.discountAmount !== "number" ||
      Number.isNaN(body.discountAmount)
    ) {
      throw new Error("discountAmount must be a number");
    } else {
      doc.discountAmount = body.discountAmount;
    }
  }

  if (body.price !== undefined) {
    if (body.price === null) {
      unset.push("price");
    } else if (
      typeof body.price !== "number" ||
      Number.isNaN(body.price) ||
      body.price < 0
    ) {
      throw new Error("price must be a number >= 0");
    } else {
      doc.price = body.price;
    }
  }

  if (forCreate || body.weight !== undefined) {
    const weight =
      body.weight === undefined || body.weight === null
        ? 100
        : body.weight;
    if (typeof weight !== "number" || Number.isNaN(weight)) {
      throw new Error("weight must be a number");
    }
    doc.weight = weight;
  }

  if (body.disableVideoOnMobile !== undefined) {
    doc.disableVideoOnMobile = Boolean(body.disableVideoOnMobile);
  } else if (forCreate) {
    doc.disableVideoOnMobile = true;
  }

  if (body.link !== undefined) {
    const link = body.link?.trim() || "";
    if (!link) {
      unset.push("link");
    } else {
      doc.link = link;
    }
  }

  if (body.imageAssetId !== undefined) {
    if (!body.imageAssetId) {
      unset.push("image");
    } else {
      doc.image = {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: body.imageAssetId,
        },
      };
    }
  }

  if (body.videoAssetId !== undefined) {
    if (!body.videoAssetId) {
      unset.push("backgroundVideo");
    } else {
      doc.backgroundVideo = {
        _type: "file",
        asset: {
          _type: "reference",
          _ref: body.videoAssetId,
        },
      };
    }
  }

  return { doc, unset };
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const search = searchParams.get("search") || "";

    if (id) {
      const banner = await writeClient.fetch(
        `*[_type == "banner" && _id == $id][0] ${BANNER_PROJECTION}`,
        { id },
      );
      if (!banner) {
        return NextResponse.json({ error: "Banner not found" }, { status: 404 });
      }
      return NextResponse.json({ banner });
    }

    const params: Record<string, unknown> = {};
    let filter = `_type == "banner"`;
    if (search) {
      filter += ` && (
        title.en match $search ||
        title.es match $search ||
        title.ar match $search ||
        subtitle.en match $search ||
        description.en match $search
      )`;
      params.search = `*${search}*`;
    }

    const banners = await writeClient.fetch(
      `*[${filter}] | order(weight asc, title.en asc) ${BANNER_PROJECTION}`,
      params,
    );

    return NextResponse.json({ banners, total: banners.length });
  } catch (error) {
    console.error("Admin banners GET failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch banners" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const body = (await req.json()) as BannerBody;
    const { doc, unset } = buildBannerFields(body, { forCreate: true });

    const created = await writeClient.create({
      _type: "banner",
      ...doc,
    });

    if (unset.length > 0) {
      await writeClient.patch(created._id).unset(unset).commit();
    }

    const banner = await writeClient.fetch(
      `*[_type == "banner" && _id == $id][0] ${BANNER_PROJECTION}`,
      { id: created._id },
    );

    await invalidateBanners();

    return NextResponse.json({ banner }, { status: 201 });
  } catch (error) {
    console.error("Admin banners POST failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create banner",
      },
      { status: 400 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const body = (await req.json()) as BannerBody & { bannerId?: string };
    if (!body.bannerId) {
      return NextResponse.json(
        { error: "bannerId is required" },
        { status: 400 },
      );
    }

    const existing = await writeClient.fetch(
      `*[_type == "banner" && _id == $id][0]{_id}`,
      { id: body.bannerId },
    );
    if (!existing) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    const { doc, unset } = buildBannerFields(body, { forCreate: false });
    let mutation = writeClient.patch(body.bannerId).set(doc);
    if (unset.length > 0) mutation = mutation.unset(unset);
    await mutation.commit();

    const banner = await writeClient.fetch(
      `*[_type == "banner" && _id == $id][0] ${BANNER_PROJECTION}`,
      { id: body.bannerId },
    );

    await invalidateBanners();

    return NextResponse.json({ banner });
  } catch (error) {
    console.error("Admin banners PATCH failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update banner",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await writeClient.fetch(
      `*[_type == "banner" && _id == $id][0]{_id}`,
      { id },
    );
    if (!existing) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    await writeClient.delete(id);
    await invalidateBanners();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin banners DELETE failed:", error);
    return NextResponse.json(
      { error: "Failed to delete banner" },
      { status: 500 },
    );
  }
}
