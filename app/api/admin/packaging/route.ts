import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/client";
import { requireAdminUser, slugify } from "@/lib/adminAuth";

const PACKAGING_PROJECTION = `{
  _id,
  _createdAt,
  _updatedAt,
  title,
  slug,
  description,
  price,
  "default": coalesce(default, false),
  image{
    _type,
    asset->{
      _id,
      url
    }
  },
  "productCount": count(*[_type == "product" && references(^._id)])
}`;

type PackagingBody = {
  title?: string;
  slug?: string;
  description?: string;
  price?: number | null;
  default?: boolean;
  imageAssetId?: string | null;
};

function buildPackagingFields(
  body: PackagingBody,
  { forCreate }: { forCreate: boolean },
) {
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
  } else if (forCreate) {
    doc.price = 0;
  }

  if (body.default !== undefined) {
    doc.default = Boolean(body.default);
  } else if (forCreate) {
    doc.default = false;
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
      const packaging = await writeClient.fetch(
        `*[_type == "packaging" && _id == $id][0] ${PACKAGING_PROJECTION}`,
        { id },
      );
      if (!packaging) {
        return NextResponse.json({ error: "Packaging not found" }, { status: 404 });
      }
      return NextResponse.json({ packaging });
    }

    const params: Record<string, unknown> = {};
    let filter = `_type == "packaging"`;
    if (search) {
      filter += ` && (title match $search || description match $search)`;
      params.search = `${search}*`;
    }

    const packaging = await writeClient.fetch(
      `*[${filter}] | order(title asc) ${PACKAGING_PROJECTION}`,
      params,
    );

    return NextResponse.json({ packaging: packaging || [] });
  } catch (error) {
    console.error("Error fetching packaging:", error);
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

    const body = (await req.json()) as PackagingBody;
    const { doc, unset } = buildPackagingFields(body, { forCreate: true });

    const created = await writeClient.create({
      _type: "packaging",
      ...doc,
    });

    if (unset.length > 0) {
      await writeClient.patch(created._id).unset(unset).commit();
    }

    const packaging = await writeClient.fetch(
      `*[_type == "packaging" && _id == $id][0] ${PACKAGING_PROJECTION}`,
      { id: created._id },
    );

    return NextResponse.json({ packaging }, { status: 201 });
  } catch (error) {
    console.error("Error creating packaging:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create packaging";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const body = (await req.json()) as PackagingBody & { packagingId?: string };
    if (!body.packagingId) {
      return NextResponse.json(
        { error: "packagingId is required" },
        { status: 400 },
      );
    }

    const existing = await writeClient.fetch(
      `*[_type == "packaging" && _id == $id][0]{ _id }`,
      { id: body.packagingId },
    );
    if (!existing) {
      return NextResponse.json({ error: "Packaging not found" }, { status: 404 });
    }

    const { doc, unset } = buildPackagingFields(body, { forCreate: false });
    let mutation = writeClient.patch(body.packagingId);
    if (Object.keys(doc).length > 0) mutation = mutation.set(doc);
    if (unset.length > 0) mutation = mutation.unset(unset);
    await mutation.commit();

    const packaging = await writeClient.fetch(
      `*[_type == "packaging" && _id == $id][0] ${PACKAGING_PROJECTION}`,
      { id: body.packagingId },
    );

    return NextResponse.json({ packaging });
  } catch (error) {
    console.error("Error updating packaging:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update packaging";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const { searchParams } = new URL(req.url);
    const packagingId = searchParams.get("id");
    if (!packagingId) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 },
      );
    }

    const existing = await writeClient.fetch(
      `*[_type == "packaging" && _id == $id][0]{
        _id,
        title,
        "productCount": count(*[_type == "product" && references(^._id)])
      }`,
      { id: packagingId },
    );

    if (!existing) {
      return NextResponse.json({ error: "Packaging not found" }, { status: 404 });
    }

    if (existing.productCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete "${existing.title}" — ${existing.productCount} product(s) still use it. Reassign those products first.`,
        },
        { status: 409 },
      );
    }

    await writeClient.delete(packagingId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting packaging:", error);
    return NextResponse.json(
      { error: "Failed to delete packaging" },
      { status: 500 },
    );
  }
}
