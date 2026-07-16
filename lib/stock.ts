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
  _rev: string;
  stock?: number;
  weightOptions?: WeightOption[];
}

type StockOp = "inc" | "dec";
const MAX_STOCK_RETRIES = 5;

/**
 * Revision-lock the read/check/write cycle so a decrement can never cross zero.
 * Concurrent mutations conflict and retry against the latest stock value.
 */
async function adjustLineStock(
  orderProduct: OrderProductRef,
  op: StockOp,
): Promise<void> {
  const productId = orderProduct.product._ref;
  const quantity = orderProduct.quantity;

  if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
    throw new Error(`Invalid stock quantity for product ${productId || "unknown"}`);
  }

  for (let attempt = 1; attempt <= MAX_STOCK_RETRIES; attempt += 1) {
    const product = await backendClient.getDocument<StockProduct>(productId);
    if (!product?._rev) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    const selectedWeightValue = orderProduct.weight?.value;
    let path = "stock";
    let currentStock = product.stock;

    if (selectedWeightValue) {
      const option = product.weightOptions?.find(
        (candidate) => candidate.weight === selectedWeightValue,
      );
      if (!option) {
        throw new Error(
          `Weight ${selectedWeightValue} no longer exists for product ${productId}`,
        );
      }
      // A variant with its own numeric stock uses that pool. Otherwise it
      // intentionally shares the product's base stock, matching validation.
      if (option._key && typeof option.stock === "number") {
        path = `weightOptions[_key=="${option._key}"].stock`;
        currentStock = option.stock;
      }
    }

    // Undefined stock intentionally means inventory is not tracked.
    if (typeof currentStock !== "number") return;
    if (op === "dec" && currentStock < quantity) {
      throw new Error(`Insufficient stock for product ${productId}`);
    }

    const nextStock =
      op === "dec" ? currentStock - quantity : currentStock + quantity;

    try {
      await backendClient
        .patch(productId)
        .ifRevisionId(product._rev)
        .set({ [path]: nextStock })
        .commit();
      return;
    } catch (error) {
      if (!isRevisionConflict(error) || attempt === MAX_STOCK_RETRIES) {
        throw error;
      }
    }
  }
}

function isRevisionConflict(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as {
    statusCode?: number;
    status?: number;
    response?: { statusCode?: number; status?: number };
  };
  return (
    candidate.statusCode === 409 ||
    candidate.status === 409 ||
    candidate.response?.statusCode === 409 ||
    candidate.response?.status === 409
  );
}

/**
 * Decrement product stock for each line in an order.
 * Used to reserve inventory when an order is created.
 *
 * When a line has a selected weight variant, the matching `weightOptions[]`
 * entry is decremented; otherwise the product's base `stock` is decremented.
 * This mirrors the stock source that `validateOrderPricing` checks.
 *
 * Pass `{ strict: true }` from order creation so a reservation failure aborts
 * the checkout instead of leaving an oversold order in place. Already-decremented
 * lines are restored before the error is rethrown.
 */
export async function decrementOrderStock(
  orderProducts: OrderProductRef[],
  options?: { strict?: boolean },
): Promise<void> {
  const strict = options?.strict === true;
  const completed: OrderProductRef[] = [];

  for (const orderProduct of orderProducts) {
    try {
      await adjustLineStock(orderProduct, "dec");
      completed.push(orderProduct);
    } catch (error) {
      console.error(
        `Failed to decrement stock for product ${orderProduct.product._ref}:`,
        error,
      );
      if (strict) {
        if (completed.length > 0) {
          await incrementOrderStock(completed);
        }
        throw error instanceof Error
          ? error
          : new Error(
              `Failed to reserve stock for ${orderProduct.product._ref}`,
            );
      }
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
 * orders that never reserved inventory — those are no-ops.
 */
export async function restoreOrderStock(
  orderId: string,
  options?: { throwOnError?: boolean },
): Promise<void> {
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
    if (options?.throwOnError) throw error;
  }
}
