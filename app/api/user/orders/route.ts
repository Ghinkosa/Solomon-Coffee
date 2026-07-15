import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getMyOrders } from "@/sanity/helpers";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getMyOrders(userId);
    return NextResponse.json({
      success: true,
      orders: result?.orders ?? [],
      total: result?.totalCount ?? 0,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
