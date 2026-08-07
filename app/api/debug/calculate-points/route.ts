import { NextResponse } from "next/server";

/** Loyalty / points calculator disabled. */
export async function GET() {
  return NextResponse.json(
    { error: "Loyalty points are not available", code: "LOYALTY_DISABLED" },
    { status: 410 },
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "Loyalty points are not available", code: "LOYALTY_DISABLED" },
    { status: 410 },
  );
}
