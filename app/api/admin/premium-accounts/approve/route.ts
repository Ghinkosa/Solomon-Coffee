import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/client";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Derive the acting admin's email from the authenticated session — never
    // trust a client-supplied adminEmail. (Admin identity is enforced upstream
    // by the proxy for /api/admin/*.)
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const adminEmail = clerkUser.primaryEmailAddress?.emailAddress;

    const { accountId, approve, reason } = await request.json();

    if (!accountId || typeof approve !== "boolean" || !adminEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (approve) {
      // Approve the premium account
      const result = await writeClient
        .patch(accountId)
        .set({
          isActive: true,
          premiumStatus: "active",
          membershipType: "premium",
          premiumApprovedBy: adminEmail,
          premiumApprovedAt: new Date().toISOString(),
          loyaltyPoints: 100, // Welcome bonus
          updatedAt: new Date().toISOString(),
        })
        .commit();

      return NextResponse.json({
        success: true,
        message: "Premium account approved successfully",
        account: result,
      });
    } else {
      // Reject the premium account
      const result = await writeClient
        .patch(accountId)
        .set({
          isActive: false,
          premiumStatus: "rejected",
          premiumApprovedBy: adminEmail,
          premiumApprovedAt: new Date().toISOString(),
          rejectionReason: reason || "No reason provided",
          updatedAt: new Date().toISOString(),
        })
        .commit();

      return NextResponse.json({
        success: true,
        message: "Premium account rejected",
        account: result,
      });
    }
  } catch (error) {
    console.error("Error updating premium account:", error);
    return NextResponse.json(
      { error: "Failed to update premium account" },
      { status: 500 }
    );
  }
}
