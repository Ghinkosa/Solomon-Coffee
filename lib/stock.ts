import { backendClient } from "@/sanity/lib/backendClient";

export interface OrderProductRef {
  product: { _ref: string };
  quantity: number;
  weight?: {
    value?: string;
    price?: number;
  };
}

interface WeightOption {
  _key?: string;
  weight?: string;
  stock?: number;
  isDefault?: boolean;
}

interface StockProduct {
  _id: string;
  stock?: number;
  weightOptions?: WeightOption[];
}

type StockOp = "inc" | "dec";

/**
 * Atomically adjust stock for a single order line.
 *
 * The product is read only to resolve the target field path (base stock vs the
 * matching weight-variant `_key`) and to confirm a numeric stock field exists —
 * never to compute the new value. The mutation itself uses Sanity's atomic
 * `inc()`/`dec()`, so concurrent adjustments can't lose updates.
 */
async function adjustLineStock(
  orderProduct: OrderProductRef,
  op: StockOp,
): Promise<void> {
  const productId = orderProduct.product._ref;
  const quantity = orderProduct.quantity;

  if (!productId || typeof quantity !== "number" || quantity <= 0) return;

  const product = await backendClient.getDocument<StockProduct>(productId);

  if (!product) {
    console.warn(`Product with ID ${productId} not found.`);
    return;
  }

  const selectedWeightValue = orderProduct.weight?.value;

  // Weight-variant line: adjust the matching variant's stock atomically.
  if (selectedWeightValue && Array.isArray(product.weightOptions)) {
    const option = product.weightOptions.find(
      (opt) => opt.weight === selectedWeightValue,
    );

    if (option?._key && typeof option.stock === "number") {
      const path = `weightOptions[_key=="${option._key}"].stock`;
      const patch = backendClient.patch(productId);
      await (op === "dec"
        ? patch.dec({ [path]: quantity })
        : patch.inc({ [path]: quantity })
      ).commit();
      return;
    }
    // Fall through to base stock if the variant has no tracked stock.
  }

  if (typeof product.stock !== "number") {
    console.warn(
      `Product with ID ${productId} has no tracked stock to adjust.`,
    );
    return;
  }

  const patch = backendClient.patch(productId);
  await (op === "dec"
    ? patch.dec({ stock: quantity })
    : patch.inc({ stock: quantity })
  ).commit();
}

/**
 * Decrement product stock for each line in an order.
 * Used after COD placement and after Stripe payment confirmation.
 *
 * When a line has a selected weight variant, the matching `weightOptions[]`
 * entry is decremented; otherwise the product's base `stock` is decremented.
 * This mirrors the stock source that `validateOrderPricing` checks.
 */
export async function decrementOrderStock(
  orderProducts: OrderProductRef[],
): Promise<void> {
  for (const orderProduct of orderProducts) {
    try {
      await adjustLineStock(orderProduct, "dec");
    } catch (error) {
      console.error(
        `Failed to decrement stock for product ${orderProduct.product._ref}:`,
        error,
      );
    }
  }
}

/**
 * Increment product stock for each line in an order — the inverse of
 * `decrementOrderStock`. Used to return inventory when an order is cancelled.
 */
export async function incrementOrderStock(
  orderProducts: OrderProductRef[],
): Promise<void> {
  for (const orderProduct of orderProducts) {
    try {
      await adjustLineStock(orderProduct, "inc");
    } catch (error) {
      console.error(
        `Failed to restore stock for product ${orderProduct.product._ref}:`,
        error,
      );
    }
  }
}

/**
 * Restore stock for a cancelled order — idempotent and self-guarding.
 *
 * Only restores when the order actually had stock decremented
 * (`stockDecremented === true`) and hasn't already been restored
 * (`stockRestored !== true`), so it is safe to call from every cancellation
 * path (user self-cancel, admin cancel, cancellation-request approval) and for
 * orders that never decremented (e.g. unpaid Stripe orders) — those are no-ops.
 */
export async function restoreOrderStock(orderId: string): Promise<void> {
  try {
    const order = await backendClient.fetch<{
      stockDecremented?: boolean;
      stockRestored?: boolean;
      products?: OrderProductRef[];
    } | null>(
      `*[_type == "order" && _id == $orderId][0]{
        stockDecremented, stockRestored, products
      }`,
      { orderId },
    );

    if (!order) return;
    if (!order.stockDecremented || order.stockRestored) return;
    if (!order.products || order.products.length === 0) return;

    await incrementOrderStock(order.products);

    await backendClient
      .patch(orderId)
      .set({ stockRestored: true })
      .commit();
  } catch (error) {
    console.error(`Failed to restore stock for order ${orderId}:`, error);
  }
}
