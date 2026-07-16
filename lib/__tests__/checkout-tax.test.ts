import assert from "node:assert/strict";
import {
  calculateCheckoutTotals,
  getAccountDiscount,
} from "../checkout-pricing";
import {
  buildDefaultStateTaxRates,
  countConfiguredTaxStates,
  normalizeStateTaxSettings,
  percentToRate,
  rateToPercent,
  resolveTaxRuleForState,
} from "../tax-settings";

function line(overrides: Partial<{
  unitPrice: number;
  quantity: number;
  discountPercent: number;
  packagingPrice: number;
}> = {}) {
  return {
    productId: "p1",
    quantity: overrides.quantity ?? 1,
    unitPrice: overrides.unitPrice ?? 40,
    discountPercent: overrides.discountPercent ?? 0,
    packagingPrice: overrides.packagingPrice ?? 0,
  };
}

function run() {
  // Disabled / zero tax
  {
    const totals = calculateCheckoutTotals({
      items: [line({ unitPrice: 50 })],
      taxRate: 0,
      taxShipping: true,
      freeShippingThreshold: 100,
      flatShippingFee: 10,
    });
    assert.equal(totals.tax, 0);
    assert.equal(totals.shipping, 10);
    assert.equal(totals.total, 60);
  }

  // State rate on merchandise + packaging, shipping excluded
  {
    const totals = calculateCheckoutTotals({
      items: [line({ unitPrice: 40, packagingPrice: 5, quantity: 2 })],
      taxRate: 0.1,
      taxShipping: false,
      freeShippingThreshold: 1000,
      flatShippingFee: 10,
    });
    // merchandise = 80 + 10 = 90; tax = 9; shipping = 10; total = 109
    assert.equal(totals.subtotal, 80);
    assert.equal(totals.packagingFee, 10);
    assert.equal(totals.shipping, 10);
    assert.equal(totals.tax, 9);
    assert.equal(totals.total, 109);
  }

  // Taxable shipping included
  {
    const totals = calculateCheckoutTotals({
      items: [line({ unitPrice: 40, packagingPrice: 5, quantity: 2 })],
      taxRate: 0.1,
      taxShipping: true,
      freeShippingThreshold: 1000,
      flatShippingFee: 10,
    });
    // taxable base = 90 + 10 = 100; tax = 10; total = 110
    assert.equal(totals.tax, 10);
    assert.equal(totals.total, 110);
  }

  // Product discount then account discount, then tax
  {
    const totals = calculateCheckoutTotals({
      items: [line({ unitPrice: 100, discountPercent: 10 })],
      businessDiscountRate: 0.05,
      taxRate: 0.08,
      taxShipping: false,
      freeShippingThreshold: 1000,
      flatShippingFee: 10,
    });
    // subtotal 100, product discount 10 => 90, business 4.5 => 85.5
    // shipping 10, tax on 85.5 = 6.84, total = 102.34
    assert.equal(totals.productDiscount, 10);
    assert.equal(totals.businessDiscount, 4.5);
    assert.equal(totals.tax, 6.84);
    assert.equal(totals.total, 102.34);
  }

  // Free shipping threshold uses merchandise after discounts + packaging
  {
    const totals = calculateCheckoutTotals({
      items: [line({ unitPrice: 90, packagingPrice: 15 })],
      taxRate: 0.1,
      taxShipping: true,
      freeShippingThreshold: 100,
      flatShippingFee: 10,
    });
    assert.equal(totals.shipping, 0);
    assert.equal(totals.tax, 10.5); // 105 * 0.1
    assert.equal(totals.total, 115.5);
  }

  // Cent rounding
  {
    const totals = calculateCheckoutTotals({
      items: [line({ unitPrice: 19.99 })],
      taxRate: 0.0725,
      taxShipping: false,
      freeShippingThreshold: 1000,
      flatShippingFee: 10,
    });
    assert.equal(totals.tax, 1.45); // 19.99 * 0.0725 = 1.449275 -> 1.45
    assert.equal(totals.total, 31.44);
  }

  // Settings helpers + account discount rates
  {
    assert.equal(percentToRate(6.25), 0.0625);
    assert.equal(rateToPercent(0.0625), 6.25);

    const settings = normalizeStateTaxSettings({
      taxEnabled: true,
      flatShippingFee: 7.5,
      freeShippingThreshold: 75,
      businessDiscountPercent: 3,
      premiumDiscountPercent: 7,
      taxRatesReviewedAt: "2026-07-17T00:00:00.000Z",
      stateTaxRates: [
        { stateCode: "tx", rate: 0.0625, taxShipping: true },
        { stateCode: "TX", rate: 0.08, taxShipping: false }, // duplicate ignored
        { stateCode: "CA", rate: 0.0725, taxShipping: true },
      ],
    });

    assert.equal(settings.taxEnabled, true);
    assert.equal(settings.flatShippingFee, 7.5);
    assert.equal(settings.freeShippingThreshold, 75);
    assert.equal(settings.businessDiscountRate, 0.03);
    assert.equal(settings.premiumDiscountRate, 0.07);
    assert.equal(settings.taxRatesReviewedAt, "2026-07-17T00:00:00.000Z");
    assert.ok(settings.stateRates.length >= 50);
    assert.equal(countConfiguredTaxStates(settings), 2);

    const tx = resolveTaxRuleForState(settings, "tx");
    assert.equal(tx.taxRate, 0.0625);
    assert.equal(tx.taxShipping, true);
    assert.equal(tx.flatShippingFee, 7.5);
    assert.equal(tx.freeShippingThreshold, 75);
    assert.equal(tx.businessDiscountRate, 0.03);
    assert.equal(tx.premiumDiscountRate, 0.07);

    const disabled = resolveTaxRuleForState(
      {
        taxEnabled: false,
        stateRates: buildDefaultStateTaxRates(),
        flatShippingFee: 10,
        freeShippingThreshold: 100,
        businessDiscountRate: 0.02,
        premiumDiscountRate: 0.05,
        taxRatesReviewedAt: null,
      },
      "TX",
    );
    assert.equal(disabled.taxRate, 0);

    // Custom rates: premium wins when higher, no stacking
    const both = getAccountDiscount(
      {
        isBusiness: true,
        businessStatus: "active",
        isActive: true,
        premiumStatus: "active",
      },
      { businessRate: 0.03, premiumRate: 0.07 },
    );
    assert.equal(both.type, "premium");
    assert.equal(both.rate, 0.07);

    const businessOnly = getAccountDiscount(
      {
        isBusiness: true,
        businessStatus: "active",
        isActive: true,
        premiumStatus: "none",
      },
      { businessRate: 0.04, premiumRate: 0.05 },
    );
    assert.equal(businessOnly.type, "business");
    assert.equal(businessOnly.rate, 0.04);

    // Defaults when rates omitted
    const defaults = getAccountDiscount({
      isBusiness: true,
      businessStatus: "active",
    });
    assert.equal(defaults.rate, 0.02);
  }

  console.log("checkout-tax tests passed");
}

run();
