import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/client";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await writeClient.fetch(
      `*[_type == "user" && clerkUserId == $clerkId && isAdmin == true][0]`,
      { clerkId: userId }
    );

    if (!adminUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userIds, type, accountType } = await req.json();

    // Accept both 'type' and 'accountType' for backwards compatibility
    const finalAccountType = accountType || type;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "User IDs array is required" },
        { status: 400 }
      );
    }

    if (
      !finalAccountType ||
      !["premium", "business"].includes(finalAccountType)
    ) {
      return NextResponse.json(
        { error: "Valid account type is required" },
        { status: 400 }
      );
    }

    const results = {
      successful: [] as string[],
      failed: [] as { userId: string; error: string }[],
    };

    // Process each user
    for (const userIdToApprove of userIds) {
      try {
        // Fetch the user
        const user = await writeClient.fetch(
          `*[_type == "user" && _id == $userId][0]`,
          { userId: userIdToApprove }
        );

        if (!user) {
          results.failed.push({
            userId: userIdToApprove,
            error: "User not found",
          });
          continue;
        }

        // Check if there's a pending request
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

        // Update user status to active
        await writeClient
          .patch(userIdToApprove)
          .set({
            [finalAccountType === "premium"
              ? "premiumStatus"
              : "businessStatus"]: "active",
            [finalAccountType === "premium"
              ? "premiumApprovedAt"
              : "businessApprovedAt"]: new Date().toISOString(),
          })
          .commit();

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
      { status: 500 }
    );
  }
}
