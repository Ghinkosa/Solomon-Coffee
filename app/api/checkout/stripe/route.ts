import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import { readClient } from "@/sanity/lib/client";
import { getBaseUrl } from "@/lib/get-base-url";

export const POST = async (request: NextRequest) => {
  try {
    const reqBody = await request.json();
    const { orderId, orderNumber, email, isGuest } = reqBody;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 },
      );
    }

    // Authoritative pricing comes from the server-stored order — never client items.
    const order = await readClient.fetch<{
      _id: string;
      orderNumber: string;
      totalPrice: number;
      paymentStatus: string;
      email?: string;
      currency?: string;
    }>(
      `*[_type == "order" && _id == $orderId][0]{
        _id,
        orderNumber,
        totalPrice,
        paymentStatus,
        email,
        currency
      }`,
      { orderId },
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "Order is already paid" },
        { status: 400 },
      );
    }

    if (!order.totalPrice || order.totalPrice <= 0) {
      return NextResponse.json(
        { error: "Invalid order total" },
        { status: 400 },
      );
    }

    const baseUrl = getBaseUrl();
    const currency = (order.currency || "USD").toLowerCase();
    const resolvedOrderNumber = order.orderNumber || orderNumber || orderId;
    const customerEmail = order.email || email;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_creation: "always",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: Math.round(order.totalPrice * 100),
            product_data: {
              name: `Order ${resolvedOrderNumber}`,
            },
          },
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}&orderNumber=${resolvedOrderNumber}${isGuest ? "&guest=true" : ""}`,
      cancel_url: `${baseUrl}/checkout?cancelled=true`,
      metadata: {
        orderId: String(orderId),
        orderNumber: String(resolvedOrderNumber),
        email: String(customerEmail || ""),
        isGuest: String(isGuest || false),
      },
      customer_email: customerEmail || undefined,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create Stripe checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
