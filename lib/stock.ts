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

/**
 * Decrement product stock for each line in an order.
 * Used after COD placement and after Stripe payment confirmation.
 *
 * When a line has a selected weight variant, the matching `weightOptions[]`
 * entry is decremented; otherwise the product's base `stock` is decremented.
 * This mirrors the stock source that `validateOrderPricing` checks so we never
 * oversell a variant.
 */
export async function decrementOrderStock(
  orderProducts: OrderProductRef[],
): Promise<void> {
  for (const orderProduct of orderProducts) {
    try {
      const productId = orderProduct.product._ref;
      const quantity = orderProduct.quantity;

      const product = await backendClient.getDocument<StockProduct>(productId);

      if (!product) {
        console.warn(`Product with ID ${productId} not found.`);
        continue;
      }

      const selectedWeightValue = orderProduct.weight?.value;

      // Weight-variant line: decrement the matching variant's stock.
      if (selectedWeightValue && Array.isArray(product.weightOptions)) {
        const option = product.weightOptions.find(
          (opt) => opt.weight === selectedWeightValue,
        );

        if (option && typeof option.stock === "number" && option._key) {
          const newStock = Math.max(option.stock - quantity, 0);
          await backendClient
            .patch(productId)
            .set({ [`weightOptions[_key=="${option._key}"].stock`]: newStock })
            .commit();
          continue;
        }
        // Fall through to base stock if the variant has no tracked stock.
      }

      if (typeof product.stock !== "number") {
        console.warn(
          `Product with ID ${productId} has no tracked stock to decrement.`,
        );
        continue;
      }

      const newStock = Math.max(product.stock - quantity, 0);
      await backendClient.patch(productId).set({ stock: newStock }).commit();
    } catch (error) {
      console.error(
        `Failed to update stock for product ${orderProduct.product._ref}:`,
        error,
      );
    }
  }
}
