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
    const linePackaging = Math.max(0, item.packagingPrice || 0);
    const discountPercent = clampProductDiscountPercent(item.discountPercent);
    const lineDiscount =
      (discountPercent * lineUnitPrice * item.quantity) / 100;

    subtotal += lineUnitPrice * item.quantity;
    packagingFee += linePackaging * item.quantity;
    productDiscount += lineDiscount;
  }

  const subtotalAfterProductDiscount = Math.max(0, subtotal - productDiscount);
  const businessDiscount =
    subtotalAfterProductDiscount *
    (Number.isFinite(businessDiscountRate)
      ? Math.max(0, Math.min(1, businessDiscountRate))
      : 0);
  const subtotalAfterBusinessDiscount = Math.max(
    0,
    subtotalAfterProductDiscount - businessDiscount,
  );
  const merchandiseBase = subtotalAfterBusinessDiscount + packagingFee;
  const shipping =
    merchandiseBase >= freeShippingThreshold ? 0 : Math.max(0, flatShippingFee);
  const taxableBase = taxShipping
    ? merchandiseBase + shipping
    : merchandiseBase;
  const tax =
    taxableBase * (Number.isFinite(taxRate) ? Math.max(0, taxRate) : 0);

  const roundedSubtotal = roundCurrency(subtotal);
  const roundedProductDiscount = roundCurrency(productDiscount);
  const roundedBusinessDiscount = roundCurrency(businessDiscount);
  const roundedPackaging = roundCurrency(packagingFee);
  const roundedShipping = roundCurrency(shipping);
  const roundedTax = roundCurrency(tax);
  // Single source of truth: total from already-rounded components.
  const total = roundCurrency(
    roundedSubtotal -
      roundedProductDiscount -
      roundedBusinessDiscount +
      roundedPackaging +
      roundedShipping +
      roundedTax,
  );

  return {
    subtotal: roundedSubtotal,
    productDiscount: roundedProductDiscount,
    businessDiscount: roundedBusinessDiscount,
    packagingFee: roundedPackaging,
    shipping: roundedShipping,
    tax: roundedTax,
    total: Math.max(0, total),
  };
}

export function totalsAreClose(
  expected: number,
  actual: number,
  tolerance = 0.01,
): boolean {
  return Math.abs(expected - actual) <= tolerance;
}

/** Product catalog discounts are percentages in 0–100. */
export function clampProductDiscountPercent(
  value: number | undefined | null,
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}
