import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mock data for now - replace with actual database queries
    const orders = [
      {
        _id: "1",
        orderNumber: "ORD-2023-1001",
        totalAmount: 49.99,
        status: "Processing",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            name: "Ethiopian Single-Origin Beans",
            quantity: 1,
            price: 24.99,
          },
          {
            name: "Pour-Over Paper Filters",
            quantity: 2,
            price: 12.5,
          },
        ],
      },
      {
        _id: "2",
        orderNumber: "ORD-2023-1000",
        totalAmount: 34.99,
        status: "Shipped",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            name: "Stainless Steel French Press",
            quantity: 1,
            price: 34.99,
          },
        ],
      },
      {
        _id: "3",
        orderNumber: "ORD-2023-0999",
        totalAmount: 27.0,
        status: "Delivered",
        createdAt: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
        items: [
          {
            name: "Espresso Blend Beans",
            quantity: 3,
            price: 9.0,
          },
        ],
      },
    ];

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
