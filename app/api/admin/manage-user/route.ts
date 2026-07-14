import { NextRequest, NextResponse } from "next/server";
import { writeClient, readClient } from "@/sanity/lib/client";
import { USER_BY_EMAIL_FILTER, SANITY_USER_TYPE } from "@/lib/sanity-user";
import { requireAdminUser } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const { email, setPremium } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Interpret setPremium as the explicit desired premium state.
    const premium = Boolean(setPremium);

    // Check if user exists
    const existingUser = await readClient.fetch(
      `*[${USER_BY_EMAIL_FILTER}][0]`,
      { email }
    );

    if (existingUser) {
      // Update existing user. Set the flags checkout actually reads
      // (getAccountDiscount requires isActive AND premiumStatus === "active").
      const result = await writeClient
        .patch(existingUser._id)
        .set({
          isActive: premium,
          premiumStatus: premium ? "active" : "inactive",
          membershipType: premium
            ? "premium"
            : existingUser.isBusiness
              ? "business"
              : "standard",
          updatedAt: new Date().toISOString(),
        })
        .commit();

      return NextResponse.json({
        success: true,
        message: `User premium status updated to: ${
          premium ? "Active" : "Inactive"
        }`,
        user: result,
      });
    } else {
      // Create new user
      const newUser = await writeClient.create({
        _type: SANITY_USER_TYPE,
        clerkUserId: `admin-managed-${email}`,
        email,
        isActive: premium,
        premiumStatus: premium ? "active" : "inactive",
        isBusiness: false,
        membershipType: premium ? "premium" : "standard",
        activatedAt: new Date().toISOString(),
        activatedBy: admin.userEmail || "admin-creation",
        rewardPoints: 0,
        loyaltyPoints: premium ? 100 : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        preferences: {
          newsletter: true,
          emailNotifications: true,
          smsNotifications: false,
          preferredCurrency: "USD",
          preferredLanguage: "en",
        },
      });

      return NextResponse.json({
        success: true,
        message: premium
          ? "User created successfully with premium status"
          : "User created successfully",
        user: newUser,
      });
    }
  } catch (error) {
    console.error("Error managing user:", error);
    return NextResponse.json(
      { error: "Failed to manage user" },
      { status: 500 }
    );
  }
}
