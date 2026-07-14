import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { requireAdminUser } from "@/lib/adminAuth";

/** Packaging catalog for the product editor. */
export async function GET() {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const packaging = await client.fetch(
      `*[_type == "packaging"] | order(title asc) {
        _id,
        title,
        price,
        "isDefault": coalesce(default, false)
      }`,
    );

    return NextResponse.json({ packaging: packaging || [] });
  } catch (error) {
    console.error("Product meta fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to load product catalogs" },
      { status: 500 },
    );
  }
}
