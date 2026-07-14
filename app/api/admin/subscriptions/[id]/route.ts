import { NextRequest, NextResponse } from "next/server";
import { readClient, writeClient } from "@/sanity/lib/client";
import { requireAdminUser } from "@/lib/adminAuth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    // Await params as it's a Promise in Next.js 15+
    const { id: subscriptionId } = await params;

    // Check if subscription exists
    const subscription = await readClient.fetch(
      `*[_type == "subscription" && _id == $subscriptionId][0]`,
      { subscriptionId }
    );

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Delete the subscription
    await writeClient.delete(subscriptionId);

    return NextResponse.json(
      {
        success: true,
        message: "Subscription deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}
