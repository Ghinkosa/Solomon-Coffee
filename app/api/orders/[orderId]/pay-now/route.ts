import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/client";
import stripe from "@/lib/stripe";
import { getBaseUrl } from "@/lib/get-base-url";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Get the order from Sanity
    const order = await writeClient.fetch(
      `*[_type == "order" && _id == $orderId && clerkUserId == $clerkUserId][0]{
        _id,
        orderNumber,
        clerkUserId,
        customerName,
        email,
        products[]{
          product->{
            _id,
            name,
            price,
            currency,
            images
          },
          quantity
        },
        subtotal,
        tax,
        shipping,
        totalPrice,
        currency,
        status,
        paymentStatus,
        stripeCustomerId,
        stripePaymentIntentId,
        address
      }`,
      { orderId, clerkUserId: user.id }
    );

    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order is already paid
    if (order.paymentStatus === "paid" || order.status === "paid") {
      return NextResponse.json(
        { error: "Order is already paid" },
        { status: 400 }
      );
    }
    if (order.paymentStatus === "cancelled" || order.status === "cancelled") {
      return NextResponse.json(
        { error: "Cannot pay for a cancelled or expired order" },
        { status: 400 },
      );
    }

    // Validate order has products and total
    if (!order.products || order.products.length === 0) {
      console.error(`No products found for order: ${orderId}`);
      return NextResponse.json(
        { error: "No products found in order" },
        { status: 400 }
      );
    }

    if (!order.totalPrice || order.totalPrice <= 0) {
      console.error(`Invalid total price for order: ${orderId}`);
      return NextResponse.json(
        { error: "Invalid order total" },
        { status: 400 }
      );
    }

    // Handle Stripe customer - create or find existing customer
    let stripeCustomerId = order.stripeCustomerId;

    // If we don't have a valid Stripe customer ID, create one
    if (
      !stripeCustomerId ||
      stripeCustomerId.includes("@") ||
      !stripeCustomerId.startsWith("cus_")
    ) {
      try {
        // First, try to find existing customer by email
        const existingCustomers = await stripe.customers.list({
          email: order.email,
          limit: 1,
        });

        if (existingCustomers.data.length > 0) {
          stripeCustomerId = existingCustomers.data[0].id;
        } else {
          // Create new customer
          const customer = await stripe.customers.create({
            email: order.email,
            name: order.customerName,
            metadata: {
              clerkUserId: order.clerkUserId,
              orderId: order._id,
            },
          });
          stripeCustomerId = customer.id;
        }

        // Update order with correct Stripe customer ID
        await writeClient.patch(order._id).set({ stripeCustomerId }).commit();
      } catch (customerError) {
        console.error(`Failed to create/find Stripe customer:`, customerError);
        return NextResponse.json(
          { error: "Failed to create or find Stripe customer" },
          { status: 500 }
        );
      }
    }

    // Create Stripe checkout session for the order
    const currency = (order.currency || "USD").toLowerCase();
    const baseUrl = getBaseUrl();
    const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;

    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ["card"],
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
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&orderId=${order._id}`,
        cancel_url: `${baseUrl}/orders`,
        metadata: {
          orderId: order._id,
          orderNumber: order.orderNumber || "",
          customerName: order.customerName || "",
        },
        expires_at: expiresAt,
      });

      // Update order with checkout session ID
      await writeClient
        .patch(order._id)
        .set({
          stripeCheckoutSessionId: checkoutSession.id,
          stripeCheckoutExpiresAt: new Date(expiresAt * 1000).toISOString(),
          stripeCustomerId, // Ensure we have the correct customer ID
        })
        .commit();

      return NextResponse.json(
        {
          success: true,
          checkoutUrl: checkoutSession.url,
          sessionId: checkoutSession.id,
          message: "Checkout session created successfully",
        },
        { status: 200 }
      );
    } catch (checkoutError) {
      console.error(`Failed to create checkout session:`, checkoutError);
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Direct payment error:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to process payment";
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes("No such customer")) {
        errorMessage = "Customer not found in Stripe. Please contact support.";
        statusCode = 400;
      } else if (error.message.includes("currency")) {
        errorMessage = "Invalid currency specified";
        statusCode = 400;
      } else if (error.message.includes("amount")) {
        errorMessage = "Invalid amount specified";
        statusCode = 400;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: statusCode }
    );
  }
}
