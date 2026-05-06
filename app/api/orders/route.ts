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

    // Create order object with packaging support
    const orderData = {
      _type: "order" as const,
      orderNumber,
      customerName: userName,
      email: userEmail,
      phone: userPhone,
      clerkUserId: userId,
      products: items.map(
        (item: { 
          product: { _id: string; name?: string; price?: number; category?: string }; 
          quantity: number;
          packaging?: { _id: string; title: string; price: number } | null;
        }) => {
          const productItem: any = {
            _key: crypto.randomUUID(),
            product: {
              _type: "reference",
              _ref: item.product._id,
            },
            quantity: item.quantity,
          };
          
          // Add packaging reference if it exists
          if (item.packaging && item.packaging._id) {
            productItem.packaging = {
              _type: "reference",
              _ref: item.packaging._id,
            };
          }
          
          return productItem;
        },
      ),
      totalPrice: totalAmount,
      currency: "USD",
      amountDiscount: 0,
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
      ...(paymentMethod === PAYMENT_METHODS.STRIPE && {
        stripeCustomerId: "",
        stripePaymentIntentId: "",
        stripeCheckoutSessionId: "",
      }),
      ...(paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY && {
        stripePaymentIntentId: `cod_${orderNumber}`,
      }),
    };

    // Create order in Sanity using writeClient
    const createdOrder = await writeClient.create(orderData);

    // Track order placed event
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ||
        "http://localhost:3000";
      const origin = new URL(baseUrl).origin;

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
            products: items.map((item: CartItem & { packaging?: { _id: string; title: string; price: number } }) => ({
              productId: item.product._id,
              name: item.product.name || "Unknown Product",
              quantity: item.quantity,
              price: item.product.price || 0,
              packaging: item.packaging?.title || null,
              packagingPrice: item.packaging?.price || 0,
            })),
          },
        }),
        signal: AbortSignal.timeout(5000),
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
            items: items.map((item: CartItem & { packaging?: { _id: string; title: string; price: number } }) => ({
              productId: item.product._id,
              name: item.product.name || "Unknown Product",
              category: item.product.category || "Uncategorized",
              quantity: item.quantity,
              price: item.product.price || 0,
              packaging: item.packaging?.title || null,
              packagingPrice: item.packaging?.price || 0,
            })),
            userId: userId,
          },
        }),
        signal: AbortSignal.timeout(5000),
      });

      Promise.allSettled([trackOrderPromise, trackPurchasePromise]).catch(
        (err) => console.error("Analytics tracking failed:", err),
      );
    } catch (analyticsError) {
      console.error("Failed to initiate analytics tracking:", analyticsError);
    }

    // Send order confirmation notification
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
