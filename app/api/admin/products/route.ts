import { NextRequest, NextResponse } from "next/server";
import { readClient, writeClient } from "@/sanity/lib/client";
import { makeKey, requireAdminUser, slugify } from "@/lib/adminAuth";
import { invalidateProducts } from "@/lib/cache";

const WEIGHTS = new Set(["125G", "250G", "500G", "1KG"]);
const GRINDS = new Set(["whole-bean", "cafetiere", "filter", "espresso"]);
const STATUSES = new Set(["new", "hot", "sale", ""]);
const VARIANTS = new Set([
  "Light Roast",
  "Medium Roast",
  "Dark Roast",
  "Extra Dark",
]);
const PROCESSING = new Set([
  "washed",
  "natural",
  "honey",
  "anaerobic",
  "experimental",
  "",
]);
const GRIND_RECS = new Set([
  "extra-fine",
  "fine",
  "medium-fine",
  "medium",
  "coarse",
  "",
]);
const LOT_TYPES = new Set([
  "core-blend",
  "single-origin",
  "micro-lot",
  "seasonal-release",
  "",
]);
const BEAN_FORMATS = new Set(["whole-bean", "ground", "both", ""]);
const CAFFEINE = new Set(["caffeinated", "half-caff", "decaf", ""]);

const PRODUCT_DETAIL_PROJECTION = `{
  _id,
  _type,
  _createdAt,
  _updatedAt,
  _rev,
  name,
  slug,
  description,
  price,
  discount,
  stock,
  images[]{
    _key,
    _type,
    asset->{
      _id,
      url
    }
  },
  categories[]->{
    _id,
    title,
    slug
  },
  status,
  variant,
  isFeatured,
  isArchived,
  coffeeDetails{
    originCountry,
    originRegion,
    producer,
    altitudeMeters,
    processingMethod,
    flavorNotes,
    recommendedBrewMethods,
    grindRecommendation,
    brewRatio,
    roastDate,
    harvestYear,
    lotType,
    packageSizeGrams,
    beanFormat,
    caffeineLevel
  },
  weightOptions[]{
    _key,
    weight,
    price,
    isDefault,
    stock
  },
  grindOptions[]{
    _key,
    grindType,
    isDefault,
    available
  },
  packagingOptions[]{
    _key,
    isDefault,
    available,
    packaging->{
      _id,
      title,
      price
    }
  }
}`;

function transformProduct(product: Record<string, any>) {
  return {
    ...product,
    category: product.categories?.[0]
      ? {
          _id: product.categories[0]._id,
          name: product.categories[0].title,
          title: product.categories[0].title,
          slug: product.categories[0].slug,
            }
          : null,
        featured: product.isFeatured,
      };
    }

type WeightInput = {
  _key?: string;
  weight: string;
  price: number;
  isDefault?: boolean;
  stock?: number;
};

type GrindInput = {
  _key?: string;
  grindType: string;
  isDefault?: boolean;
  available?: boolean;
};

type CoffeeDetailsInput = {
  originCountry?: string;
  originRegion?: string;
  producer?: string;
  altitudeMeters?: number | null;
  processingMethod?: string;
  flavorNotes?: string[];
  recommendedBrewMethods?: string[];
  grindRecommendation?: string;
  brewRatio?: string;
  roastDate?: string | null;
  harvestYear?: number | null;
  lotType?: string;
  packageSizeGrams?: number | null;
  beanFormat?: string;
  caffeineLevel?: string;
};

type PackagingInput = {
  _key?: string;
  packagingId: string;
  isDefault?: boolean;
  available?: boolean;
};

type ImageInput = {
  _key?: string;
  assetId: string;
};

type ProductBody = {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  discount?: number;
  stock?: number;
  status?: string;
  variant?: string;
  isFeatured?: boolean;
  isArchived?: boolean;
  categoryIds?: string[];
  images?: ImageInput[];
  weightOptions?: WeightInput[];
  grindOptions?: GrindInput[];
  packagingOptions?: PackagingInput[];
  coffeeDetails?: CoffeeDetailsInput | null;
};

function parseNumber(value: unknown, field: string, { integer = false } = {}) {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    throw new Error(`${field} must be a number >= 0`);
  }
  if (integer && !Number.isInteger(value)) {
    throw new Error(`${field} must be an integer >= 0`);
  }
  return value;
}

function normalizeImages(images: ImageInput[] | undefined) {
  if (!images) return undefined;
  return images
    .filter((img) => img?.assetId)
    .map((img) => ({
      _type: "image" as const,
      _key: img._key || makeKey("img"),
      asset: {
        _type: "reference" as const,
        _ref: img.assetId,
      },
    }));
}

function normalizeWeights(weights: WeightInput[] | undefined) {
  if (!weights) return undefined;
  const normalized = weights.map((w) => {
    if (!WEIGHTS.has(w.weight)) {
      throw new Error(`Invalid weight: ${w.weight}`);
    }
    return {
      _type: "weightOption" as const,
      _key: w._key || makeKey("wt"),
      weight: w.weight,
      price: parseNumber(w.price, "weight price"),
      isDefault: Boolean(w.isDefault),
      stock: parseNumber(w.stock ?? 0, "weight stock", { integer: true }),
    };
  });

  if (normalized.length > 0 && !normalized.some((w) => w.isDefault)) {
    normalized[0].isDefault = true;
  }
  return normalized;
}

function normalizeGrinds(grinds: GrindInput[] | undefined) {
  if (!grinds) return undefined;
  const normalized = grinds.map((g) => {
    if (!GRINDS.has(g.grindType)) {
      throw new Error(`Invalid grind type: ${g.grindType}`);
    }
    return {
      _type: "grindOption" as const,
      _key: g._key || makeKey("gr"),
      grindType: g.grindType,
      isDefault: Boolean(g.isDefault),
      available: g.available !== false,
    };
  });
  if (normalized.length > 0 && !normalized.some((g) => g.isDefault)) {
    normalized[0].isDefault = true;
  }
  return normalized;
}

function normalizeOptionalNumber(
  value: number | null | undefined,
  field: string,
  { integer = false, min }: { integer?: boolean; min?: number } = {},
) {
  if (value === null || value === undefined || value === ("" as unknown)) {
    return null;
  }
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`${field} must be a number`);
  }
  if (min !== undefined && value < min) {
    throw new Error(`${field} must be >= ${min}`);
  }
  if (integer && !Number.isInteger(value)) {
    throw new Error(`${field} must be an integer`);
  }
  return value;
}

function normalizeStringList(values: string[] | undefined, max?: number) {
  if (!values) return undefined;
  const cleaned = values.map((v) => v.trim()).filter(Boolean);
  if (max !== undefined && cleaned.length > max) {
    throw new Error(`At most ${max} items allowed`);
  }
  return cleaned;
}

function normalizeCoffeeDetails(details: CoffeeDetailsInput | null | undefined) {
  if (details === undefined) return undefined;
  if (details === null) return null;

  const processingMethod = details.processingMethod?.trim() || "";
  if (!PROCESSING.has(processingMethod)) {
    throw new Error("Invalid processing method");
  }
  const grindRecommendation = details.grindRecommendation?.trim() || "";
  if (!GRIND_RECS.has(grindRecommendation)) {
    throw new Error("Invalid grind recommendation");
  }
  const lotType = details.lotType?.trim() || "";
  if (!LOT_TYPES.has(lotType)) {
    throw new Error("Invalid lot type");
  }
  const beanFormat = details.beanFormat?.trim() || "";
  if (!BEAN_FORMATS.has(beanFormat)) {
    throw new Error("Invalid bean format");
  }
  const caffeineLevel = details.caffeineLevel?.trim() || "";
  if (!CAFFEINE.has(caffeineLevel)) {
    throw new Error("Invalid caffeine level");
  }

  const altitudeMeters = normalizeOptionalNumber(
    details.altitudeMeters,
    "altitude",
    { min: 0 },
  );
  const harvestYear = normalizeOptionalNumber(
    details.harvestYear,
    "harvest year",
    { integer: true, min: 2000 },
  );
  if (harvestYear !== null && harvestYear > 2100) {
    throw new Error("harvest year must be <= 2100");
  }
  const packageSizeGrams = normalizeOptionalNumber(
    details.packageSizeGrams,
    "package size",
    { min: 50 },
  );

  return {
    originCountry: details.originCountry?.trim() || "",
    originRegion: details.originRegion?.trim() || "",
    producer: details.producer?.trim() || "",
    altitudeMeters,
    processingMethod: processingMethod || undefined,
    flavorNotes: normalizeStringList(details.flavorNotes, 6) || [],
    recommendedBrewMethods:
      normalizeStringList(details.recommendedBrewMethods) || [],
    grindRecommendation: grindRecommendation || undefined,
    brewRatio: details.brewRatio?.trim() || "",
    roastDate: details.roastDate || undefined,
    harvestYear,
    lotType: lotType || undefined,
    packageSizeGrams,
    beanFormat: beanFormat || undefined,
    caffeineLevel: caffeineLevel || undefined,
  };
}

function normalizePackaging(options: PackagingInput[] | undefined) {
  if (!options) return undefined;
  const normalized = options
    .filter((o) => o.packagingId)
    .map((o) => ({
      _type: "packagingOption" as const,
      _key: o._key || makeKey("pk"),
      packaging: {
        _type: "reference" as const,
        _ref: o.packagingId,
      },
      isDefault: Boolean(o.isDefault),
      available: o.available !== false,
    }));
  if (normalized.length > 0 && !normalized.some((p) => p.isDefault)) {
    normalized[0].isDefault = true;
  }
  return normalized;
}

function buildDocumentFields(body: ProductBody, { forCreate }: { forCreate: boolean }) {
  const doc: Record<string, unknown> = {};
  const unset: string[] = [];

  if (forCreate || body.name !== undefined) {
    if (!body.name?.trim()) throw new Error("name is required");
    doc.name = body.name.trim();
  }

  if (forCreate || body.slug !== undefined || body.name) {
    const slugSource = body.slug?.trim() || body.name?.trim() || "";
    const current = slugify(slugSource);
    if (!current) throw new Error("slug is required");
    doc.slug = { _type: "slug", current };
  }

  if (body.description !== undefined) {
    doc.description = body.description?.trim() || "";
  } else if (forCreate) {
    doc.description = "";
  }

  if (body.price !== undefined) {
    doc.price = parseNumber(body.price, "price");
  } else if (forCreate) {
    doc.price = 0;
  }

  if (body.discount !== undefined) {
    doc.discount = parseNumber(body.discount, "discount");
  } else if (forCreate) {
    doc.discount = 0;
  }

  if (body.stock !== undefined) {
    doc.stock = parseNumber(body.stock, "stock", { integer: true });
  } else if (forCreate) {
    doc.stock = 0;
  }

  if (body.status !== undefined) {
    if (!STATUSES.has(body.status)) {
      throw new Error("status must be new, hot, sale, or empty");
    }
    if (body.status === "") unset.push("status");
    else doc.status = body.status;
  }

  if (body.variant !== undefined) {
    if (body.variant === "") unset.push("variant");
    else if (!VARIANTS.has(body.variant)) {
      throw new Error("Invalid roast variant");
    } else {
      doc.variant = body.variant;
    }
  }

  if (body.isFeatured !== undefined) {
    doc.isFeatured = Boolean(body.isFeatured);
  } else if (forCreate) {
    doc.isFeatured = false;
  }

  if (body.isArchived !== undefined) {
    doc.isArchived = Boolean(body.isArchived);
  } else if (forCreate) {
    doc.isArchived = false;
  }

  if (body.categoryIds !== undefined) {
    doc.categories = body.categoryIds
      .filter(Boolean)
      .map((id) => ({
        _type: "reference" as const,
        _ref: id,
        _key: makeKey("cat"),
      }));
  } else if (forCreate) {
    doc.categories = [];
  }

  const images = normalizeImages(body.images);
  if (images) doc.images = images;
  else if (forCreate) doc.images = [];

  const weights = normalizeWeights(body.weightOptions);
  if (weights) doc.weightOptions = weights;
  else if (forCreate) doc.weightOptions = [];

  const grinds = normalizeGrinds(body.grindOptions);
  if (grinds) doc.grindOptions = grinds;
  else if (forCreate) {
    doc.grindOptions = [
      {
        _type: "grindOption",
        _key: makeKey("gr"),
        grindType: "whole-bean",
        isDefault: true,
        available: true,
      },
      {
        _type: "grindOption",
        _key: makeKey("gr"),
        grindType: "filter",
        isDefault: false,
        available: true,
      },
      {
        _type: "grindOption",
        _key: makeKey("gr"),
        grindType: "espresso",
        isDefault: false,
        available: true,
      },
      {
        _type: "grindOption",
        _key: makeKey("gr"),
        grindType: "cafetiere",
        isDefault: false,
        available: true,
      },
    ];
  }

  const packaging = normalizePackaging(body.packagingOptions);
  if (packaging) doc.packagingOptions = packaging;
  else if (forCreate) doc.packagingOptions = [];

  if (body.coffeeDetails !== undefined) {
    const coffee = normalizeCoffeeDetails(body.coffeeDetails);
    if (coffee === null) unset.push("coffeeDetails");
    else if (coffee) doc.coffeeDetails = coffee;
  }

  return { doc, unset };
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("id");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";
    const archived = searchParams.get("archived") || "active";
    const sortBy = searchParams.get("sortBy") || "_createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const allowedSortFields = new Set([
      "_createdAt",
      "name",
      "price",
      "stock",
    ]);
    const sortField = allowedSortFields.has(sortBy) ? sortBy : "_createdAt";
    const sortDir = sortOrder === "asc" ? "asc" : "desc";

    if (productId) {
      const product = await writeClient.fetch(
        `*[_type == "product" && _id == $productId][0] ${PRODUCT_DETAIL_PROJECTION}`,
        { productId },
      );

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ product: transformProduct(product) });
    }

    const filters = [`_type == "product"`];
    const params: Record<string, unknown> = {
      offset,
      limitEnd: offset + limit,
    };

    if (archived === "archived") {
      filters.push(`isArchived == true`);
    } else if (archived !== "all") {
      filters.push(`(!defined(isArchived) || isArchived != true)`);
    }

    if (category) {
      filters.push(
        `references(*[_type == "category" && title == $category]._id)`,
      );
      params.category = category;
    }
    if (search) {
      filters.push(`(name match $search || description match $search)`);
      params.search = `${search}*`;
    }

    const filterClause = filters.join(" && ");
    const query = `
      *[${filterClause}] | order(${sortField} ${sortDir}) [$offset...$limitEnd] {
        _id,
        _createdAt,
        name,
        description,
        price,
        discount,
        stock,
        isArchived,
        images[]{
          asset->{
            _id,
            url
          },
          alt
        },
        "category": categories[0]->{
          _id,
          "name": title,
          "title": title
        },
        "categories": categories[]->{
          _id,
          "name": title,
          "title": title
        },
        "featured": isFeatured,
        status,
        weightOptions[]{
          _key,
          weight,
          price,
          isDefault,
          stock
        }
      }
    `;

    const countQuery = `count(*[${filterClause}])`;

    const [products, totalCount] = await Promise.all([
      readClient.fetch(query, params),
      readClient.fetch(countQuery, params),
    ]);

    return NextResponse.json({
      products,
      totalCount,
      hasNextPage: offset + limit < totalCount,
      pagination: {
        limit,
        offset,
        total: totalCount,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const body = (await req.json()) as ProductBody;
    const { doc, unset } = buildDocumentFields(body, { forCreate: true });

    const created = await writeClient.create({
      _type: "product",
      ...doc,
    });

    if (unset.length > 0) {
      await writeClient.patch(created._id).unset(unset).commit();
    }

    const product = await writeClient.fetch(
      `*[_type == "product" && _id == $productId][0] ${PRODUCT_DETAIL_PROJECTION}`,
      { productId: created._id },
    );

    await invalidateProducts();

    return NextResponse.json(
      { product: transformProduct(product) },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating product:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const body = (await req.json()) as ProductBody & { productId?: string };
    const { productId } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 },
      );
    }

    const existing = await writeClient.fetch(
      `*[_type == "product" && _id == $productId][0]{ _id }`,
      { productId },
    );
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Quick path: only simple fields (legacy inline edits + weight stock / archive)
    const onlySimple =
      body.name === undefined &&
      body.slug === undefined &&
      body.description === undefined &&
      body.variant === undefined &&
      body.categoryIds === undefined &&
      body.images === undefined &&
      body.grindOptions === undefined &&
      body.packagingOptions === undefined &&
      body.coffeeDetails === undefined;

    if (onlySimple) {
      const setPatch: Record<string, unknown> = {};
      const unsetFields: string[] = [];

      if (body.price !== undefined) {
        setPatch.price = parseNumber(body.price, "price");
      }
      if (body.stock !== undefined) {
        setPatch.stock = parseNumber(body.stock, "stock", { integer: true });
      }
      if (body.discount !== undefined) {
        setPatch.discount = parseNumber(body.discount, "discount");
      }
      if (body.status !== undefined) {
        if (!STATUSES.has(body.status)) {
          throw new Error("status must be new, hot, sale, or empty");
        }
        if (body.status === "") unsetFields.push("status");
        else setPatch.status = body.status;
      }
      if (body.isFeatured !== undefined) {
        setPatch.isFeatured = Boolean(body.isFeatured);
      }
      if (body.isArchived !== undefined) {
        setPatch.isArchived = Boolean(body.isArchived);
      }
      if (body.weightOptions !== undefined) {
        setPatch.weightOptions = normalizeWeights(body.weightOptions);
      }

      if (Object.keys(setPatch).length === 0 && unsetFields.length === 0) {
        return NextResponse.json(
          { error: "No valid fields to update" },
          { status: 400 },
        );
      }

      let mutation = writeClient.patch(productId);
      if (Object.keys(setPatch).length > 0) mutation = mutation.set(setPatch);
      if (unsetFields.length > 0) mutation = mutation.unset(unsetFields);
      await mutation.commit();
    } else {
      const { doc, unset } = buildDocumentFields(body, { forCreate: false });
      let mutation = writeClient.patch(productId);
      if (Object.keys(doc).length > 0) mutation = mutation.set(doc);
      if (unset.length > 0) mutation = mutation.unset(unset);
      await mutation.commit();
    }

    const updated = await writeClient.fetch(
      `*[_type == "product" && _id == $productId][0] ${PRODUCT_DETAIL_PROJECTION}`,
      { productId },
    );

    await invalidateProducts();

    return NextResponse.json({ product: transformProduct(updated) });
  } catch (error) {
    console.error("Error updating product:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update product";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
