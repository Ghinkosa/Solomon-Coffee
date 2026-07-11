import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getMyOrders } from "@/sanity/helpers";
import { getSanityAuthErrorMessage, readClient, writeClient } from "@/sanity/lib/client";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
} from "@/lib/orderStatus";
import { validateOrderPricing } from "@/lib/validate-order";
import { getAccountDiscount } from "@/lib/checkout-pricing";
import { decrementOrderStock } from "@/lib/stock";
import { USER_BY_EMAIL_FILTER } from "@/lib/sanity-user";
import {
  isShippingAddressValid,
  normalizeShippingAddress,
  validateShippingAddress,
} from "@/lib/shipping-address-validation";
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
  weight?: {
    value: string;
    price: number;
  };
  grind?: {
    type: string;
    label: string;
  };
  packaging?: {
    id: string;
    title: string;
    price: number;
  };
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
    const { userId } = await auth();
    const user = await currentUser();
    const isGuest = !userId || !user;

    const reqBody = await request.json();
    const {
      items,
      shippingAddress,
      paymentMethod,
      totalAmount,
      subtotal,
      shipping,
      tax,
      packagingFee,
    } = reqBody;

    console.log("📦 Order API received items:", JSON.stringify(items, null, 2));

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

    if (isGuest) {
      if (!shippingAddress.email || !shippingAddress.name) {
        return NextResponse.json(
          { error: "Guest name and email are required" },
          { status: 400 },
        );
      }

      const guestAddress = normalizeShippingAddress({
        name: shippingAddress.name,
        email: shippingAddress.email,
        phone: shippingAddress.phone || "",
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip: shippingAddress.zip,
      });

      if (!isShippingAddressValid(guestAddress)) {
        const errors = validateShippingAddress(guestAddress);
        const firstError = Object.values(errors)[0] || "Invalid shipping address";
        return NextResponse.json({ error: firstError }, { status: 400 });
      }

      shippingAddress.name = guestAddress.name;
      shippingAddress.email = guestAddress.email;
      shippingAddress.phone = guestAddress.phone;
      shippingAddress.address = guestAddress.address;
      shippingAddress.city = guestAddress.city;
      shippingAddress.state = guestAddress.state;
      shippingAddress.zip = guestAddress.zip;
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

    const userEmail = isGuest
      ? shippingAddress.email
      : user?.emailAddresses[0]?.emailAddress;
    const userName = isGuest
      ? shippingAddress.name
      : `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";
    const userPhone =
      shippingAddress.phone ||
      user?.phoneNumbers?.[0]?.phoneNumber ||
      "";

    let businessDiscountRate = 0;
    if (!isGuest && userEmail) {
      const profile = await readClient.fetch<{
        isBusiness?: boolean;
        businessStatus?: string;
        isActive?: boolean;
      }>(
        `*[${USER_BY_EMAIL_FILTER}][0]{ isBusiness, businessStatus, isActive }`,
        { email: userEmail },
      );

      businessDiscountRate = getAccountDiscount(profile).rate;
    }

    const pricingValidation = await validateOrderPricing({
      items,
      totalAmount,
      subtotal,
      shipping,
      tax,
      packagingFee,
      businessDiscountRate,
    });

    if (!pricingValidation.valid) {
      return NextResponse.json(
        { error: pricingValidation.error },
        { status: 400 },
      );
    }

    const calculated = pricingValidation.calculated;

    // Generate order number
    const orderNumber = `ORDER-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 11)
      .toUpperCase()}`;

    // Create order object with full support for weight, grind, and packaging
    const orderData = {
      _type: "order" as const,
      orderNumber,
      isGuest,
      customerName: userName,
      email: userEmail,
      phone: userPhone,
      ...(isGuest ? {} : { clerkUserId: userId }),
      products: items.map((item: CartItem) => {
        const productItem: any = {
          _key: crypto.randomUUID(),
          product: {
            _type: "reference",
            _ref: item.product._id,
          },
          quantity: item.quantity,
        };
        
        // ✅ Add weight information if present
        if (item.weight && item.weight.value) {
          productItem.weight = {
            value: item.weight.value,
            price: item.weight.price,
          };
        }
        
        // ✅ Add grind information if present
        if (item.grind && item.grind.type) {
          productItem.grind = {
            type: item.grind.type,
            label: item.grind.label || 
              (item.grind.type === "whole-bean" ? "Whole Bean" :
               item.grind.type === "cafetiere" ? "Cafetiere" :
               item.grind.type === "filter" ? "Filter" : "Espresso"),
          };
        }
        
        // ✅ Add packaging information if present
        if (item.packaging && item.packaging.id) {
          productItem.packaging = {
            id: item.packaging.id,
            title: item.packaging.title,
            price: item.packaging.price,
          };
          // Also add packaging reference if needed
          if (item.packaging.id) {
            productItem.packagingRef = {
              _type: "reference",
              _ref: item.packaging.id,
            };
          }
        }
        
        return productItem;
      }),
      totalPrice: calculated.total,
      currency: "USD",
      amountDiscount: calculated.productDiscount + calculated.businessDiscount,
      packagingFee: calculated.packagingFee,
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
      subtotal: calculated.subtotal,
      shipping: calculated.shipping,
      tax: calculated.tax,
      ...(paymentMethod === PAYMENT_METHODS.STRIPE && {
        stripeCustomerId: "",
        stripePaymentIntentId: "",
        stripeCheckoutSessionId: "",
      }),
      ...(paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY && {
        stripePaymentIntentId: `cod_${orderNumber}`,
      }),
    };

    console.log("📦 Creating order with data:", JSON.stringify(orderData, null, 2));

    // Create order in Sanity using writeClient
    const createdOrder = await writeClient.create(orderData);

    console.log("✅ Order created successfully:", createdOrder._id);

    // COD orders skip the Stripe webhook — decrement stock at placement time.
    if (paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY && createdOrder.products) {
      try {
        await decrementOrderStock(
          createdOrder.products as Array<{
            product: { _ref: string };
            quantity: number;
          }>,
        );
      } catch (stockError) {
        console.error("Failed to decrement stock for COD order:", stockError);
      }
    }

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
            amount: calculated.total,
            status: createdOrder.status,
            userId: userId || "guest",
            paymentMethod: paymentMethod,
            itemCount: items.length,
            subtotal: calculated.subtotal,
            shipping: calculated.shipping,
            tax: calculated.tax,
            packagingFee: calculated.packagingFee,
            customerEmail: userEmail,
            products: items.map((item: CartItem) => ({
              productId: item.product._id,
              name: item.product.name || "Unknown Product",
              quantity: item.quantity,
              price: item.product.price || 0,
              weight: item.weight?.value || null,
              weightPrice: item.weight?.price || null,
              grind: item.grind?.label || null,
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
            value: calculated.total,
            currency: "USD",
            items: items.map((item: CartItem) => ({
              productId: item.product._id,
              name: item.product.name || "Unknown Product",
              category: item.product.category || "Uncategorized",
              quantity: item.quantity,
              price: item.product.price || 0,
              weight: item.weight?.value || null,
              weightPrice: item.weight?.price || null,
              grind: item.grind?.label || null,
              packaging: item.packaging?.title || null,
              packagingPrice: item.packaging?.price || 0,
            })),
            userId: userId || "guest",
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

    if (!isGuest && userId) {
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
        isGuest,
      },
      message: "Order created successfully",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const sanityAuthError = getSanityAuthErrorMessage(error);
    console.error("Order creation error:", error);
    console.error("Error details:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : null,
    });
    return NextResponse.json(
      {
        error: sanityAuthError || errorMessage || "Failed to create order",
        details: error instanceof Error ? error.stack : null,
      },
      { status: sanityAuthError ? 503 : 500 },
    );
  }
};