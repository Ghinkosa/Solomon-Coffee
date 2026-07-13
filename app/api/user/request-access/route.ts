import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName } = body;

    const clerkUserId = userId;
    const email = user?.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 },
      );
    }

    // Check if user request already exists
    const existingRequest = await backendClient.fetch(
      `*[_type == "userAccessRequest" && clerkUserId == $clerkUserId][0]`,
      { clerkUserId },
    );

    if (existingRequest) {
      return NextResponse.json({
        success: false,
        message: "Access request already exists",
      });
    }

    // Create access request in Sanity
    const accessRequest = await backendClient.create({
      _type: "userAccessRequest",
      clerkUserId,
      email,
      firstName: firstName || user.firstName || "",
      lastName: lastName || user.lastName || "",
      status: "pending",
      requestedAt: new Date().toISOString(),
      approvedAt: null,
      approvedBy: null,
      notes: "",
    });

    return NextResponse.json({
      success: true,
      message: "Access request submitted successfully",
      requestId: accessRequest._id,
    });
  } catch (error) {
    console.error("Error creating access request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
