import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/client";
import { requireAdminUser } from "@/lib/adminAuth";
import {
  CHECKOUT_SETTINGS_DOCUMENT_ID,
  buildDefaultStateTaxRates,
  countConfiguredTaxStates,
  fetchCheckoutTaxSettings,
  getAllUsStateCodes,
  normalizeStateTaxSettings,
  percentToRate,
  rateToPercent,
} from "@/lib/tax-settings";
import { getUsStateOptions } from "@/lib/shipping-address-validation";

type AdminStateRateInput = {
  stateCode?: string;
  ratePercent?: number;
  taxShipping?: boolean;
};

function toAdminResponse(
  settings: Awaited<ReturnType<typeof fetchCheckoutTaxSettings>>,
) {
  const labels = new Map(
    getUsStateOptions().map((state) => [state.value, state.label]),
  );

  return {
    taxEnabled: settings.taxEnabled,
    flatShippingFee: settings.flatShippingFee,
    freeShippingThreshold: settings.freeShippingThreshold,
    businessDiscountPercent: rateToPercent(settings.businessDiscountRate),
    premiumDiscountPercent: rateToPercent(settings.premiumDiscountRate),
    taxRatesReviewedAt: settings.taxRatesReviewedAt,
    configuredStateCount: countConfiguredTaxStates(settings),
    stateRates: settings.stateRates.map((row) => ({
      stateCode: row.stateCode,
      stateName: labels.get(row.stateCode) || row.stateCode,
      ratePercent: rateToPercent(row.rate),
      taxShipping: row.taxShipping,
    })),
  };
}

export async function GET() {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const settings = await fetchCheckoutTaxSettings();
    return NextResponse.json({
      success: true,
      settings: toAdminResponse(settings),
    });
  } catch (error) {
    console.error("Admin checkout settings GET failed:", error);
    return NextResponse.json(
      { error: "Failed to load checkout settings" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const body = await request.json();
    const taxEnabled = Boolean(body?.taxEnabled);
    const flatShippingFee = Number(body?.flatShippingFee);
    const freeShippingThreshold = Number(body?.freeShippingThreshold);
    const businessDiscountPercent = Number(body?.businessDiscountPercent);
    const premiumDiscountPercent = Number(body?.premiumDiscountPercent);

    if (
      !Number.isFinite(flatShippingFee) ||
      flatShippingFee < 0 ||
      flatShippingFee > 1000
    ) {
      return NextResponse.json(
        { error: "Flat shipping fee must be between 0 and 1000" },
        { status: 400 },
      );
    }
    if (
      !Number.isFinite(freeShippingThreshold) ||
      freeShippingThreshold < 0 ||
      freeShippingThreshold > 100000
    ) {
      return NextResponse.json(
        { error: "Free shipping threshold must be between 0 and 100000" },
        { status: 400 },
      );
    }
    if (
      !Number.isFinite(businessDiscountPercent) ||
      businessDiscountPercent < 0 ||
      businessDiscountPercent > 100
    ) {
      return NextResponse.json(
        { error: "Business discount must be between 0 and 100" },
        { status: 400 },
      );
    }
    if (
      !Number.isFinite(premiumDiscountPercent) ||
      premiumDiscountPercent < 0 ||
      premiumDiscountPercent > 100
    ) {
      return NextResponse.json(
        { error: "Premium discount must be between 0 and 100" },
        { status: 400 },
      );
    }

    const rows = Array.isArray(body?.stateRates)
      ? (body.stateRates as AdminStateRateInput[])
      : null;

    if (!rows) {
      return NextResponse.json(
        { error: "stateRates array is required" },
        { status: 400 },
      );
    }

    const validCodes = new Set(getAllUsStateCodes());
    const seen = new Set<string>();
    const stateTaxRates: Array<{
      _key: string;
      stateCode: string;
      rate: number;
      taxShipping: boolean;
    }> = [];

    for (const row of rows) {
      const stateCode = String(row.stateCode || "")
        .trim()
        .toUpperCase();
      if (!validCodes.has(stateCode)) {
        return NextResponse.json(
          { error: `Invalid state code: ${row.stateCode || "(empty)"}` },
          { status: 400 },
        );
      }
      if (seen.has(stateCode)) {
        return NextResponse.json(
          { error: `Duplicate state code: ${stateCode}` },
          { status: 400 },
        );
      }
      seen.add(stateCode);

      const ratePercent = Number(row.ratePercent);
      if (!Number.isFinite(ratePercent) || ratePercent < 0 || ratePercent > 100) {
        return NextResponse.json(
          {
            error: `Rate for ${stateCode} must be a number between 0 and 100`,
          },
          { status: 400 },
        );
      }

      stateTaxRates.push({
        _key: stateCode,
        stateCode,
        rate: percentToRate(ratePercent),
        taxShipping: row.taxShipping !== false,
      });
    }

    // Ensure every US state is represented even if the client omitted some.
    const complete = buildDefaultStateTaxRates(
      stateTaxRates.map((row) => ({
        stateCode: row.stateCode,
        rate: row.rate,
        taxShipping: row.taxShipping,
      })),
    ).map((row) => ({
      _key: row.stateCode,
      stateCode: row.stateCode,
      rate: row.rate,
      taxShipping: row.taxShipping,
    }));

    const taxRatesReviewedAt = new Date().toISOString();

    await writeClient.createIfNotExists({
      _id: CHECKOUT_SETTINGS_DOCUMENT_ID,
      _type: "checkoutSettings",
      taxEnabled,
      flatShippingFee,
      freeShippingThreshold,
      businessDiscountPercent,
      premiumDiscountPercent,
      taxRatesReviewedAt,
      stateTaxRates: complete,
    });

    await writeClient
      .patch(CHECKOUT_SETTINGS_DOCUMENT_ID)
      .set({
        taxEnabled,
        flatShippingFee,
        freeShippingThreshold,
        businessDiscountPercent,
        premiumDiscountPercent,
        taxRatesReviewedAt,
        stateTaxRates: complete,
      })
      .commit();

    const settings = normalizeStateTaxSettings({
      taxEnabled,
      flatShippingFee,
      freeShippingThreshold,
      businessDiscountPercent,
      premiumDiscountPercent,
      taxRatesReviewedAt,
      stateTaxRates: complete,
    });

    return NextResponse.json({
      success: true,
      settings: toAdminResponse(settings),
      message: "Checkout settings saved",
    });
  } catch (error) {
    console.error("Admin checkout settings PUT failed:", error);
    return NextResponse.json(
      { error: "Failed to save checkout settings" },
      { status: 500 },
    );
  }
}
