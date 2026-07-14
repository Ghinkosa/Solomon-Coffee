import { NextResponse } from "next/server";
import { requireAdminApi, isAdminApiError } from "@/lib/requireAdminApi";
import { writeClient } from "@/sanity/lib/client";

export async function GET() {
  try {
    const admin = await requireAdminApi();
    if (isAdminApiError(admin)) {
      return admin;
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const since = sevenDaysAgo.toISOString();

    const [pendingPremiumCount, pendingBusinessCount, recentRequests] =
      await Promise.all([
        writeClient.fetch(
          `count(*[_type in ["user", "userType"] && premiumStatus == "pending"])`,
        ),
        writeClient.fetch(
          `count(*[_type in ["user", "userType"] && businessStatus == "pending"])`,
        ),
        writeClient.fetch(
          `count(*[_type in ["user", "userType"] && (
            (premiumStatus == "pending" && premiumAppliedAt > $since) ||
            (businessStatus == "pending" && businessAppliedAt > $since)
          )])`,
          { since },
        ),
      ]);

    return NextResponse.json({
      success: true,
      pendingPremiumCount,
      pendingBusinessCount,
      totalPendingRequests: pendingPremiumCount + pendingBusinessCount,
      recentRequests,
    });
  } catch (error) {
    console.error("Error fetching account requests summary:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch account requests summary" },
      { status: 500 },
    );
  }
}
