import stripe from "@/lib/stripe";

/**
 * Refund a late Stripe payment on an order that must not be revived
 * (cancelled / amount mismatch). Idempotent per session.
 */
export async function refundLateCheckoutPayment(input: {
  orderId: string;
  sessionId: string;
  paymentIntentId?: string | null;
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
}): Promise<{ refunded: boolean; error?: string }> {
  const intentId =
    typeof input.paymentIntentId === "string"
      ? input.paymentIntentId.trim()
      : "";
  if (!intentId || intentId.startsWith("cod_")) {
    return { refunded: false, error: "no_payment_intent" };
  }

  try {
    await stripe.refunds.create(
      {
        payment_intent: intentId,
        reason: input.reason || "requested_by_customer",
      },
      {
        idempotencyKey: `late-pay-refund-${input.orderId}-${input.sessionId}`,
      },
    );
    return { refunded: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Stripe refund failed";
    // Already-refunded is success for our purposes.
    if (/already been refunded|charge_already_refunded/i.test(message)) {
      return { refunded: true };
    }
    console.error(
      `Late-payment refund failed for order ${input.orderId}:`,
      error,
    );
    return { refunded: false, error: message };
  }
}

/** Compare Stripe amount_total (cents) to order.totalPrice (dollars). */
export function stripeAmountMatchesOrder(
  amountTotalCents: number | null | undefined,
  orderTotalDollars: number | null | undefined,
  toleranceCents = 1,
): boolean {
  if (typeof amountTotalCents !== "number" || !Number.isFinite(amountTotalCents)) {
    return false;
  }
  if (typeof orderTotalDollars !== "number" || !Number.isFinite(orderTotalDollars)) {
    return false;
  }
  const expected = Math.round(orderTotalDollars * 100);
  return Math.abs(amountTotalCents - expected) <= toleranceCents;
}
