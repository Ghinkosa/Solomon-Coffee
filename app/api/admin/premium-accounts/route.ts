import { NextResponse } from "next/server";
import { readClient } from "@/sanity/lib/client";
import { requireAdminUser } from "@/lib/adminAuth";

export async function GET() {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    // Fetch all users with premium applications
    const query = `
      *[_type in ["user", "userType"] && premiumStatus in ["pending", "active", "rejected"]] {
        _id,
        email,
        firstName,
        lastName,
        isActive,
        premiumStatus,
        businessStatus,
        isBusiness,
        premiumAppliedAt,
        premiumApprovedBy,
        premiumApprovedAt,
        rejectionReason,
        membershipType,
        createdAt
      } | order(premiumAppliedAt desc)
    `;

    const accounts = await readClient.fetch(query);

    return NextResponse.json({
      success: true,
      accounts,
    });
  } catch (error) {
    console.error("Error fetching premium accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch premium accounts" },
      { status: 500 }
    );
  }
}
