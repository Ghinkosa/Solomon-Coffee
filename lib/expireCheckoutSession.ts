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
