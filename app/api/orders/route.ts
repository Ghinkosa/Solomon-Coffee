import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getMyOrders } from "@/sanity/helpers";
import { writeClient } from "@/sanity/lib/client";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
} from "@/lib/orderStatus";
import crypto from "crypto";
import { sendOrderStatusNotification } from "@/lib/notificationService";

interface CartItem {
  product: {
    _id: string;
    name?: string;
    price?: number;
    category?: string;
  };
  quantity: number;
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await getMyOrders(userId);

    return NextResponse.json(orders || []);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export const POST = async (request: NextRequest) => {
  try {
    // Check authentication
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reqBody = await request.json();
    const {
      items,
      shippingAddress,
      paymentMethod,
      totalAmount,
      subtotal,
      shipping,
      tax,
    } = reqBody;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 },
      );
    }

    if (
      !paymentMethod ||
      !Object.values(PAYMENT_METHODS).includes(paymentMethod)
    ) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 },
      );
    }

    // Generate order number
    const orderNumber = `ORDER-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    const userEmail = user.emailAddresses[0]?.emailAddress;
    const userName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
    const userPhone =
      user.phoneNumbers?.[0]?.phoneNumber || shippingAddress.phone || "";

    // Create order object
    const orderData = {
      _type: "order" as const,
      orderNumber,
      customerName: userName,
      email: userEmail,
      phone: userPhone,
      clerkUserId: userId,
      products: items.map(
        (item: { product: { _id: string }; quantity: number }) => ({
          _key: crypto.randomUUID(), // Generate unique key for each product item
          product: {
            _type: "reference",
            _ref: item.product._id,
          },
          quantity: item.quantity,
        }),
      ),
      totalPrice: totalAmount,
      currency: "USD",
      amountDiscount: 0, // Can be calculated if you have discount logic
      address: {
        _type: "object",
        name: shippingAddress.name,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip: shippingAddress.zip,
      },
      status: ORDER_STATUSES.PENDING,
      orderDate: new Date().toISOString(),
      paymentMethod,
      paymentStatus:
        paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY
          ? PAYMENT_STATUSES.PENDING
          : PAYMENT_STATUSES.PENDING,
      subtotal,
      shipping,
      tax,
      // Add payment-specific fields based on payment method
      ...(paymentMethod === PAYMENT_METHODS.STRIPE && {
        stripeCustomerId: "", // Will be populated when needed for invoicing
        stripePaymentIntentId: "", // Will be populated for Stripe payments
        stripeCheckoutSessionId: "", // Will be populated for Stripe payments
      }),
      ...(paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY && {
        stripePaymentIntentId: `cod_${orderNumber}`,
      }),
    };

    // Create order in Sanity using writeClient (has create permissions)
    const createdOrder = await writeClient.create(orderData);

    // Track order placed event
    try {
      // Use a more robust way to get the base URL, or just fire and forget without awaiting if performance is an issue
      // Ideally, we should import the tracking logic directly instead of fetching, but for now let's fix the URL.
      // The issue might be that NEXT_PUBLIC_BASE_URL includes '/en', so appending '/api/...' creates an invalid path like '.../en/api/...'

      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ||
        "http://localhost:3000";
      // Remove locale if present in base URL to get the root origin
      const origin = new URL(baseUrl).origin;

      // We use fetch with a shorter timeout to prevent blocking the order response for too long
      const trackOrderPromise = fetch(`${origin}/api/analytics/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: "order_placed",
          eventParams: {
            orderId: createdOrder._id,
            orderNumber: createdOrder.orderNumber,
            amount: totalAmount,
            status: createdOrder.status,
            userId: userId,
            paymentMethod: paymentMethod,
            itemCount: items.length,
            subtotal: subtotal,
            shipping: shipping,
            tax: tax,
            customerEmail: userEmail,
            products: items.map((item: CartItem) => ({
              productId: item.product._id,
              name: item.product.name || "Unknown Product",
              quantity: item.quantity,
              price: item.product.price || 0,
            })),
          },
        }),
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      const trackPurchasePromise = fetch(`${origin}/api/analytics/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: "purchase",
          eventParams: {
            orderId: createdOrder._id,
            value: totalAmount,
            currency: "USD",
            items: items.map((item: CartItem) => ({
              productId: item.product._id,
              name: item.product.name || "Unknown Product",
              category: item.product.category || "Uncategorized",
              quantity: item.quantity,
              price: item.product.price || 0,
            })),
            userId: userId,
          },
        }),
        signal: AbortSignal.timeout(5000),
      });

      // We don't await these to speed up the response, but we catch potential errors to avoid unhandled rejections
      Promise.allSettled([trackOrderPromise, trackPurchasePromise]).catch(
        (err) => console.error("Analytics tracking failed:", err),
      );
    } catch (analyticsError) {
      console.error("Failed to initiate analytics tracking:", analyticsError);
    }

    // Send order confirmation notification to user
    try {
      await sendOrderStatusNotification({
        clerkUserId: userId,
        orderNumber: createdOrder.orderNumber,
        orderId: createdOrder._id,
        status: ORDER_STATUSES.PENDING,
      });
    } catch (notificationError) {
      console.error(
        "Failed to send order confirmation notification:",
        notificationError,
      );
      // Don't fail the order creation if notification fails
    }

    return NextResponse.json({
      success: true,
      order: {
        _id: createdOrder._id,
        orderNumber: createdOrder.orderNumber,
        status: createdOrder.status,
        paymentMethod: createdOrder.paymentMethod,
        totalPrice: createdOrder.totalPrice,
        currency: createdOrder.currency,
      },
      message: "Order created successfully",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Order creation error:", error);
    console.error("Error details:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : null,
    });
    return NextResponse.json(
      {
        error: errorMessage || "Failed to create order",
        details: error instanceof Error ? error.stack : null,
      },
      { status: 500 },
    );
  }
};
