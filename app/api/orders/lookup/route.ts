import { NextRequest, NextResponse } from "next/server";
import { readClient } from "@/sanity/lib/client";

export async function POST(request: NextRequest) {
  try {
    const { orderNumber, email } = await request.json();

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: "Order number and email are required" },
        { status: 400 },
      );
    }

    const order = await readClient.fetch(
      `*[_type == "order" && orderNumber == $orderNumber && lower(email) == lower($email)][0]{
        _id,
        orderNumber,
        customerName,
        email,
        status,
        paymentStatus,
        paymentMethod,
        totalPrice,
        currency,
        orderDate,
        isGuest,
        products[]{
          quantity,
          weight,
          grind,
          packaging,
          product->{
            _id,
            name,
            images
          }
        },
        address
      }`,
      { orderNumber, email },
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Guest order lookup failed:", error);
    return NextResponse.json(
      { error: "Failed to look up order" },
      { status: 500 },
    );
  }
}
