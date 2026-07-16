import { readClient } from "@/sanity/lib/client";
import {
  calculateCheckoutTotals,
  totalsAreClose,
  type CheckoutPricingItem,
} from "@/lib/checkout-pricing";
import { getTaxRuleForState } from "@/lib/tax-settings";

interface OrderRequestItem {
  product: {
    _id: string;
    price?: number;
    name?: string;
    category?: string;
  };
  quantity: number;
  weight?: {
    value: string;
    price: number;
  };
  grind?: {
    type: string;
    label: string;
  };
  packaging?: {
    id: string;
    title: string;
    price: number;
  };
}

interface ValidateOrderInput {
  items: OrderRequestItem[];
  totalAmount: number;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  packagingFee?: number;
  businessDiscountRate?: number;
  /** Destination shipping state — tax is resolved server-side from admin settings. */
  shippingState?: string;
}

interface SanityProduct {
  _id: string;
  price?: number;
  discount?: number;
  stock?: number;
  weightOptions?: Array<{
    weight: string;
    price: number;
    stock?: number;
    isDefault?: boolean;
  }>;
  packagingOptions?: Array<{
    packaging?: {
      _id: string;
      price: number;
      title?: string;
    };
  }>;
}

/** Server-resolved line used when persisting the order (never trust client prices). */
export interface ResolvedOrderLine {
  productId: string;
  productName?: string;
  productCategory?: string;
  quantity: number;
  unitPrice: number;
  packagingPrice: number;
  packagingId?: string;
  packagingTitle?: string;
  weightValue?: string;
  grind?: {
    type: string;
    label: string;
  };
}

export async function validateOrderPricing(input: ValidateOrderInput) {
  const productIds = [...new Set(input.items.map((item) => item.product._id))];

  const products = await readClient.fetch<SanityProduct[]>(
    `*[_type == "product" && _id in $ids && (!defined(isArchived) || isArchived != true)]{
      _id,
      price,
      discount,
      stock,
      weightOptions,
      packagingOptions[]{
        packaging->{
          _id,
          price,
          title
        }
      }
    }`,
    { ids: productIds },
  );

  const productMap = new Map(products.map((product) => [product._id, product]));
  const pricingItems: CheckoutPricingItem[] = [];
  const resolvedLines: ResolvedOrderLine[] = [];

  for (const item of input.items) {
    const product = productMap.get(item.product._id);

    if (!product) {
      return { valid: false as const, error: "One or more products were not found" };
    }

    const selectedWeight = item.weight?.value
      ? product.weightOptions?.find((option) => option.weight === item.weight?.value)
      : product.weightOptions?.find((option) => option.isDefault);

    const unitPrice = selectedWeight?.price ?? product.price ?? 0;
    const availableStock =
      selectedWeight?.stock ?? product.stock ?? Number.POSITIVE_INFINITY;

    if (availableStock < item.quantity) {
      return {
        valid: false as const,
        error: `Insufficient stock for ${item.product._id}`,
      };
    }

    const packagingFromDb = item.packaging?.id
      ? product.packagingOptions?.find(
          (option) => option.packaging?._id === item.packaging?.id,
        )?.packaging
      : undefined;

    const packagingPrice = packagingFromDb?.price ?? 0;

    pricingItems.push({
      productId: item.product._id,
      quantity: item.quantity,
      unitPrice,
      discountPercent: product.discount ?? 0,
      // Only ever trust the server-side packaging price. Never fall back to the
      // client-supplied price — an unmatched packaging id contributes $0 and the
      // total check below will reject a tampered cart.
      packagingPrice,
    });

    resolvedLines.push({
      productId: item.product._id,
      productName: item.product.name,
      productCategory: item.product.category,
      quantity: item.quantity,
      unitPrice,
      packagingPrice,
      packagingId: packagingFromDb?._id,
      packagingTitle: packagingFromDb?.title || item.packaging?.title,
      weightValue: selectedWeight?.weight || item.weight?.value,
      grind: item.grind?.type
        ? {
            type: item.grind.type,
            label: item.grind.label,
          }
        : undefined,
    });
  }

  const taxRule = await getTaxRuleForState(input.shippingState);
  const calculated = calculateCheckoutTotals({
    items: pricingItems,
    businessDiscountRate: input.businessDiscountRate ?? 0,
    taxRate: taxRule.taxRate,
    taxShipping: taxRule.taxShipping,
    flatShippingFee: taxRule.flatShippingFee,
    freeShippingThreshold: taxRule.freeShippingThreshold,
  });

  if (!totalsAreClose(calculated.total, input.totalAmount)) {
    console.error("Order pricing mismatch:", {
      clientTotal: input.totalAmount,
      serverTotal: calculated.total,
      shippingState: input.shippingState,
      taxRate: taxRule.taxRate,
      taxShipping: taxRule.taxShipping,
      flatShippingFee: taxRule.flatShippingFee,
      freeShippingThreshold: taxRule.freeShippingThreshold,
    });
    return {
      valid: false as const,
      code: "PRICE_MISMATCH",
      error:
        "Your cart prices are out of date. Please refresh the page or clear your cart and add the items again.",
      calculated,
    };
  }

  return {
    valid: true as const,
    calculated,
    productSubtotal: calculated.subtotal,
    resolvedLines,
    taxRule,
  };
}
