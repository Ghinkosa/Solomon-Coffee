import stripe from "@/lib/stripe";

export type RefundOrderInput = {
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  stripePaymentIntentId?: string | null;
  amountPaid?: number | null;
  totalPrice?: number | null;
};

export type RefundOrderResult = {
  stripeRefunded: boolean;
  manualRefundRequired: boolean;
  refundAmount: number;
  stripeRefundId?: string;
  error?: string;
};

function getRefundAmount(order: RefundOrderInput): number {
  return order.amountPaid ?? order.totalPrice ?? 0;
}

function isStripePayment(order: RefundOrderInput): boolean {
  const intentId = order.stripePaymentIntentId?.trim();
  // No intent, or a COD placeholder ("cod_..."), means there is no Stripe charge
  // to reverse — those refunds are handled manually (cash).
  if (!intentId || intentId.startsWith("cod_")) return false;
  // Any real stored PaymentIntent is auto-refundable regardless of the order's
  // original payment method. This also covers COD orders that were later paid
  // online (the webhook overwrites the "cod_" placeholder with a real pi_ id).
  return true;
}

export async function refundOrderPayment(
  order: RefundOrderInput,
): Promise<RefundOrderResult> {
  const refundAmount = getRefundAmount(order);

  if (order.paymentStatus !== "paid" || refundAmount <= 0) {
    return {
      stripeRefunded: false,
      manualRefundRequired: false,
      refundAmount: 0,
    };
  }

  if (!isStripePayment(order)) {
    return {
      stripeRefunded: false,
      manualRefundRequired: true,
      refundAmount,
    };
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId!,
      reason: "requested_by_customer",
    });

    return {
      stripeRefunded: true,
      manualRefundRequired: false,
      refundAmount: refund.amount / 100,
      stripeRefundId: refund.id,
    };
  } catch (error) {
    console.error("Stripe refund error:", error);
    return {
      stripeRefunded: false,
      manualRefundRequired: true,
      refundAmount,
      error: error instanceof Error ? error.message : "Stripe refund failed",
    };
  }
}

export function buildRefundMessage(
  result: RefundOrderResult,
  options?: { adminContext?: boolean },
): string {
  if (result.refundAmount <= 0) {
    return options?.adminContext
      ? "Order cancelled successfully."
      : "Cancellation approved successfully.";
  }

  if (result.stripeRefunded) {
    return `Refund of $${result.refundAmount.toFixed(2)} processed to the customer's original payment method.`;
  }

  if (options?.adminContext) {
    return `Order cancelled. Process a $${result.refundAmount.toFixed(2)} refund manually (cash/COD or Stripe dashboard).`;
  }

  return "Cancellation approved. Our team will process your refund shortly.";
}
