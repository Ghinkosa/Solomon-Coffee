import { NextResponse } from "next/server";
import { readClient } from "@/sanity/lib/client";

/** Public read-only packaging list for storefront selectors. */
export async function GET() {
  try {
    const packagings = await readClient.fetch(
      `*[_type == "packaging"] | order(price asc) {
        _id,
        title,
        "slug": slug.current,
        description,
        price,
        default,
        "imageUrl": image.asset->url
      }`,
    );
    return NextResponse.json(packagings);
  } catch (error) {
    console.error("Error fetching packaging:", error);
    return NextResponse.json(
      { error: "Failed to fetch packaging options" },
      { status: 500 },
    );
  }
}

/** Writes go through /api/admin/packaging only. */
export async function POST() {
  return NextResponse.json(
    { error: "Method not allowed. Use the admin packaging API." },
    { status: 405 },
  );
}
