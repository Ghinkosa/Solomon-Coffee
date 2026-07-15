import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import stripe from "@/lib/stripe";
import { readClient } from "@/sanity/lib/client";
import { getBaseUrl } from "@/lib/get-base-url";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const POST = async (request: NextRequest) => {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`stripe-checkout:${ip}`, 20, 15 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: "Too many checkout attempts. Please try again later.",
          retryAfterSeconds: rate.retryAfterSeconds,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSeconds) },
        },
      );
    }

    const { userId } = await auth();
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
      clerkUserId?: string;
      isGuest?: boolean;
    }>(
      `*[_type == "order" && _id == $orderId][0]{
        _id,
        orderNumber,
        totalPrice,
        paymentStatus,
        email,
        currency,
        clerkUserId,
        isGuest
      }`,
      { orderId },
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderEmail = (order.email || "").trim().toLowerCase();
    const providedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (order.clerkUserId) {
      if (!userId || userId !== order.clerkUserId) {
        return NextResponse.json(
          { error: "You are not allowed to pay for this order" },
          { status: 403 },
        );
      }
    } else {
      // Guest orders require the matching order email
      if (!providedEmail || !orderEmail || providedEmail !== orderEmail) {
        return NextResponse.json(
          { error: "Email must match the order to continue to payment" },
          { status: 403 },
        );
      }
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
    const guestFlag = Boolean(isGuest || order.isGuest || !order.clerkUserId);

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
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}&orderNumber=${resolvedOrderNumber}${guestFlag ? "&guest=true" : ""}`,
      cancel_url: `${baseUrl}/checkout?cancelled=true`,
      metadata: {
        orderId: String(orderId),
        orderNumber: String(resolvedOrderNumber),
        email: String(customerEmail || ""),
        isGuest: String(guestFlag),
      },
      customer_email: customerEmail || undefined,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create Stripe checkout session" },
      { status: 500 },
    );
  }
};
