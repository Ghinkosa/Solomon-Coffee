import { NextRequest, NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";

/**
 * GET: Fetches all available packaging options from Sanity
 */
export async function GET() {
  try {
    // GROQ query to fetch packaging details based on your schema
    const query = `*[_type == "packaging"] | order(price asc) {
      _id,
      title,
      "slug": slug.current,
      description,
      price,
      default,
      "imageUrl": image.asset->url
    }`;

    const packagings = await backendClient.fetch(query);

    return NextResponse.json(packagings);
  } catch (error) {
    console.error("Error fetching packaging:", error);
    return NextResponse.json(
      { error: "Failed to fetch packaging options" },
      { status: 500 }
    );
  }
}

/**
 * POST: Allows creating new packaging types (Optional)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, price, isDefault } = body;

    // Basic validation
    if (!title || price === undefined) {
      return NextResponse.json(
        { error: "Title and price are required" },
        { status: 400 }
      );
    }

    // Handle single default constraint: If this is default, unset others
    if (isDefault) {
      const existingDefaults = await backendClient.fetch(
        `*[_type == "packaging" && default == true]`
      );
      
      for (const item of existingDefaults) {
        await backendClient
          .patch(item._id)
          .set({ default: false })
          .commit();
      }
    }

    const newPackaging = await backendClient.create({
      _type: "packaging",
      title,
      description,
      price,
      default: isDefault || false,
      // Note: Image upload via API requires a separate asset upload step
    });

    return NextResponse.json({
      success: true,
      packagingId: newPackaging._id,
      message: "Packaging created successfully",
    });
  } catch (error) {
    console.error("Error creating packaging:", error);
    return NextResponse.json(
      { error: "Failed to create packaging" },
      { status: 500 }
    );
  }
}