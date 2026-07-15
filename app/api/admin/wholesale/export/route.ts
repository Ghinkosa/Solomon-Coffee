import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/adminAuth";
import { writeClient } from "@/sanity/lib/client";
import { csvFileResponse, formatCsvDate } from "@/lib/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = ["new", "contacted", "qualified", "closed"] as const;

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim();
    const status = searchParams.get("status") || "";

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
      `*[${filter}] | order(coalesce(submittedAt, _createdAt) desc) {
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
      }`,
      params,
    );

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Business Name",
      "Business Type",
      "Estimated Order Quantity",
      "Status",
      "Message",
      "Submitted At",
      "IP Address",
      "Record ID",
      "Created At",
    ];

    const rows = (inquiries || []).map((row: Record<string, any>) => [
      row.name,
      row.email,
      row.phone || "",
      row.businessName || "",
      row.businessType || "",
      row.estimatedOrderQuantity || "",
      row.status || "",
      row.message || "",
      formatCsvDate(row.submittedAt || row._createdAt),
      row.ipAddress || "",
      row._id,
      formatCsvDate(row._createdAt),
    ]);

    const stamp = new Date().toISOString().slice(0, 10);
    return csvFileResponse(`wholesale-${stamp}.csv`, headers, rows);
  } catch (error) {
    console.error("Admin wholesale CSV export failed:", error);
    return NextResponse.json(
      { error: "Failed to export wholesale CSV" },
      { status: 500 },
    );
  }
}
