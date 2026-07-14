import { NextResponse } from "next/server";
import { readClient } from "@/sanity/lib/client";
import { requireAdminUser } from "@/lib/adminAuth";

export async function GET() {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    // Fetch all subscriptions
    const subscriptions = await readClient.fetch(
      `*[_type == "subscription"] | order(subscribedAt desc) {
        _id,
        email,
        status,
        subscribedAt,
        unsubscribedAt,
        source,
        ipAddress,
        userAgent
      }`
    );

    return NextResponse.json(
      {
        subscriptions,
        total: subscriptions.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
