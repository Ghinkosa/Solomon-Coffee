import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { writeClient, client } from "@/sanity/lib/client";
import { USER_BY_EMAIL_FILTER } from "@/lib/sanity-user";

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

    const existingUser = await client.fetch(
      `*[${USER_BY_EMAIL_FILTER}][0]`,
      { email },
    );

    if (!existingUser) {
      return NextResponse.json(
        {
          error:
            "Please register for a premium account first before applying for a business account.",
        },
        { status: 400 },
      );
    }

    if (!existingUser.isActive || existingUser.premiumStatus !== "active") {
      return NextResponse.json(
        {
          error:
            "Business account upgrades are available to active premium members only.",
        },
        { status: 400 },
      );
    }

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

    try {
      const { notifyAdminsAccountApplication } = await import(
        "@/lib/emails/adminEmails"
      );
      const { sendAccountStatusEmail } = await import(
        "@/lib/emails/accountEmails"
      );
      const customerName = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ");
      await Promise.allSettled([
        notifyAdminsAccountApplication({
          type: "business",
          customerName,
          customerEmail: email,
        }),
        sendAccountStatusEmail({
          email,
          customerName,
          type: "business",
          event: "received",
        }),
      ]);
    } catch (emailError) {
      console.error("Business apply emails failed:", emailError);
    }

    return NextResponse.json({
      success: true,
      message:
        "Business account application submitted successfully! Your application is under review and you'll enjoy a Business Account discount once approved.",
      user: result,
    });
  } catch (error) {
    console.error("Error applying for business account:", error);
    return NextResponse.json(
      { error: "Failed to submit business account application" },
      { status: 500 },
    );
  }
}
