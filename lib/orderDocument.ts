/**
 * Shared order document model for Stripe invoices and admin PDF downloads.
 * Keep pricing/description rules identical across both outputs.
 */

export interface OrderDocumentLine {
  quantity: number;
  weight?: { value?: string; price?: number };
  grind?: { label?: string; type?: string };
  packaging?: { title?: string; price?: number };
  product?: { _id?: string; name?: string; price?: number };
}

export interface OrderDocumentTotals {
  subtotal?: number;
  packagingFee?: number;
  shipping?: number;
  tax?: number;
  amountDiscount?: number;
  totalPrice?: number;
  orderNumber?: string;
}

export interface OrderDocumentLineRow {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  packagingPrice: number;
  lineTotal: number;
  productId: string;
  weight?: string;
  packaging?: string;
}

export function getLineUnitPrice(line: OrderDocumentLine): number {
  return line.weight?.price ?? line.product?.price ?? 0;
}

export function getLinePackagingPrice(line: OrderDocumentLine): number {
  return line.packaging?.price ?? 0;
}

export function buildLineDescription(line: OrderDocumentLine): string {
  const name = line.product?.name || "Product";
  let description = `${name} x ${line.quantity}`;

  if (line.weight?.value) {
    description += `\nWeight: ${line.weight.value}`;
  }
  if (line.grind?.label || line.grind?.type) {
    description += `\nGrind: ${line.grind.label || line.grind.type}`;
  }
  if (line.packaging?.title) {
    description += `\nPackaging: ${line.packaging.title}`;
  }

  return description;
}

export function buildOrderLineRows(
  products: OrderDocumentLine[] | undefined,
): OrderDocumentLineRow[] {
  const rows: OrderDocumentLineRow[] = [];

  for (const line of products || []) {
    if (!line.product?.name) continue;

    const unitPrice = getLineUnitPrice(line);
    const packagingPrice = getLinePackagingPrice(line);
    const lineTotal = (unitPrice + packagingPrice) * line.quantity;

    rows.push({
      name: line.product.name,
      description: buildLineDescription(line),
      quantity: line.quantity,
      unitPrice,
      packagingPrice,
      lineTotal,
      productId: line.product._id || "",
      weight: line.weight?.value,
      packaging: line.packaging?.title,
    });
  }

  return rows;
}

export function getLinePackagingTotal(
  products: OrderDocumentLine[] | undefined,
): number {
  return (products || []).reduce(
    (sum, line) => sum + getLinePackagingPrice(line) * line.quantity,
    0,
  );
}

export function getExtraPackagingFee(
  order: OrderDocumentTotals & { products?: OrderDocumentLine[] },
): number {
  const extra = (order.packagingFee || 0) - getLinePackagingTotal(order.products);
  return extra > 0.01 ? extra : 0;
}

export function normalizeOrderTotals(
  order: OrderDocumentTotals & { products?: OrderDocumentLine[] },
): {
  subtotal: number;
  packagingFee: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currencyCode: string;
} {
  const rows = buildOrderLineRows(order.products);
  const computedSubtotal = rows.reduce((sum, row) => sum + row.lineTotal, 0);

  return {
    subtotal:
      typeof order.subtotal === "number" ? order.subtotal : computedSubtotal,
    packagingFee: getExtraPackagingFee(order),
    shipping: order.shipping || 0,
    tax: order.tax || 0,
    discount: order.amountDiscount || 0,
    total: order.totalPrice || 0,
    currencyCode: "USD",
  };
}
