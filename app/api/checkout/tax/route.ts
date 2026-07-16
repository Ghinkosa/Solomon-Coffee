import { NextRequest, NextResponse } from "next/server";
import {
  fetchCheckoutTaxSettings,
  rateToPercent,
  resolveTaxRuleForState,
} from "@/lib/tax-settings";
import { normalizeUsState } from "@/lib/shipping-address-validation";

export async function GET(request: NextRequest) {
  try {
    const rawState = request.nextUrl.searchParams.get("state") || "";
    const stateCode = rawState ? normalizeUsState(rawState) : "";

    if (rawState && (!stateCode || stateCode.length !== 2)) {
      return NextResponse.json(
        { error: "A valid US state code is required" },
        { status: 400 },
      );
    }

    const settings = await fetchCheckoutTaxSettings();
    const rule = resolveTaxRuleForState(settings, stateCode);

    return NextResponse.json(
      {
        success: true,
        stateCode: rule.stateCode,
        taxEnabled: rule.taxEnabled,
        taxRate: rule.taxRate,
        ratePercent: rateToPercent(rule.taxRate),
        taxShipping: rule.taxShipping,
        flatShippingFee: rule.flatShippingFee,
        freeShippingThreshold: rule.freeShippingThreshold,
        businessDiscountRate: settings.businessDiscountRate,
        premiumDiscountRate: settings.premiumDiscountRate,
        businessDiscountPercent: rateToPercent(settings.businessDiscountRate),
        premiumDiscountPercent: rateToPercent(settings.premiumDiscountRate),
      },
      {
        headers: {
          "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    console.error("Checkout tax lookup failed:", error);
    return NextResponse.json(
      { error: "Failed to resolve tax for state" },
      { status: 500 },
    );
  }
}
