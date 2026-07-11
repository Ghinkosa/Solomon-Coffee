import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { isUserAdmin } from "@/lib/adminUtils";
import { client } from "@/sanity/lib/client";

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Not logged in" },
        { status: 401 }
      );
    }

    // Get current user details to check admin status
    const clerk = await clerkClient();
    const currentUser = await clerk.users.getUser(userId);
    const userEmail = currentUser.primaryEmailAddress?.emailAddress;

    // Check if current user is admin
    if (!userEmail || !isUserAdmin(userEmail)) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("id");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";
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

    // If requesting a specific product by ID, return full details
    if (productId) {
      const product = await client.fetch(
        `*[_type == "product" && _id == $productId][0] {
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
            ...,
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
          brand->{
            _id,
            title,
            slug
          },
          status,
          variant,
          isFeatured
        }`,
        { productId },
      );

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      // Transform the data to match our interface
      const transformedProduct = {
        ...product,
        category: product.categories?.[0]
          ? {
              _id: product.categories[0]._id,
              name: product.categories[0].title,
              title: product.categories[0].title,
              slug: product.categories[0].slug,
            }
          : null,
        brand: product.brand
          ? {
              _id: product.brand._id,
              name: product.brand.title,
              title: product.brand.title,
              slug: product.brand.slug,
            }
          : null,
        featured: product.isFeatured,
      };

      return NextResponse.json({ product: transformedProduct });
    }

    // Build filter conditions using GROQ parameters (never interpolate user input).
    const filters = [`_type == "product"`];
    const params: Record<string, unknown> = {
      offset,
      limitEnd: offset + limit,
    };

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
        stock,
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
        brand-> {
          _id,
          "name": title
        },
        "featured": isFeatured,
        status
      }
    `;

    const countQuery = `count(*[${filterClause}])`;

    const [products, totalCount] = await Promise.all([
      client.fetch(query, params),
      client.fetch(countQuery, params),
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
      { status: 500 }
    );
  }
}
