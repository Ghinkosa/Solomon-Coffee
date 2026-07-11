import { backendClient } from "@/sanity/lib/backendClient";

export interface OrderProductRef {
  product: { _ref: string };
  quantity: number;
}

/**
 * Decrement product stock for each line in an order.
 * Used after COD placement and after Stripe payment confirmation.
 */
export async function decrementOrderStock(
  orderProducts: OrderProductRef[],
): Promise<void> {
  for (const orderProduct of orderProducts) {
    try {
      const productId = orderProduct.product._ref;
      const quantity = orderProduct.quantity;

      const product = await backendClient.getDocument(productId);

      if (!product || typeof product.stock !== "number") {
        console.warn(
          `Product with ID ${productId} not found or stock is invalid.`,
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
