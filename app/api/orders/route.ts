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
import { i18n } from "@/i18n-config";
import {
  isShippingAddressValid,
  normalizeShippingAddress,
  validateShippingAddress,
  validateShippingAddressField,
} from "@/lib/shipping-address-validation";
import crypto from "crypto";
import { sendOrderStatusNotification } from "@/lib/notificationService";

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
      locale: requestedLocale,
    } = reqBody;

    const locale = (i18n.locales as readonly string[]).includes(requestedLocale)
      ? requestedLocale
      : i18n.defaultLocale;

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

    if (isGuest && (!shippingAddress.email || !shippingAddress.name)) {
      return NextResponse.json(
        { error: "Guest name and email are required" },
        { status: 400 },
      );
    }

    const normalizedAddress = normalizeShippingAddress({
      name: shippingAddress.name || "",
      email: shippingAddress.email || "",
      phone: shippingAddress.phone || "",
      address: shippingAddress.address,
      city: shippingAddress.city,
      state: shippingAddress.state,
      zip: shippingAddress.zip,
    });

    // Guests must provide a complete address including email. Logged-in users
    // may omit email here (we fall back to Clerk) — validate physical fields.
    if (isGuest) {
      if (!isShippingAddressValid(normalizedAddress)) {
        const errors = validateShippingAddress(normalizedAddress);
        const firstError =
          Object.values(errors)[0] || "Invalid shipping address";
        return NextResponse.json({ error: firstError }, { status: 400 });
      }
    } else {
      for (const field of ["name", "address", "city", "state", "zip"] as const) {
        const fieldError = validateShippingAddressField(
          field,
          normalizedAddress[field],
        );
        if (fieldError) {
          return NextResponse.json({ error: fieldError }, { status: 400 });
        }
      }
      // Phone is required when provided; empty legacy addresses still check out
      // using the Clerk phone fallback below.
      if (normalizedAddress.phone.trim()) {
        const phoneError = validateShippingAddressField(
          "phone",
          normalizedAddress.phone,
        );
        if (phoneError) {
          return NextResponse.json({ error: phoneError }, { status: 400 });
        }
      }
    }

    shippingAddress.name = normalizedAddress.name;
    if (normalizedAddress.email) {
      shippingAddress.email = normalizedAddress.email;
    }
    shippingAddress.phone = normalizedAddress.phone;
    shippingAddress.address = normalizedAddress.address;
    shippingAddress.city = normalizedAddress.city;
    shippingAddress.state = normalizedAddress.state;
    shippingAddress.zip = normalizedAddress.zip;

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
      const [profile, checkoutSettings] = await Promise.all([
        readClient.fetch<{
          isBusiness?: boolean;
          businessStatus?: string;
          isActive?: boolean;
          premiumStatus?: string;
        }>(
          `*[${USER_BY_EMAIL_FILTER}][0]{ isBusiness, businessStatus, isActive, premiumStatus }`,
          { email: userEmail },
        ),
        import("@/lib/tax-settings").then((mod) =>
          mod.fetchCheckoutTaxSettings(),
        ),
      ]);

      businessDiscountRate = getAccountDiscount(profile, {
        businessRate: checkoutSettings.businessDiscountRate,
        premiumRate: checkoutSettings.premiumDiscountRate,
      }).rate;
    }

    const pricingValidation = await validateOrderPricing({
      items,
      totalAmount,
      subtotal,
      shipping,
      tax,
      packagingFee,
      businessDiscountRate,
      shippingState: shippingAddress.state,
    });

    if (!pricingValidation.valid) {
      return NextResponse.json(
        {
          error: pricingValidation.error,
          code: "code" in pricingValidation ? pricingValidation.code : undefined,
        },
        { status: 400 },
      );
    }

    const calculated = pricingValidation.calculated;
    const resolvedLines = pricingValidation.resolvedLines;

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
      locale,
      customerName: userName,
      email: userEmail,
      phone: userPhone,
      ...(isGuest ? {} : { clerkUserId: userId }),
      products: resolvedLines.map((line) => {
        const productItem: Record<string, unknown> = {
          _key: crypto.randomUUID(),
          product: {
            _type: "reference",
            _ref: line.productId,
          },
          quantity: line.quantity,
        };

        if (line.weightValue) {
          productItem.weight = {
            value: line.weightValue,
            price: line.unitPrice,
          };
        }

        if (line.grind?.type) {
          productItem.grind = {
            type: line.grind.type,
            label:
              line.grind.label ||
              (line.grind.type === "whole-bean"
                ? "Whole Bean"
                : line.grind.type === "cafetiere"
                  ? "Cafetiere"
                  : line.grind.type === "filter"
                    ? "Filter"
                    : "Espresso"),
          };
        }

        if (line.packagingId) {
          productItem.packaging = {
            id: line.packagingId,
            title: line.packagingTitle || "",
            price: line.packagingPrice,
          };
          productItem.packagingRef = {
            _type: "reference",
            _ref: line.packagingId,
          };
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

    // Create order in Sanity using writeClient
    const createdOrder = await writeClient.create(orderData);

    // Reserve stock at order creation for every payment method so concurrent
    // checkouts cannot oversell. The webhook skips decrement when
    // stockDecremented is already true; cancellations restore via
    // restoreOrderStock().
    if (createdOrder.products) {
      try {
        await decrementOrderStock(
          createdOrder.products as Array<{
            product: { _ref: string };
            quantity: number;
            weight?: { value?: string; price?: number };
          }>,
          { strict: true },
        );
        await writeClient
          .patch(createdOrder._id)
          .set({ stockDecremented: true })
          .commit();
      } catch (stockError) {
        console.error("Failed to reserve stock for order:", stockError);

        // Hard-delete first. If that fails, soft-cancel so the order cannot
        // sit as a live pending order with no reserved inventory.
        let rolledBack = false;
        try {
          await writeClient.delete(createdOrder._id);
          rolledBack = true;
        } catch (deleteError) {
          console.error(
            "Failed to delete order after stock reservation error:",
            deleteError,
          );
          try {
            await writeClient
              .patch(createdOrder._id)
              .set({
                status: ORDER_STATUSES.CANCELLED,
                paymentStatus: PAYMENT_STATUSES.CANCELLED,
                stockDecremented: false,
                cancelledAt: new Date().toISOString(),
                cancelledBy: "system",
                notes:
                  "Auto-cancelled: stock reservation failed and order delete rollback failed.",
              })
              .commit();
            rolledBack = true;
          } catch (cancelError) {
            console.error(
              "Failed to cancel orphaned order after stock reservation error:",
              cancelError,
            );
          }
        }

        return NextResponse.json(
          {
            error:
              "Unable to reserve inventory for this order. Please try again.",
            code: "STOCK_RESERVATION_FAILED",
            ...(!rolledBack ? { orphanedOrderId: createdOrder._id } : {}),
          },
          { status: 409 },
        );
      }
    }

    // Only notify at creation for COD orders — a Stripe order isn't really
    // "received" until payment succeeds, so its confirmation notification is
    // sent from the webhook instead (avoids notifying on abandoned checkouts).
    if (
      !isGuest &&
      userId &&
      paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY
    ) {
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

    // Admin alert for COD (Stripe alerts fire after payment in webhook).
    if (paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY) {
      try {
        const { notifyAdminsNewOrder } = await import("@/lib/emails/adminEmails");
        await notifyAdminsNewOrder({
          orderNumber: createdOrder.orderNumber,
          customerName: createdOrder.customerName,
          customerEmail: createdOrder.email,
          total: createdOrder.totalPrice,
          paymentMethod: createdOrder.paymentMethod,
          paymentStatus: createdOrder.paymentStatus,
        });
      } catch (adminEmailError) {
        console.error("Failed to notify admins of new order:", adminEmailError);
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
      },
      { status: sanityAuthError ? 503 : 500 },
    );
  }
};