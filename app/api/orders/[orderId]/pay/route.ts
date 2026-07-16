import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";
import { backendClient } from "@/sanity/lib/backendClient";
import stripe from "@/lib/stripe";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/orderStatus";
import { getBaseUrl } from "@/lib/get-base-url";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;

    // Fetch the order from Sanity
    const order = await client.fetch(
      `*[_type == "order" && _id == $orderId && clerkUserId == $userId][0]{
        _id,
        orderNumber,
        customerName,
        email,
        clerkUserId,
        status,
        paymentStatus,
        paymentMethod,
        totalPrice,
        currency,
        products[]{
          _key,
          quantity,
          product->{
            _id,
            name,
            price,
            currency,
            images
          }
        },
        address
      }`,
      { orderId, userId }
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order is already paid
    if (
      order.status === ORDER_STATUSES.PAID ||
      order.paymentStatus === PAYMENT_STATUSES.PAID
    ) {
      return NextResponse.json(
        { error: "Order is already paid" },
        { status: 400 }
      );
    }

    // Check if order is eligible for payment (not cancelled)
    if (order.status === ORDER_STATUSES.CANCELLED) {
      return NextResponse.json(
        { error: "Cannot pay for cancelled order" },
        { status: 400 }
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
    const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;

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
              name: `Order ${order.orderNumber || order._id}`,
            },
          },
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `${baseUrl}/orders?payment=cancelled`,
      metadata: {
        orderId: order._id,
        email: order.email,
        orderDate: new Date().toISOString(),
        itemCount: order.products.length.toString(),
        shippingAddress: JSON.stringify(order.address),
        orderAmount: order.totalPrice?.toString() || "",
      },
      customer_email: order.email,
      expires_at: expiresAt,
    });

    await backendClient
      .patch(order._id)
      .set({
        stripeCheckoutSessionId: session.id,
        stripeCheckoutExpiresAt: new Date(expiresAt * 1000).toISOString(),
      })
      .commit();

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      message: "Payment session created successfully",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Payment session creation error:", error);
    return NextResponse.json(
      {
        error: errorMessage || "Failed to create payment session",
      },
      { status: 500 }
    );
  }
}
