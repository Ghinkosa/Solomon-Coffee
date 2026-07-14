import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, isAdminApiError } from "@/lib/requireAdminApi";
import { writeClient } from "@/sanity/lib/client";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminApi();
    if (isAdminApiError(admin)) {
      return admin;
    }

    const { userIds, type, accountType, reason } = await req.json();
    const finalAccountType = accountType || type;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "User IDs array is required" },
        { status: 400 },
      );
    }

    if (
      !finalAccountType ||
      !["premium", "business"].includes(finalAccountType)
    ) {
      return NextResponse.json(
        { error: "Valid account type is required" },
        { status: 400 },
      );
    }

    const results = {
      successful: [] as string[],
      failed: [] as { userId: string; error: string }[],
    };

    const now = new Date().toISOString();
    const trimmedReason =
      reason && String(reason).trim() ? String(reason).trim() : "";

    for (const userIdToReject of userIds) {
      try {
        const user = await writeClient.fetch(
          `*[_type in ["user", "userType"] && _id == $userId][0]`,
          { userId: userIdToReject },
        );

        if (!user) {
          results.failed.push({
            userId: userIdToReject,
            error: "User not found",
          });
          continue;
        }

        const currentStatus =
          finalAccountType === "premium"
            ? user.premiumStatus
            : user.businessStatus;

        if (currentStatus !== "pending") {
          results.failed.push({
            userId: userIdToReject,
            error: "No pending request found",
          });
          continue;
        }

        const updateData: Record<string, string> = {
          [finalAccountType === "premium"
            ? "premiumStatus"
            : "businessStatus"]: "rejected",
          [finalAccountType === "premium"
            ? "premiumRejectedAt"
            : "businessRejectedAt"]: now,
          [finalAccountType === "premium"
            ? "premiumApprovedBy"
            : "businessApprovedBy"]: admin.email,
        };

        if (trimmedReason) {
          updateData.rejectionReason = trimmedReason;
        }

        await writeClient.patch(userIdToReject).set(updateData).commit();
        results.successful.push(userIdToReject);
      } catch (error) {
        console.error(`Error rejecting user ${userIdToReject}:`, error);
        results.failed.push({
          userId: userIdToReject,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      message: `Rejected ${results.successful.length} of ${userIds.length} applications`,
      results,
    });
  } catch (error) {
    console.error("Bulk reject error:", error);
    return NextResponse.json(
      { error: "Failed to reject applications" },
      { status: 500 },
    );
  }
}
