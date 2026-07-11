import { readClient } from "@/sanity/lib/client";
import {
  calculateCheckoutTotals,
  totalsAreClose,
  type CheckoutPricingItem,
} from "@/lib/checkout-pricing";

interface OrderRequestItem {
  product: {
    _id: string;
    price?: number;
  };
  quantity: number;
  weight?: {
    value: string;
    price: number;
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
    };
  }>;
}

export async function validateOrderPricing(input: ValidateOrderInput) {
  const productIds = [...new Set(input.items.map((item) => item.product._id))];

  const products = await readClient.fetch<SanityProduct[]>(
    `*[_type == "product" && _id in $ids]{
      _id,
      price,
      discount,
      stock,
      weightOptions,
      packagingOptions[]{
        packaging->{
          _id,
          price
        }
      }
    }`,
    { ids: productIds },
  );

  const productMap = new Map(products.map((product) => [product._id, product]));
  const pricingItems: CheckoutPricingItem[] = [];

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

    pricingItems.push({
      productId: item.product._id,
      quantity: item.quantity,
      unitPrice,
      discountPercent: product.discount ?? 0,
      packagingPrice: packagingFromDb?.price ?? item.packaging?.price ?? 0,
    });
  }

  const calculated = calculateCheckoutTotals({
    items: pricingItems,
    businessDiscountRate: input.businessDiscountRate ?? 0,
  });

  if (!totalsAreClose(calculated.total, input.totalAmount)) {
    console.error("Order pricing mismatch:", {
      clientTotal: input.totalAmount,
      serverTotal: calculated.total,
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
  };
}
