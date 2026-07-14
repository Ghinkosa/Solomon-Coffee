import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, isAdminApiError } from "@/lib/requireAdminApi";
import { writeClient } from "@/sanity/lib/client";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminApi();
    if (isAdminApiError(admin)) {
      return admin;
    }

    const { accountId, type, reason } = await req.json();

    if (!accountId || !type || !reason) {
      return NextResponse.json(
        { error: "Account ID, type, and reason are required" },
        { status: 400 },
      );
    }

    if (!["premium", "business"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid account type" },
        { status: 400 },
      );
    }

    const existingUser = await writeClient.fetch(
      `*[_type in ["user", "userType"] && _id == $accountId][0]`,
      { accountId },
    );

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentStatus =
      type === "premium"
        ? existingUser.premiumStatus
        : existingUser.businessStatus;

    if (currentStatus !== "active") {
      return NextResponse.json(
        { error: `${type} account is not active` },
        { status: 400 },
      );
    }

    const trimmedReason = String(reason).trim();
    const updateData =
      type === "premium"
        ? {
            premiumStatus: "cancelled",
            isActive: false,
            membershipType: existingUser.isBusiness ? "business" : "standard",
            rejectionReason: trimmedReason,
            premiumApprovedBy: admin.email,
          }
        : {
            businessStatus: "cancelled",
            isBusiness: false,
            membershipType: existingUser.isActive ? "premium" : "standard",
            rejectionReason: trimmedReason,
            businessApprovedBy: admin.email,
          };

    await writeClient.patch(accountId).set(updateData).commit();

    return NextResponse.json({
      success: true,
      message: `${type} account cancelled successfully`,
    });
  } catch (error) {
    console.error("Error cancelling account:", error);
    return NextResponse.json(
      {
        error: "Failed to cancel account",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
