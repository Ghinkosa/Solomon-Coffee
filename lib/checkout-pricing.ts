export interface CheckoutPricingItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  packagingPrice?: number;
}

export interface CheckoutCartLineInput {
  product: {
    _id: string;
    price?: number;
    discount?: number;
  };
  quantity: number;
  unitPrice: number;
  packagingPrice?: number;
}

export interface CheckoutPricingOptions {
  items: CheckoutPricingItem[];
  businessDiscountRate?: number;
  taxRate?: number;
  freeShippingThreshold?: number;
  flatShippingFee?: number;
}

export interface CheckoutPricingResult {
  subtotal: number;
  productDiscount: number;
  businessDiscount: number;
  packagingFee: number;
  shipping: number;
  tax: number;
  total: number;
}

const DEFAULT_FREE_SHIPPING_THRESHOLD = 100;
const DEFAULT_SHIPPING_FEE = 10;

// Account-level discount rates applied to the post-product-discount subtotal.
export const BUSINESS_DISCOUNT_RATE = 0.02;
export const PREMIUM_DISCOUNT_RATE = 0.05;

export type AccountDiscountType = "business" | "premium" | null;

export interface AccountDiscountProfile {
  isBusiness?: boolean;
  businessStatus?: string;
  // Premium account is marked active via the `isActive` flag once approved.
  isActive?: boolean;
}

/**
 * Resolve the account-level discount for a user profile.
 * Business and premium do NOT stack — the higher applicable rate wins.
 */
export function getAccountDiscount(profile?: AccountDiscountProfile | null): {
  rate: number;
  type: AccountDiscountType;
} {
  if (!profile) return { rate: 0, type: null };

  const businessRate =
    profile.isBusiness && profile.businessStatus === "active"
      ? BUSINESS_DISCOUNT_RATE
      : 0;
  const premiumRate = profile.isActive ? PREMIUM_DISCOUNT_RATE : 0;

  if (businessRate === 0 && premiumRate === 0) {
    return { rate: 0, type: null };
  }

  return premiumRate >= businessRate
    ? { rate: premiumRate, type: "premium" }
    : { rate: businessRate, type: "business" };
}

export function getTaxRate(): number {
  return parseFloat(process.env.NEXT_PUBLIC_TAX_AMOUNT || "0") || 0;
}

export function buildCheckoutPricingItems(
  lines: CheckoutCartLineInput[],
): CheckoutPricingItem[] {
  return lines.map((line) => ({
    productId: line.product._id,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    discountPercent: line.product.discount ?? 0,
    packagingPrice: line.packagingPrice ?? 0,
  }));
}

export function calculateCheckoutTotals(
  options: CheckoutPricingOptions,
): CheckoutPricingResult {
  const {
    items,
    businessDiscountRate = 0,
    taxRate = getTaxRate(),
    freeShippingThreshold = DEFAULT_FREE_SHIPPING_THRESHOLD,
    flatShippingFee = DEFAULT_SHIPPING_FEE,
  } = options;

  let subtotal = 0;
  let productDiscount = 0;
  let packagingFee = 0;

  for (const item of items) {
    const lineUnitPrice = item.unitPrice;
    const linePackaging = item.packagingPrice || 0;
    const discountPercent = item.discountPercent || 0;
    const lineGross = (lineUnitPrice + linePackaging) * item.quantity;
    const lineDiscount = (discountPercent * lineUnitPrice * item.quantity) / 100;

    subtotal += lineUnitPrice * item.quantity;
    packagingFee += linePackaging * item.quantity;
    productDiscount += lineDiscount;
  }

  const subtotalAfterProductDiscount = subtotal - productDiscount;
  const businessDiscount = subtotalAfterProductDiscount * businessDiscountRate;
  const subtotalAfterBusinessDiscount =
    subtotalAfterProductDiscount - businessDiscount;
  const subtotalWithPackaging = subtotalAfterBusinessDiscount + packagingFee;
  const shipping =
    subtotalWithPackaging > freeShippingThreshold ? 0 : flatShippingFee;
  const tax = subtotalWithPackaging * taxRate;
  const total = subtotalWithPackaging + shipping + tax;

  return {
    subtotal: roundCurrency(subtotal),
    productDiscount: roundCurrency(productDiscount),
    businessDiscount: roundCurrency(businessDiscount),
    packagingFee: roundCurrency(packagingFee),
    shipping: roundCurrency(shipping),
    tax: roundCurrency(tax),
    total: roundCurrency(total),
  };
}

export function totalsAreClose(
  expected: number,
  actual: number,
  tolerance = 0.05,
): boolean {
  return Math.abs(expected - actual) <= tolerance;
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}
