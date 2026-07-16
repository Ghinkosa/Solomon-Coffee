"use client";

import { useEffect, useState } from "react";
import {
  BUSINESS_DISCOUNT_RATE,
  DEFAULT_FREE_SHIPPING_THRESHOLD,
  DEFAULT_SHIPPING_FEE,
  PREMIUM_DISCOUNT_RATE,
} from "@/lib/checkout-pricing";

export type CheckoutPublicSettings = {
  flatShippingFee: number;
  freeShippingThreshold: number;
  businessDiscountRate: number;
  premiumDiscountRate: number;
  businessDiscountPercent: number;
  premiumDiscountPercent: number;
  loading: boolean;
};

const DEFAULTS: Omit<CheckoutPublicSettings, "loading"> = {
  flatShippingFee: DEFAULT_SHIPPING_FEE,
  freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
  businessDiscountRate: BUSINESS_DISCOUNT_RATE,
  premiumDiscountRate: PREMIUM_DISCOUNT_RATE,
  businessDiscountPercent: BUSINESS_DISCOUNT_RATE * 100,
  premiumDiscountPercent: PREMIUM_DISCOUNT_RATE * 100,
};

/**
 * Shared client fetch for public checkout shipping/discount settings.
 * Uses /api/checkout/tax without a state (tax quote is not needed).
 */
export function useCheckoutSettings(): CheckoutPublicSettings {
  const [settings, setSettings] = useState<CheckoutPublicSettings>({
    ...DEFAULTS,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/checkout/tax")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load checkout settings");
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        setSettings({
          flatShippingFee:
            typeof data.flatShippingFee === "number"
              ? data.flatShippingFee
              : DEFAULTS.flatShippingFee,
          freeShippingThreshold:
            typeof data.freeShippingThreshold === "number"
              ? data.freeShippingThreshold
              : DEFAULTS.freeShippingThreshold,
          businessDiscountRate:
            typeof data.businessDiscountRate === "number"
              ? data.businessDiscountRate
              : DEFAULTS.businessDiscountRate,
          premiumDiscountRate:
            typeof data.premiumDiscountRate === "number"
              ? data.premiumDiscountRate
              : DEFAULTS.premiumDiscountRate,
          businessDiscountPercent:
            typeof data.businessDiscountPercent === "number"
              ? data.businessDiscountPercent
              : DEFAULTS.businessDiscountPercent,
          premiumDiscountPercent:
            typeof data.premiumDiscountPercent === "number"
              ? data.premiumDiscountPercent
              : DEFAULTS.premiumDiscountPercent,
          loading: false,
        });
      })
      .catch((error) => {
        console.error("Checkout settings lookup failed:", error);
        if (!cancelled) {
          setSettings((prev) => ({ ...prev, loading: false }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return settings;
}

export function formatUsdAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Replace `{amount}` placeholders with a formatted USD amount. */
export function withAmount(
  template: string | undefined,
  amount: number,
  fallback: string,
): string {
  const source = template && template.trim().length > 0 ? template : fallback;
  return source.replace(/\{amount\}/g, formatUsdAmount(amount));
}
