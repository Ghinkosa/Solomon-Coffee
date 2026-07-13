import type Stripe from "stripe";

export interface InvoiceOrderLine {
  quantity: number;
  weight?: { value?: string; price?: number };
  grind?: { label?: string };
  packaging?: { title?: string; price?: number };
  product?: { _id?: string; name?: string; price?: number };
}

export interface InvoiceOrderTotals {
  subtotal?: number;
  packagingFee?: number;
  shipping?: number;
  tax?: number;
  amountDiscount?: number;
  totalPrice?: number;
  orderNumber?: string;
}

function getLineUnitPrice(line: InvoiceOrderLine): number {
  return line.weight?.price ?? line.product?.price ?? 0;
}

function getLinePackagingPrice(line: InvoiceOrderLine): number {
  return line.packaging?.price ?? 0;
}

function buildLineDescription(line: InvoiceOrderLine): string {
  const name = line.product?.name || "Product";
  let description = `${name} x ${line.quantity}`;

  if (line.weight?.value) {
    description += `\nWeight: ${line.weight.value}`;
  }
  if (line.grind?.label) {
    description += `\nGrind: ${line.grind.label}`;
  }
  if (line.packaging?.title) {
    description += `\nPackaging: ${line.packaging.title}`;
  }

  return description;
}

/**
 * Build Stripe invoice line items that mirror what the customer was charged.
 * Uses weight/packaging prices from the order line, then order-level fees and
 * discounts so the invoice total aligns with `order.totalPrice`.
 */
export function buildStripeInvoiceLineItems(
  order: InvoiceOrderTotals & { products?: InvoiceOrderLine[] },
): Stripe.InvoiceItemCreateParams[] {
  const currency = "usd";
  const items: Stripe.InvoiceItemCreateParams[] = [];

  for (const line of order.products || []) {
    if (!line.product?.name) continue;

    const unitAmount = Math.round(
      (getLineUnitPrice(line) + getLinePackagingPrice(line)) * line.quantity * 100,
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

  // Order-level packaging not already captured on individual lines.
  const linePackagingTotal = (order.products || []).reduce(
    (sum, line) => sum + getLinePackagingPrice(line) * line.quantity,
    0,
  );
  const extraPackaging = (order.packagingFee || 0) - linePackagingTotal;
  if (extraPackaging > 0.01) {
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

  // Reconcile rounding drift so the invoice matches the charged total exactly.
  const targetTotalCents = Math.round((order.totalPrice || 0) * 100);
  const builtTotalCents = items.reduce((sum, item) => sum + (item.amount || 0), 0);
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
