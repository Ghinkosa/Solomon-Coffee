/**
 * Available quantity for a cart/checkout line.
 * Prefer weight-option stock when the product has variant inventory.
 */
export function getAvailableStock(
  product: { stock?: number | null } | null | undefined,
  weight?: { stock?: number | null } | null,
): number {
  if (weight != null && typeof weight.stock === "number") {
    return weight.stock;
  }
  if (product != null && typeof product.stock === "number") {
    return product.stock;
  }
  // Undefined stock = unlimited (matches server validation)
  return Number.POSITIVE_INFINITY;
}

export function isOutOfStock(
  product: { stock?: number | null } | null | undefined,
  weight?: { stock?: number | null } | null,
): boolean {
  const available = getAvailableStock(product, weight);
  return Number.isFinite(available) && available <= 0;
}
