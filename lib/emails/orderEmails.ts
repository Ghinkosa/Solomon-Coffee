import { contactConfig } from "@/config/contact";
import { sendMail, type EmailResponse } from "@/lib/emailService";
import {
  shouldSendOrderUpdateEmail,
  shouldSendTransactionalEmail,
  type StoredUserPreferences,
} from "@/lib/userPreferences";
import {
  getUserPreferencesByClerkId,
  getUserPreferencesByEmail,
} from "@/lib/userPreferences.server";
import {
  detailRow,
  escapeHtml,
  primaryButton,
  wrapEmailLayout,
} from "@/lib/emails/layout";

const company = () => contactConfig.company.name;
const baseUrl = () =>
  (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(
    /\/+$/,
    "",
  );

export type OrderMilestone =
  | "order_confirmed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "cancellation_rejected";

const MILESTONE_COPY: Record<
  OrderMilestone,
  { subject: string; title: string; body: string }
> = {
  order_confirmed: {
    subject: "Your order is confirmed",
    title: "Order confirmed",
    body: "Great news — we've confirmed your order and are preparing it for fulfillment.",
  },
  shipped: {
    subject: "Your order has shipped",
    title: "Order shipped",
    body: "Your order is on the way. We'll let you know when it's out for delivery.",
  },
  out_for_delivery: {
    subject: "Your order is out for delivery",
    title: "Out for delivery",
    body: "Your order is out for delivery today. Please be available to receive it.",
  },
  delivered: {
    subject: "Your order was delivered",
    title: "Delivered",
    body: "Your order has been delivered. We hope you enjoy your coffee!",
  },
  cancelled: {
    subject: "Your order was cancelled",
    title: "Order cancelled",
    body: "Your order has been cancelled. If you paid online, any eligible refund will be processed according to our policy.",
  },
  cancellation_rejected: {
    subject: "Cancellation request update",
    title: "Cancellation not approved",
    body: "We reviewed your cancellation request and will continue fulfilling this order. Contact support if you have questions.",
  },
};

/** Statuses that should trigger a customer milestone email */
export const CUSTOMER_ORDER_EMAIL_MILESTONES = new Set<string>([
  "order_confirmed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);

export function mapStatusToMilestone(
  status: string,
): OrderMilestone | null {
  const key = status.toLowerCase();
  if (key === "order_confirmed") return "order_confirmed";
  if (key === "shipped") return "shipped";
  if (key === "out_for_delivery") return "out_for_delivery";
  if (key === "delivered" || key === "completed") return "delivered";
  if (key === "cancelled") return "cancelled";
  return null;
}

async function resolvePrefs(options: {
  clerkUserId?: string | null;
  email?: string | null;
}): Promise<StoredUserPreferences | null | undefined> {
  if (options.clerkUserId) {
    const record = await getUserPreferencesByClerkId(options.clerkUserId);
    return record?.raw;
  }
  if (options.email) {
    const record = await getUserPreferencesByEmail(options.email);
    return record?.raw;
  }
  return undefined; // guest / unknown — allow transactional
}

export async function sendCustomerOrderMilestoneEmail(options: {
  customerEmail: string;
  customerName?: string;
  orderNumber: string;
  milestone: OrderMilestone;
  clerkUserId?: string | null;
  reason?: string;
}): Promise<EmailResponse> {
  const prefs = await resolvePrefs({
    clerkUserId: options.clerkUserId,
    email: options.customerEmail,
  });

  // Guests (no profile) always get order milestone emails.
  // Profiles: cancellations use transactional email pref; other milestones use order updates.
  if (prefs !== undefined && prefs !== null) {
    const allowed =
      options.milestone === "cancelled" ||
      options.milestone === "cancellation_rejected"
        ? shouldSendTransactionalEmail(prefs) || shouldSendOrderUpdateEmail(prefs)
        : shouldSendOrderUpdateEmail(prefs);
    if (!allowed) {
      return { success: true, messageId: "skipped:preference_opt_out" };
    }
  }

  const copy = MILESTONE_COPY[options.milestone];
  const name = options.customerName?.trim() || "there";
  const ordersUrl = `${baseUrl()}/user/orders`;

  const reasonHtml = options.reason
    ? `<p style="margin:16px 0 0;font-family:Arial,sans-serif;font-size:14px;"><strong>Note:</strong> ${escapeHtml(options.reason)}</p>`
    : "";

  const html = wrapEmailLayout({
    title: copy.title,
    preheader: `${copy.subject} (#${options.orderNumber})`,
    bodyHtml: `
      <h1 style="margin:0 0 12px;font-size:24px;">${escapeHtml(copy.title)}</h1>
      <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;">Hi ${escapeHtml(name)},</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;">${escapeHtml(copy.body)}</p>
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:20px 0;width:100%;">
        ${detailRow("Order", `#${escapeHtml(options.orderNumber)}`)}
      </table>
      ${reasonHtml}
      ${primaryButton("View order", ordersUrl)}
    `,
  });

  return sendMail({
    email: options.customerEmail,
    subject: `[${company()}] ${copy.subject} (#${options.orderNumber})`,
    text: `Hi ${name},\n\n${copy.body}\n\nOrder: #${options.orderNumber}\n\nView: ${ordersUrl}\n`,
    html,
  });
}
