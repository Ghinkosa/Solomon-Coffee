import stripe from "@/lib/stripe";

/**
 * Best-effort expire of an open Stripe Checkout Session.
 * Safe to call on every cancel path so a late payment cannot revive the order.
 */
export async function expireCheckoutSessionIfOpen(
  sessionId: string | null | undefined,
): Promise<void> {
  const id = sessionId?.trim();
  if (!id) return;

  try {
    const session = await stripe.checkout.sessions.retrieve(id);
    if (session.status === "open") {
      await stripe.checkout.sessions.expire(id);
    }
  } catch (error) {
    // Session may already be complete/expired — never block cancellation.
    console.error(`Failed to expire checkout session ${id}:`, error);
  }
}

/**
 * Before creating a replacement Checkout Session, expire any prior open session
 * so the customer cannot complete two payments for the same order.
 */
export async function expirePriorCheckoutSession(
  priorSessionId: string | null | undefined,
  nextSessionId?: string | null,
): Promise<void> {
  const prior = priorSessionId?.trim();
  const next = nextSessionId?.trim();
  if (!prior || (next && prior === next)) return;
  await expireCheckoutSessionIfOpen(prior);
}
