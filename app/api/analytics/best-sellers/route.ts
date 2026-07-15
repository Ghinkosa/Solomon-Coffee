import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/adminAuth";

/**
 * Legacy best-sellers endpoint used to scrape all order line items publicly.
 * Keep route for old bookmarks but require admin; prefer dashboard series APIs.
 */
export async function GET() {
  const admin = await requireAdminUser();
  if (admin.error) return admin.error;

  return NextResponse.json(
    {
      error:
        "This analytics endpoint is retired. Use /api/admin/stats or the Operations dashboard.",
    },
    { status: 410 },
  );
}
