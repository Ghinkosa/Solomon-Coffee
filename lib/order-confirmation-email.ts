/**
 * Load an order from Sanity and send the customer confirmation email.
 * Used by COD placement (orders API) and Stripe webhook after pay.
 * Best-effort: never throws to the caller after logging.
 */
import { backendClient } from "@/sanity/lib/backendClient";
import { sendOrderConfirmationEmail } from "@/lib/emailService";
import { getEmailImageUrl } from "@/lib/emailImageUtils";
import { normalizeEmailLocale } from "@/lib/email-translations";
import { shouldSendTransactionalEmail } from "@/lib/userPreferences";
import {
  getUserPreferencesByClerkId,
  getUserPreferencesByEmail,
} from "@/lib/userPreferences.server";
import { displayProductName } from "@/lib/display-product-name";
import { i18n, type Locale } from "@/i18n-config";

type OrderEmailRow = {
  orderNumber?: string;
  email?: string;
  clerkUserId?: string;
  customerName?: string;
  orderDate?: string;
  locale?: string;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  totalPrice?: number;
  address?: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  products?: Array<{
    quantity: number;
    weight?: { price?: number };
    product?: {
      name?: unknown;
      price?: number;
      image?: unknown;
    };
  }>;
};

export async function sendOrderConfirmationEmailByOrderId(
  orderId: string,
): Promise<{ sent: boolean; reason?: string }> {
  try {
    const order = await backendClient.fetch<OrderEmailRow | null>(
      `*[_type == "order" && _id == $orderId][0]{
        orderNumber,
        email,
        clerkUserId,
        customerName,
        orderDate,
        locale,
        subtotal,
        shipping,
        tax,
        totalPrice,
        address,
        products[]{
          quantity,
          weight,
          product->{ name, price, "image": images[0] }
        }
      }`,
      { orderId },
    );

    if (!order?.email) {
      return { sent: false, reason: "no_email" };
    }

    const prefsRecord = order.clerkUserId
      ? await getUserPreferencesByClerkId(order.clerkUserId)
      : await getUserPreferencesByEmail(order.email);

    if (prefsRecord && !shouldSendTransactionalEmail(prefsRecord.raw)) {
      console.log(
        `Skipped confirmation email for order ${orderId}: user opted out of transactional email`,
      );
      return { sent: false, reason: "preference_opt_out" };
    }

    const locale = (
      (i18n.locales as readonly string[]).includes(order.locale || "")
        ? order.locale
        : i18n.defaultLocale
    ) as Locale;

    const result = await sendOrderConfirmationEmail({
      customerName: order.customerName || "Customer",
      customerEmail: order.email,
      orderId: order.orderNumber || orderId,
      orderDate: order.orderDate
        ? new Date(order.orderDate).toLocaleDateString()
        : new Date().toLocaleDateString(),
      items: (order.products || []).map((p) => ({
        name:
          displayProductName(p.product, locale) ||
          displayProductName(p.product, i18n.defaultLocale) ||
          "Product",
        price: p.weight?.price || p.product?.price || 0,
        quantity: p.quantity,
        image: getEmailImageUrl(
          p.product?.image as Parameters<typeof getEmailImageUrl>[0],
        ),
      })),
      subtotal: order.subtotal || 0,
      shipping: order.shipping || 0,
      tax: order.tax || 0,
      total: order.totalPrice || 0,
      locale: normalizeEmailLocale(order.locale),
      shippingAddress: {
        name: order.address?.name || order.customerName || "",
        street: order.address?.address || "",
        city: order.address?.city || "",
        state: order.address?.state || "",
        zipCode: order.address?.zip || "",
        country: "United States",
      },
    });

    if (!result.success) {
      console.error(
        `Failed to send confirmation email for order ${orderId}:`,
        result.error,
      );
      return { sent: false, reason: "send_failed" };
    }

    return { sent: true };
  } catch (error) {
    console.error(
      `Error sending confirmation email for order ${orderId}:`,
      error,
    );
    return { sent: false, reason: "error" };
  }
}
