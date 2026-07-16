import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, isAdminApiError } from "@/lib/requireAdminApi";
import { writeClient } from "@/sanity/lib/client";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminApi();
    if (isAdminApiError(admin)) {
      return admin;
    }

    const body = await request.json();
    const { userId, type } = body;

    if (!userId || !type) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!["premium", "business"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid account type" },
        { status: 400 },
      );
    }

    const user = await writeClient.fetch(
      `*[_type in ["user", "userType"] && _id == $userId][0] {
        _id,
        firstName,
        lastName,
        email,
        premiumStatus,
        businessStatus,
        isBusiness,
        isActive,
        rejectionReason
      }`,
      { userId },
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const currentStatus =
      type === "premium" ? user.premiumStatus : user.businessStatus;

    if (currentStatus !== "pending") {
      return NextResponse.json(
        {
          success: false,
          message: `${type} account is not in pending status`,
        },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const updateData: Record<string, string | boolean> = {
      [`${type}Status`]: "active",
      [`${type}ApprovedAt`]: now,
      [`${type}ApprovedBy`]: admin.email,
    };

    if (type === "premium") {
      updateData.isActive = true;
      updateData.membershipType = user.isBusiness ? "business" : "premium";
    } else {
      updateData.isBusiness = true;
      updateData.membershipType = "business";
    }

    let patch = writeClient.patch(userId).set(updateData);
    if (user.rejectionReason) {
      patch = patch.unset(["rejectionReason"]);
    }
    await patch.commit();

    try {
      const { sendAccountStatusEmail } = await import(
        "@/lib/emails/accountEmails"
      );
      if (user.email) {
        await sendAccountStatusEmail({
          email: user.email,
          customerName: [user.firstName, user.lastName].filter(Boolean).join(" "),
          type: type as "premium" | "business",
          event: "approved",
        });
      }
    } catch (emailError) {
      console.error("Account approval email failed:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: `${type === "premium" ? "Premium" : "Business"} account approved for ${user.firstName || ""} ${user.lastName || ""}`.trim(),
    });
  } catch (error) {
    console.error("Error approving account:", error);
    return NextResponse.json(
      { success: false, message: "Failed to approve account" },
      { status: 500 },
    );
  }
}
