import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { writeClient, client } from "@/sanity/lib/client";
import { USER_BY_EMAIL_FILTER, SANITY_USER_TYPE } from "@/lib/sanity-user";

export async function POST() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 },
      );
    }

    // Check if user exists in Sanity
    const existingUser = await client.fetch(
      `*[${USER_BY_EMAIL_FILTER}][0]`,
      { email },
    );

    // Existing users: guard against duplicate/invalid applications
    if (existingUser) {
      if (existingUser.businessStatus === "rejected") {
        return NextResponse.json(
          {
            error:
              "Business account application was rejected. Please contact admin for assistance.",
          },
          { status: 400 },
        );
      }

      if (existingUser.businessStatus === "pending") {
        return NextResponse.json(
          { error: "Business account application is already pending approval." },
          { status: 400 },
        );
      }

      if (existingUser.isBusiness) {
        return NextResponse.json(
          { error: "Business account already approved" },
          { status: 400 },
        );
      }

      const result = await writeClient
        .patch(existingUser._id)
        .set({
          businessStatus: "pending",
          businessAppliedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .commit();

      return NextResponse.json({
        success: true,
        message:
          "🚀 Business account application submitted successfully! Your application is under review and you'll enjoy a Business Account discount once approved.",
        user: result,
      });
    }

    // New user (never registered for premium): create the record directly
    // with a pending business application. Premium is no longer a prerequisite.
    const newUser = await writeClient.create({
      _type: SANITY_USER_TYPE,
      clerkUserId: user.id,
      email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: false,
      premiumStatus: "none",
      isBusiness: false,
      businessStatus: "pending",
      membershipType: "standard",
      businessAppliedAt: new Date().toISOString(),
      rewardPoints: 0,
      loyaltyPoints: 0,
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
      message:
        "🚀 Business account application submitted successfully! Your application is under review and you'll enjoy a Business Account discount once approved.",
      user: newUser,
    });
  } catch (error) {
    console.error("Error applying for business account:", error);
    return NextResponse.json(
      { error: "Failed to submit business account application" },
      { status: 500 },
    );
  }
}
