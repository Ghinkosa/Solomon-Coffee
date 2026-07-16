import { getUsStateOptions } from "@/lib/shipping-address-validation";
import {
  BUSINESS_DISCOUNT_RATE,
  PREMIUM_DISCOUNT_RATE,
} from "@/lib/checkout-pricing";

export const CHECKOUT_SETTINGS_DOCUMENT_ID = "checkoutSettings";

export interface StateTaxRule {
  stateCode: string;
  /** Decimal rate, e.g. 0.0625 for 6.25%. */
  rate: number;
  taxShipping: boolean;
}

export interface CheckoutTaxSettings {
  taxEnabled: boolean;
  stateRates: StateTaxRule[];
  flatShippingFee: number;
  freeShippingThreshold: number;
  /** Decimal account discount rates (e.g. 0.02 for 2%). */
  businessDiscountRate: number;
  premiumDiscountRate: number;
  /** ISO timestamp of last admin tax settings save/review. */
  taxRatesReviewedAt: string | null;
}

export interface ResolvedTaxRule {
  stateCode: string;
  taxEnabled: boolean;
  /** Decimal rate applied at checkout (0 when disabled/missing). */
  taxRate: number;
  taxShipping: boolean;
  flatShippingFee: number;
  freeShippingThreshold: number;
  businessDiscountRate: number;
  premiumDiscountRate: number;
}

export const DEFAULT_FLAT_SHIPPING_FEE = 10;
export const DEFAULT_FREE_SHIPPING_THRESHOLD = 100;

const EMPTY_SETTINGS: CheckoutTaxSettings = {
  taxEnabled: false,
  stateRates: [],
  flatShippingFee: DEFAULT_FLAT_SHIPPING_FEE,
  freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
  businessDiscountRate: BUSINESS_DISCOUNT_RATE,
  premiumDiscountRate: PREMIUM_DISCOUNT_RATE,
  taxRatesReviewedAt: null,
};

export function getAllUsStateCodes(): string[] {
  return getUsStateOptions().map((state) => state.value);
}

export function buildDefaultStateTaxRates(
  existing: StateTaxRule[] = [],
): StateTaxRule[] {
  const byCode = new Map(
    existing.map((row) => [row.stateCode.toUpperCase(), row]),
  );

  return getUsStateOptions().map((state) => {
    const current = byCode.get(state.value);
    return {
      stateCode: state.value,
      rate: clampRate(current?.rate ?? 0),
      taxShipping: current?.taxShipping ?? true,
    };
  });
}

export function normalizeStateTaxSettings(raw: {
  taxEnabled?: boolean;
  flatShippingFee?: number;
  freeShippingThreshold?: number;
  businessDiscountRate?: number;
  premiumDiscountRate?: number;
  businessDiscountPercent?: number;
  premiumDiscountPercent?: number;
  taxRatesReviewedAt?: string | null;
  stateTaxRates?: Array<{
    stateCode?: string;
    rate?: number;
    taxShipping?: boolean;
  }>;
} | null): CheckoutTaxSettings {
  if (!raw) {
    return { ...EMPTY_SETTINGS, stateRates: buildDefaultStateTaxRates() };
  }

  const seen = new Set<string>();
  const parsed: StateTaxRule[] = [];

  for (const row of raw.stateTaxRates || []) {
    const stateCode = String(row.stateCode || "")
      .trim()
      .toUpperCase();
    if (!stateCode || seen.has(stateCode)) continue;
    seen.add(stateCode);
    parsed.push({
      stateCode,
      rate: clampRate(typeof row.rate === "number" ? row.rate : 0),
      taxShipping: row.taxShipping !== false,
    });
  }

  const businessDiscountRate = resolveDiscountRate(
    raw.businessDiscountRate,
    raw.businessDiscountPercent,
    BUSINESS_DISCOUNT_RATE,
  );
  const premiumDiscountRate = resolveDiscountRate(
    raw.premiumDiscountRate,
    raw.premiumDiscountPercent,
    PREMIUM_DISCOUNT_RATE,
  );

  const reviewedAt =
    typeof raw.taxRatesReviewedAt === "string" &&
    raw.taxRatesReviewedAt.trim().length > 0
      ? raw.taxRatesReviewedAt
      : null;

  return {
    taxEnabled: Boolean(raw.taxEnabled),
    stateRates: buildDefaultStateTaxRates(parsed),
    flatShippingFee: normalizeMoney(
      raw.flatShippingFee,
      DEFAULT_FLAT_SHIPPING_FEE,
    ),
    freeShippingThreshold: normalizeMoney(
      raw.freeShippingThreshold,
      DEFAULT_FREE_SHIPPING_THRESHOLD,
    ),
    businessDiscountRate,
    premiumDiscountRate,
    taxRatesReviewedAt: reviewedAt,
  };
}

export function resolveTaxRuleForState(
  settings: CheckoutTaxSettings,
  stateCode: string | null | undefined,
): ResolvedTaxRule {
  const normalized = String(stateCode || "")
    .trim()
    .toUpperCase();

  const shared = {
    flatShippingFee: settings.flatShippingFee,
    freeShippingThreshold: settings.freeShippingThreshold,
    businessDiscountRate: settings.businessDiscountRate,
    premiumDiscountRate: settings.premiumDiscountRate,
  };

  if (!settings.taxEnabled || !normalized) {
    return {
      stateCode: normalized,
      taxEnabled: false,
      taxRate: 0,
      taxShipping: false,
      ...shared,
    };
  }

  const match = settings.stateRates.find((row) => row.stateCode === normalized);
  if (!match || match.rate <= 0) {
    return {
      stateCode: normalized,
      taxEnabled: true,
      taxRate: 0,
      taxShipping: Boolean(match?.taxShipping),
      ...shared,
    };
  }

  return {
    stateCode: normalized,
    taxEnabled: true,
    taxRate: match.rate,
    taxShipping: match.taxShipping,
    ...shared,
  };
}

export async function fetchCheckoutTaxSettings(): Promise<CheckoutTaxSettings> {
  try {
    const { readClient } = await import("@/sanity/lib/client");
    const doc = await readClient.fetch<{
      taxEnabled?: boolean;
      flatShippingFee?: number;
      freeShippingThreshold?: number;
      businessDiscountPercent?: number;
      premiumDiscountPercent?: number;
      taxRatesReviewedAt?: string | null;
      stateTaxRates?: Array<{
        stateCode?: string;
        rate?: number;
        taxShipping?: boolean;
      }>;
    } | null>(
      `*[_type == "checkoutSettings" && _id == $id][0]{
        taxEnabled,
        flatShippingFee,
        freeShippingThreshold,
        businessDiscountPercent,
        premiumDiscountPercent,
        taxRatesReviewedAt,
        stateTaxRates[]{ stateCode, rate, taxShipping }
      }`,
      { id: CHECKOUT_SETTINGS_DOCUMENT_ID },
    );

    return normalizeStateTaxSettings(doc);
  } catch (error) {
    console.error("Failed to load checkout tax settings:", error);
    return { ...EMPTY_SETTINGS, stateRates: buildDefaultStateTaxRates() };
  }
}

export async function getTaxRuleForState(
  stateCode: string | null | undefined,
): Promise<ResolvedTaxRule> {
  const settings = await fetchCheckoutTaxSettings();
  return resolveTaxRuleForState(settings, stateCode);
}

export function percentToRate(percent: number): number {
  return clampRate(percent / 100);
}

export function rateToPercent(rate: number): number {
  return Math.round(clampRate(rate) * 100000) / 1000;
}

export function countConfiguredTaxStates(settings: CheckoutTaxSettings): number {
  return settings.stateRates.filter((row) => row.rate > 0).length;
}

function resolveDiscountRate(
  rate: number | undefined,
  percent: number | undefined,
  fallback: number,
): number {
  if (typeof rate === "number" && Number.isFinite(rate)) {
    return clampRate(rate);
  }
  if (typeof percent === "number" && Number.isFinite(percent)) {
    return percentToRate(percent);
  }
  return clampRate(fallback);
}

function clampRate(rate: number): number {
  if (!Number.isFinite(rate)) return 0;
  if (rate < 0) return 0;
  if (rate > 1) return 1;
  return Math.round(rate * 1_000_000) / 1_000_000;
}

function normalizeMoney(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return fallback;
  }
  return Math.round(value * 100) / 100;
}
