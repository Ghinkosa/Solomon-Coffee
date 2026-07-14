import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/client";
import { requireAdminUser } from "@/lib/adminAuth";

const PROJECTION = `{
  _id,
  _createdAt,
  name,
  email,
  businessName,
  phone,
  businessType,
  estimatedOrderQuantity,
  message,
  status,
  submittedAt,
  ipAddress
}`;

const STATUSES = ["new", "contacted", "qualified", "closed"] as const;

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    if (id) {
      const inquiry = await writeClient.fetch(
        `*[_type == "wholesaleInquiry" && _id == $id][0] ${PROJECTION}`,
        { id },
      );
      if (!inquiry) {
        return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
      }
      return NextResponse.json({ inquiry });
    }

    const params: Record<string, unknown> = {};
    let filter = `_type == "wholesaleInquiry"`;
    if (status && STATUSES.includes(status as (typeof STATUSES)[number])) {
      filter += ` && status == $status`;
      params.status = status;
    }
    if (search) {
      filter += ` && (
        name match $search ||
        email match $search ||
        businessName match $search ||
        message match $search
      )`;
      params.search = `${search}*`;
    }

    const inquiries = await writeClient.fetch(
      `*[${filter}] | order(coalesce(submittedAt, _createdAt) desc) ${PROJECTION}`,
      params,
    );

    const counts = await writeClient.fetch(`{
      "all": count(*[_type == "wholesaleInquiry"]),
      "new": count(*[_type == "wholesaleInquiry" && status == "new"]),
      "contacted": count(*[_type == "wholesaleInquiry" && status == "contacted"]),
      "qualified": count(*[_type == "wholesaleInquiry" && status == "qualified"]),
      "closed": count(*[_type == "wholesaleInquiry" && status == "closed"])
    }`);

    return NextResponse.json({
      inquiries: inquiries || [],
      counts,
    });
  } catch (error) {
    console.error("Error fetching wholesale inquiries:", error);
    return NextResponse.json(
      { error: "Failed to fetch wholesale inquiries" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const body = await req.json();
    const { inquiryId, status } = body as {
      inquiryId?: string;
      status?: string;
    };

    if (!inquiryId) {
      return NextResponse.json(
        { error: "inquiryId is required" },
        { status: 400 },
      );
    }
    if (!status || !STATUSES.includes(status as (typeof STATUSES)[number])) {
      return NextResponse.json(
        { error: "Valid status is required" },
        { status: 400 },
      );
    }

    const existing = await writeClient.fetch(
      `*[_type == "wholesaleInquiry" && _id == $id][0]{ _id }`,
      { id: inquiryId },
    );
    if (!existing) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    await writeClient.patch(inquiryId).set({ status }).commit();

    const inquiry = await writeClient.fetch(
      `*[_type == "wholesaleInquiry" && _id == $id][0] ${PROJECTION}`,
      { id: inquiryId },
    );

    return NextResponse.json({ inquiry });
  } catch (error) {
    console.error("Error updating wholesale inquiry:", error);
    return NextResponse.json(
      { error: "Failed to update inquiry" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await writeClient.fetch(
      `*[_type == "wholesaleInquiry" && _id == $id][0]{ _id }`,
      { id },
    );
    if (!existing) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    await writeClient.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting wholesale inquiry:", error);
    return NextResponse.json(
      { error: "Failed to delete inquiry" },
      { status: 500 },
    );
  }
}
