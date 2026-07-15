import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/adminAuth";
import { readClient } from "@/sanity/lib/client";
import { csvFileResponse, formatCsvDate } from "@/lib/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXPORT_LIMIT = 5000;

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";
    const search = (searchParams.get("search") || "").trim();
    const archived = searchParams.get("archived") || "active";

    const filters = [`_type == "product"`];
    const params: Record<string, unknown> = { limit: EXPORT_LIMIT };

    if (archived === "archived") {
      filters.push(`isArchived == true`);
    } else if (archived !== "all") {
      filters.push(`(!defined(isArchived) || isArchived != true)`);
    }

    if (category && category !== "all") {
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
    const products = await readClient.fetch(
      `*[${filterClause}] | order(_createdAt desc) [0...$limit] {
        _id,
        _createdAt,
        name,
        "slug": slug.current,
        description,
        price,
        discount,
        stock,
        status,
        variant,
        isFeatured,
        isArchived,
        "categories": categories[]->title,
        coffeeDetails{
          originCountry,
          originRegion,
          producer,
          processingMethod,
          lotType,
          beanFormat,
          caffeineLevel
        },
        weightOptions[]{ weight, price, stock, isDefault }
      }`,
      params,
    );

    const headers = [
      "Name",
      "Slug",
      "Categories",
      "Price",
      "Discount",
      "Stock",
      "Status",
      "Variant",
      "Featured",
      "Archived",
      "Origin Country",
      "Origin Region",
      "Producer",
      "Processing",
      "Lot Type",
      "Bean Format",
      "Caffeine",
      "Weight Options",
      "Description",
      "Record ID",
      "Created At",
    ];

    const rows = (products || []).map((product: Record<string, any>) => {
      const weights = (product.weightOptions || [])
        .map((w: any) => {
          const parts = [w.weight, w.price != null ? `$${w.price}` : null]
            .filter(Boolean)
            .join(" ");
          return w.isDefault ? `${parts}*` : parts;
        })
        .filter(Boolean)
        .join("; ");

      return [
        product.name,
        product.slug || "",
        (product.categories || []).join("; "),
        product.price ?? "",
        product.discount ?? "",
        product.stock ?? "",
        product.status || "",
        product.variant || "",
        product.isFeatured ? "yes" : "no",
        product.isArchived ? "yes" : "no",
        product.coffeeDetails?.originCountry || "",
        product.coffeeDetails?.originRegion || "",
        product.coffeeDetails?.producer || "",
        product.coffeeDetails?.processingMethod || "",
        product.coffeeDetails?.lotType || "",
        product.coffeeDetails?.beanFormat || "",
        product.coffeeDetails?.caffeineLevel || "",
        weights,
        product.description || "",
        product._id,
        formatCsvDate(product._createdAt),
      ];
    });

    const stamp = new Date().toISOString().slice(0, 10);
    return csvFileResponse(`products-${stamp}.csv`, headers, rows);
  } catch (error) {
    console.error("Admin products CSV export failed:", error);
    return NextResponse.json(
      { error: "Failed to export products CSV" },
      { status: 500 },
    );
  }
}
