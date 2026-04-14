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

    const { userIds, type, accountType, reason } = await req.json();

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
    for (const userIdToReject of userIds) {
      try {
        // Fetch the user
        const user = await writeClient.fetch(
          `*[_type == "user" && _id == $userId][0]`,
          { userId: userIdToReject }
        );

        if (!user) {
          results.failed.push({
            userId: userIdToReject,
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
            userId: userIdToReject,
            error: "No pending request found",
          });
          continue;
        }

        // Create notification for rejection
        const notificationMessage =
          reason && reason.trim()
            ? `Your ${finalAccountType} account application has been rejected. Reason: ${reason}`
            : `Your ${finalAccountType} account application has been rejected.`;

        await writeClient.create({
          _type: "notification",
          user: {
            _type: "reference",
            _ref: userIdToReject,
          },
          message: notificationMessage,
          type: "rejection",
          read: false,
          createdAt: new Date().toISOString(),
        });

        // Update user status to rejected
        const updateData: Record<string, string> = {
          [finalAccountType === "premium" ? "premiumStatus" : "businessStatus"]:
            "rejected",
        };

        if (reason && reason.trim()) {
          updateData.rejectionReason = reason.trim();
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
      { status: 500 }
    );
  }
}
