import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { writeClient } from "@/sanity/lib/client";
import { requireAdminUser, slugify } from "@/lib/adminAuth";
import { CACHE_TAGS } from "@/lib/cache";

const CATEGORY_PROJECTION = `{
  _id,
  _createdAt,
  _updatedAt,
  title,
  slug,
  description,
  "postCount": count(*[_type == "blog" && references(^._id)])
}`;

type CategoryBody = {
  title?: string;
  slug?: string;
  description?: string;
};

function revalidateBlogs() {
  revalidateTag(CACHE_TAGS.BLOGS, "max");
  revalidateTag(CACHE_TAGS.HOMEPAGE, "max");
}

function buildCategoryFields(
  body: CategoryBody,
  { forCreate }: { forCreate: boolean },
) {
  const doc: Record<string, unknown> = {};

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

  return doc;
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
        `*[_type == "blogcategory" && _id == $id][0] ${CATEGORY_PROJECTION}`,
        { id },
      );
      if (!category) {
        return NextResponse.json(
          { error: "Blog category not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ category });
    }

    const params: Record<string, unknown> = {};
    let filter = `_type == "blogcategory"`;
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
    console.error("Error fetching blog categories:", error);
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
    const doc = buildCategoryFields(body, { forCreate: true });

    const created = await writeClient.create({
      _type: "blogcategory",
      ...doc,
    });

    revalidateBlogs();

    const category = await writeClient.fetch(
      `*[_type == "blogcategory" && _id == $id][0] ${CATEGORY_PROJECTION}`,
      { id: created._id },
    );

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Error creating blog category:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create blog category";
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
      `*[_type == "blogcategory" && _id == $id][0]{ _id }`,
      { id: body.categoryId },
    );
    if (!existing) {
      return NextResponse.json(
        { error: "Blog category not found" },
        { status: 404 },
      );
    }

    const doc = buildCategoryFields(body, { forCreate: false });
    if (Object.keys(doc).length > 0) {
      await writeClient.patch(body.categoryId).set(doc).commit();
    }

    revalidateBlogs();

    const category = await writeClient.fetch(
      `*[_type == "blogcategory" && _id == $id][0] ${CATEGORY_PROJECTION}`,
      { id: body.categoryId },
    );

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error updating blog category:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update blog category";
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
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await writeClient.fetch(
      `*[_type == "blogcategory" && _id == $id][0]{
        _id,
        title,
        "postCount": count(*[_type == "blog" && references(^._id)])
      }`,
      { id: categoryId },
    );

    if (!existing) {
      return NextResponse.json(
        { error: "Blog category not found" },
        { status: 404 },
      );
    }

    if (existing.postCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete "${existing.title}" — ${existing.postCount} post(s) still use it. Reassign those posts first.`,
        },
        { status: 409 },
      );
    }

    await writeClient.delete(categoryId);
    revalidateBlogs();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog category:", error);
    return NextResponse.json(
      { error: "Failed to delete blog category" },
      { status: 500 },
    );
  }
}
