import {
  mapStatusToMilestone,
  sendCustomerOrderMilestoneEmail,
  type OrderMilestone,
} from "@/lib/emails/orderEmails";

/**
 * Best-effort customer milestone email after an order status change.
 * Never throws — callers should not await-fail on this.
 */
export async function maybeSendOrderMilestoneEmail(options: {
  status: string;
  orderNumber: string;
  customerEmail?: string | null;
  customerName?: string | null;
  clerkUserId?: string | null;
  milestoneOverride?: OrderMilestone;
  reason?: string;
}): Promise<void> {
  try {
    const email = options.customerEmail?.trim();
    if (!email) return;

    const milestone =
      options.milestoneOverride || mapStatusToMilestone(options.status);
    if (!milestone) return;

    await sendCustomerOrderMilestoneEmail({
      customerEmail: email,
      customerName: options.customerName || undefined,
      orderNumber: options.orderNumber,
      milestone,
      clerkUserId: options.clerkUserId,
      reason: options.reason,
    });
  } catch (error) {
    console.error("Failed to send order milestone email:", error);
  }
}
