import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, isAdminApiError } from "@/lib/requireAdminApi";
import { writeClient } from "@/sanity/lib/client";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminApi();
    if (isAdminApiError(admin)) {
      return admin;
    }

    const { userIds, type, accountType } = await req.json();
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

    for (const userIdToApprove of userIds) {
      try {
        const user = await writeClient.fetch(
          `*[_type in ["user", "userType"] && _id == $userId][0]`,
          { userId: userIdToApprove },
        );

        if (!user) {
          results.failed.push({
            userId: userIdToApprove,
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
            userId: userIdToApprove,
            error: "No pending request found",
          });
          continue;
        }

        const patchData: Record<string, string | boolean> = {
          [finalAccountType === "premium"
            ? "premiumStatus"
            : "businessStatus"]: "active",
          [finalAccountType === "premium"
            ? "premiumApprovedAt"
            : "businessApprovedAt"]: now,
          [finalAccountType === "premium"
            ? "premiumApprovedBy"
            : "businessApprovedBy"]: admin.email,
        };

        if (finalAccountType === "premium") {
          patchData.isActive = true;
          patchData.membershipType = user.isBusiness ? "business" : "premium";
        } else {
          patchData.isBusiness = true;
          patchData.membershipType = "business";
        }

        let patch = writeClient.patch(userIdToApprove).set(patchData);
        if (user.rejectionReason) {
          patch = patch.unset(["rejectionReason"]);
        }
        await patch.commit();

        results.successful.push(userIdToApprove);
      } catch (error) {
        console.error(`Error approving user ${userIdToApprove}:`, error);
        results.failed.push({
          userId: userIdToApprove,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      message: `Approved ${results.successful.length} of ${userIds.length} applications`,
      results,
    });
  } catch (error) {
    console.error("Bulk approve error:", error);
    return NextResponse.json(
      { error: "Failed to approve applications" },
      { status: 500 },
    );
  }
}
