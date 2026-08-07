import { NextRequest, NextResponse } from "next/server";

/**
 * Loyalty / points program is intentionally disabled.
 * Reward and loyalty points are not awarded or redeemed in production.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      error: "Loyalty points are not available",
      code: "LOYALTY_DISABLED",
    },
    { status: 410 },
  );
}

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
