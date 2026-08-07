import { NextResponse } from "next/server";

/** Loyalty / reward points are disabled. */
export async function GET() {
  return NextResponse.json(
    {
      error: "Loyalty points are not available",
      code: "LOYALTY_DISABLED",
      rewardPoints: 0,
      loyaltyPoints: 0,
    },
    { status: 410 },
  );
}

export async function POST() {
  return NextResponse.json(
    {
      error: "Loyalty points are not available",
      code: "LOYALTY_DISABLED",
    },
    { status: 410 },
  );
}
