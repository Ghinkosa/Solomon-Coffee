import type Stripe from "stripe";
import {
  buildLineDescription,
  getExtraPackagingFee,
  getLinePackagingPrice,
  getLineUnitPrice,
  type OrderDocumentLine,
  type OrderDocumentTotals,
} from "@/lib/orderDocument";

/** @deprecated Prefer OrderDocumentLine — kept for existing imports. */
export type InvoiceOrderLine = OrderDocumentLine;
/** @deprecated Prefer OrderDocumentTotals — kept for existing imports. */
export type InvoiceOrderTotals = OrderDocumentTotals;

/**
 * Build Stripe invoice line items that mirror what the customer was charged.
 * Uses shared order document helpers so PDF and Stripe stay aligned.
 */
export function buildStripeInvoiceLineItems(
  order: OrderDocumentTotals & { products?: OrderDocumentLine[] },
): Stripe.InvoiceItemCreateParams[] {
  const currency = "usd";
  const items: Stripe.InvoiceItemCreateParams[] = [];

  for (const line of order.products || []) {
    if (!line.product?.name) continue;

    const unitAmount = Math.round(
      (getLineUnitPrice(line) + getLinePackagingPrice(line)) *
        line.quantity *
        100,
    );

    if (unitAmount <= 0) continue;

    items.push({
      amount: unitAmount,
      currency,
      description: buildLineDescription(line),
      metadata: {
        productId: line.product._id || "",
        quantity: String(line.quantity),
        weight: line.weight?.value || "",
        packaging: line.packaging?.title || "",
      },
    });
  }

  const extraPackaging = getExtraPackagingFee(order);
  if (extraPackaging > 0) {
    items.push({
      amount: Math.round(extraPackaging * 100),
      currency,
      description: "Packaging",
      metadata: { type: "packaging_fee" },
    });
  }

  if (order.shipping && order.shipping > 0) {
    items.push({
      amount: Math.round(order.shipping * 100),
      currency,
      description: "Shipping",
      metadata: { type: "shipping" },
    });
  }

  if (order.tax && order.tax > 0) {
    items.push({
      amount: Math.round(order.tax * 100),
      currency,
      description: "Tax",
      metadata: { type: "tax" },
    });
  }

  if (order.amountDiscount && order.amountDiscount > 0) {
    items.push({
      amount: -Math.round(order.amountDiscount * 100),
      currency,
      description: "Discount",
      metadata: { type: "discount" },
    });
  }

  const targetTotalCents = Math.round((order.totalPrice || 0) * 100);
  const builtTotalCents = items.reduce(
    (sum, item) => sum + (item.amount || 0),
    0,
  );
  const drift = targetTotalCents - builtTotalCents;

  if (drift !== 0 && targetTotalCents > 0) {
    items.push({
      amount: drift,
      currency,
      description: "Order total adjustment",
      metadata: { type: "reconciliation" },
    });
  }

  return items;
}
