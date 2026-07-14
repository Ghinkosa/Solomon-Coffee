import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/client";
import { requireAdminUser, slugify } from "@/lib/adminAuth";

const CATEGORY_PROJECTION = `{
  _id,
  _createdAt,
  _updatedAt,
  title,
  slug,
  description,
  range,
  featured,
  image{
    _type,
    asset->{
      _id,
      url
    }
  },
  "productCount": count(*[_type == "product" && references(^._id)])
}`;

type CategoryBody = {
  title?: string;
  slug?: string;
  description?: string;
  range?: number | null;
  featured?: boolean;
  imageAssetId?: string | null;
};

function buildCategoryFields(body: CategoryBody, { forCreate }: { forCreate: boolean }) {
  const doc: Record<string, unknown> = {};
  const unset: string[] = [];

  if (forCreate || body.title !== undefined) {
    if (!body.title?.trim()) throw new Error("title is required");
    doc.title = body.title.trim();
  }

  if (forCreate || body.slug !== undefined || body.title) {
    const slugSource = body.slug?.trim() || body.title?.trim() || "";
    const current = slugify(slugSource);
    if (!current) throw new Error("slug is required");
    doc.slug = { _type: "slug", current };
  }

  if (body.description !== undefined) {
    doc.description = body.description?.trim() || "";
  } else if (forCreate) {
    doc.description = "";
  }

  if (body.range !== undefined) {
    if (body.range === null) {
      unset.push("range");
    } else if (
      typeof body.range !== "number" ||
      Number.isNaN(body.range) ||
      body.range < 0
    ) {
      throw new Error("range must be a number >= 0");
    } else {
      doc.range = body.range;
    }
  }

  if (body.featured !== undefined) {
    doc.featured = Boolean(body.featured);
  } else if (forCreate) {
    doc.featured = false;
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
      const category = await writeClient.fetch(
        `*[_type == "category" && _id == $id][0] ${CATEGORY_PROJECTION}`,
        { id },
      );
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      return NextResponse.json({ category });
    }

    const params: Record<string, unknown> = {};
    let filter = `_type == "category"`;
    if (search) {
      filter += ` && (title match $search || description match $search)`;
      params.search = `${search}*`;
    }

    const categories = await writeClient.fetch(
      `*[${filter}] | order(title asc) ${CATEGORY_PROJECTION}`,
      params,
    );

    return NextResponse.json({ categories: categories || [] });
  } catch (error) {
    console.error("Error fetching categories:", error);
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

    const body = (await req.json()) as CategoryBody;
    const { doc, unset } = buildCategoryFields(body, { forCreate: true });

    const created = await writeClient.create({
      _type: "category",
      ...doc,
    });

    if (unset.length > 0) {
      await writeClient.patch(created._id).unset(unset).commit();
    }

    const category = await writeClient.fetch(
      `*[_type == "category" && _id == $id][0] ${CATEGORY_PROJECTION}`,
      { id: created._id },
    );

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create category";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const body = (await req.json()) as CategoryBody & { categoryId?: string };
    if (!body.categoryId) {
      return NextResponse.json(
        { error: "categoryId is required" },
        { status: 400 },
      );
    }

    const existing = await writeClient.fetch(
      `*[_type == "category" && _id == $id][0]{ _id }`,
      { id: body.categoryId },
    );
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const { doc, unset } = buildCategoryFields(body, { forCreate: false });
    let mutation = writeClient.patch(body.categoryId);
    if (Object.keys(doc).length > 0) mutation = mutation.set(doc);
    if (unset.length > 0) mutation = mutation.unset(unset);
    await mutation.commit();

    const category = await writeClient.fetch(
      `*[_type == "category" && _id == $id][0] ${CATEGORY_PROJECTION}`,
      { id: body.categoryId },
    );

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error updating category:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update category";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("id");
    if (!categoryId) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 },
      );
    }

    const existing = await writeClient.fetch(
      `*[_type == "category" && _id == $id][0]{
        _id,
        title,
        "productCount": count(*[_type == "product" && references(^._id)])
      }`,
      { id: categoryId },
    );

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (existing.productCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete "${existing.title}" — ${existing.productCount} product(s) still use it. Reassign those products first.`,
        },
        { status: 409 },
      );
    }

    await writeClient.delete(categoryId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
