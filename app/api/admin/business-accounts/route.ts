import { NextResponse } from "next/server";
import { readClient } from "@/sanity/lib/client";
import { requireAdminUser } from "@/lib/adminAuth";

export async function GET() {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    // Check if user is admin (you can implement your own admin check logic)
    // For now, we'll fetch all users with business account requests
    const query = `
      *[_type in ["user", "userType"] && businessStatus in ["pending", "active", "rejected"]] {
        _id,
        email,
        firstName,
        lastName,
        isBusiness,
        isActive,
        businessStatus,
        premiumStatus,
        businessApprovedBy,
        businessApprovedAt,
        businessAppliedAt,
        rejectionReason,
        membershipType,
        createdAt
      } | order(businessAppliedAt desc)
    `;

    const accounts = await readClient.fetch(query);

    return NextResponse.json({
      success: true,
      accounts,
    });
  } catch (error) {
    console.error("Error fetching business accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch business accounts" },
      { status: 500 }
    );
  }
}
