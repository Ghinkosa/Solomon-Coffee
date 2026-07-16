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
  /** Decimal tax rate for the destination state (e.g. 0.0625). Defaults to 0. */
  taxRate?: number;
  /** When true, shipping is included in the taxable base. */
  taxShipping?: boolean;
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

export const DEFAULT_FREE_SHIPPING_THRESHOLD = 100;
export const DEFAULT_SHIPPING_FEE = 10;

/** Default used before admin checkout settings load. */
export function getFreeShippingThreshold(): number {
  return DEFAULT_FREE_SHIPPING_THRESHOLD;
}

/** Default used before admin checkout settings load. */
export function getFlatShippingFee(): number {
  return DEFAULT_SHIPPING_FEE;
}

// Account-level discount rates applied to the post-product-discount subtotal.
export const BUSINESS_DISCOUNT_RATE = 0.02;
export const PREMIUM_DISCOUNT_RATE = 0.05;

export type AccountDiscountType = "business" | "premium" | null;

export interface AccountDiscountProfile {
  isBusiness?: boolean;
  businessStatus?: string;
  isActive?: boolean;
  premiumStatus?: string;
}

export interface AccountDiscountRates {
  /** Decimal rate, e.g. 0.02 for 2%. Defaults to BUSINESS_DISCOUNT_RATE. */
  businessRate?: number;
  /** Decimal rate, e.g. 0.05 for 5%. Defaults to PREMIUM_DISCOUNT_RATE. */
  premiumRate?: number;
}

/**
 * Resolve the account-level discount for a user profile.
 * Business and premium do NOT stack — the higher applicable rate wins.
 */
export function getAccountDiscount(
  profile?: AccountDiscountProfile | null,
  rates?: AccountDiscountRates | null,
): {
  rate: number;
  type: AccountDiscountType;
} {
  if (!profile) return { rate: 0, type: null };

  const configuredBusiness = clampDiscountRate(
    rates?.businessRate,
    BUSINESS_DISCOUNT_RATE,
  );
  const configuredPremium = clampDiscountRate(
    rates?.premiumRate,
    PREMIUM_DISCOUNT_RATE,
  );

  const businessRate =
    profile.isBusiness && profile.businessStatus === "active"
      ? configuredBusiness
      : 0;
  const premiumRate =
    profile.isActive && profile.premiumStatus === "active"
      ? configuredPremium
      : 0;

  if (businessRate === 0 && premiumRate === 0) {
    return { rate: 0, type: null };
  }

  return premiumRate >= businessRate
    ? { rate: premiumRate, type: "premium" }
    : { rate: businessRate, type: "business" };
}

function clampDiscountRate(
  rate: number | undefined,
  fallback: number,
): number {
  if (typeof rate !== "number" || !Number.isFinite(rate)) return fallback;
  if (rate < 0) return 0;
  if (rate > 1) return 1;
  return rate;
}

/**
 * @deprecated Tax is destination-based via admin checkout settings.
 * Kept as a zero stub so accidental callers never read NEXT_PUBLIC_TAX_AMOUNT.
 */
export function getTaxRate(): number {
  return 0;
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
    taxRate = 0,
    taxShipping = false,
    freeShippingThreshold = getFreeShippingThreshold(),
    flatShippingFee = getFlatShippingFee(),
  } = options;

  let subtotal = 0;
  let productDiscount = 0;
  let packagingFee = 0;

  for (const item of items) {
    const lineUnitPrice = item.unitPrice;
    const linePackaging = item.packagingPrice || 0;
    const discountPercent = item.discountPercent || 0;
    const lineDiscount = (discountPercent * lineUnitPrice * item.quantity) / 100;

    subtotal += lineUnitPrice * item.quantity;
    packagingFee += linePackaging * item.quantity;
    productDiscount += lineDiscount;
  }

  const subtotalAfterProductDiscount = subtotal - productDiscount;
  const businessDiscount = subtotalAfterProductDiscount * businessDiscountRate;
  const subtotalAfterBusinessDiscount =
    subtotalAfterProductDiscount - businessDiscount;
  const merchandiseBase = subtotalAfterBusinessDiscount + packagingFee;
  const shipping =
    merchandiseBase >= freeShippingThreshold ? 0 : flatShippingFee;
  const taxableBase = taxShipping
    ? merchandiseBase + shipping
    : merchandiseBase;
  const tax = taxableBase * (Number.isFinite(taxRate) ? Math.max(0, taxRate) : 0);
  const total = merchandiseBase + shipping + tax;

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
