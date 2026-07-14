import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { writeClient } from "@/sanity/lib/client";
import { requireAdminUser, slugify, makeKey } from "@/lib/adminAuth";
import { CACHE_TAGS } from "@/lib/cache";

const BLOG_LIST_PROJECTION = `{
  _id,
  _createdAt,
  _updatedAt,
  title,
  slug,
  publishedAt,
  isLatest,
  mainImage{
    _type,
    asset->{
      _id,
      url
    }
  },
  blogcategories[]->{
    _id,
    title,
    slug
  }
}`;

const BLOG_DETAIL_PROJECTION = `{
  _id,
  _createdAt,
  _updatedAt,
  title,
  slug,
  publishedAt,
  isLatest,
  body,
  mainImage{
    _type,
    asset->{
      _id,
      url
    }
  },
  "blogcategoryIds": blogcategories[]._ref,
  blogcategories[]->{
    _id,
    title,
    slug
  }
}`;

type BlogBody = {
  title?: string;
  slug?: string;
  publishedAt?: string | null;
  isLatest?: boolean;
  imageAssetId?: string | null;
  blogcategoryIds?: string[];
  body?: unknown[];
};

function revalidateBlogs() {
  revalidateTag(CACHE_TAGS.BLOGS, "max");
  revalidateTag(CACHE_TAGS.HOMEPAGE, "max");
}

function buildBlogFields(body: BlogBody, { forCreate }: { forCreate: boolean }) {
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

  if (body.publishedAt !== undefined) {
    if (!body.publishedAt) {
      unset.push("publishedAt");
    } else {
      doc.publishedAt = body.publishedAt;
    }
  } else if (forCreate) {
    doc.publishedAt = new Date().toISOString();
  }

  if (body.isLatest !== undefined) {
    doc.isLatest = Boolean(body.isLatest);
  } else if (forCreate) {
    doc.isLatest = true;
  }

  if (body.imageAssetId !== undefined) {
    if (!body.imageAssetId) {
      unset.push("mainImage");
    } else {
      doc.mainImage = {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: body.imageAssetId,
        },
      };
    }
  }

  if (body.blogcategoryIds !== undefined) {
    doc.blogcategories = body.blogcategoryIds.filter(Boolean).map((id) => ({
      _type: "reference",
      _ref: id,
      _key: makeKey("bcat"),
    }));
  } else if (forCreate) {
    doc.blogcategories = [];
  }

  if (body.body !== undefined) {
    if (!Array.isArray(body.body)) {
      throw new Error("body must be an array");
    }
    doc.body = body.body;
  } else if (forCreate) {
    doc.body = [
      {
        _type: "block",
        _key: makeKey("blk"),
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: makeKey("sp"),
            text: "",
            marks: [],
          },
        ],
      },
    ];
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
      const blog = await writeClient.fetch(
        `*[_type == "blog" && _id == $id][0] ${BLOG_DETAIL_PROJECTION}`,
        { id },
      );
      if (!blog) {
        return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
      }
      return NextResponse.json({ blog });
    }

    const params: Record<string, unknown> = {};
    let filter = `_type == "blog"`;
    if (search) {
      filter += ` && title match $search`;
      params.search = `${search}*`;
    }

    const blogs = await writeClient.fetch(
      `*[${filter}] | order(publishedAt desc) ${BLOG_LIST_PROJECTION}`,
      params,
    );

    return NextResponse.json({ blogs: blogs || [] });
  } catch (error) {
    console.error("Error fetching blogs:", error);
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

    const body = (await req.json()) as BlogBody;
    const { doc, unset } = buildBlogFields(body, { forCreate: true });

    const created = await writeClient.create({
      _type: "blog",
      ...doc,
    });

    if (unset.length > 0) {
      await writeClient.patch(created._id).unset(unset).commit();
    }

    revalidateBlogs();

    const blog = await writeClient.fetch(
      `*[_type == "blog" && _id == $id][0] ${BLOG_DETAIL_PROJECTION}`,
      { id: created._id },
    );

    return NextResponse.json({ blog }, { status: 201 });
  } catch (error) {
    console.error("Error creating blog:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create blog post";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const body = (await req.json()) as BlogBody & { blogId?: string };
    if (!body.blogId) {
      return NextResponse.json({ error: "blogId is required" }, { status: 400 });
    }

    const existing = await writeClient.fetch(
      `*[_type == "blog" && _id == $id][0]{ _id }`,
      { id: body.blogId },
    );
    if (!existing) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    const { doc, unset } = buildBlogFields(body, { forCreate: false });
    let mutation = writeClient.patch(body.blogId);
    if (Object.keys(doc).length > 0) mutation = mutation.set(doc);
    if (unset.length > 0) mutation = mutation.unset(unset);
    await mutation.commit();

    revalidateBlogs();

    const blog = await writeClient.fetch(
      `*[_type == "blog" && _id == $id][0] ${BLOG_DETAIL_PROJECTION}`,
      { id: body.blogId },
    );

    return NextResponse.json({ blog });
  } catch (error) {
    console.error("Error updating blog:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update blog post";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const { searchParams } = new URL(req.url);
    const blogId = searchParams.get("id");
    if (!blogId) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await writeClient.fetch(
      `*[_type == "blog" && _id == $id][0]{ _id, title }`,
      { id: blogId },
    );
    if (!existing) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    await writeClient.delete(blogId);
    revalidateBlogs();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 },
    );
  }
}
