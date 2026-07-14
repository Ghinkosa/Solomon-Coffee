import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/client";
import { requireAdminUser } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const adminEmail = admin.userEmail;

    const { accountId, approve, reason } = await request.json();

    if (!accountId || typeof approve !== "boolean" || !adminEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (approve) {
      // Approve the business account
      const result = await writeClient
        .patch(accountId)
        .set({
          isBusiness: true,
          businessStatus: "active",
          membershipType: "business",
          businessApprovedBy: adminEmail,
          businessApprovedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .commit();

      return NextResponse.json({
        success: true,
        message: "Business account approved successfully",
        account: result,
      });
    } else {
      // Reject the business account
      const result = await writeClient
        .patch(accountId)
        .set({
          isBusiness: false,
          businessStatus: "rejected",
          businessApprovedBy: adminEmail,
          businessApprovedAt: new Date().toISOString(),
          rejectionReason: reason || "No reason provided",
          updatedAt: new Date().toISOString(),
        })
        .commit();

      return NextResponse.json({
        success: true,
        message: "Business account rejected",
        account: result,
      });
    }
  } catch (error) {
    console.error("Error updating business account:", error);
    return NextResponse.json(
      { error: "Failed to update business account" },
      { status: 500 }
    );
  }
}
