/**
 * Product purchase-style options (stored historically as grindOptions / grindType).
 * These are not brew grinds — Sheba sells wholebean / natural / classic wash only.
 */
export const PRODUCT_STYLE_OPTIONS = [
  { value: "whole-bean", label: "Wholebean" },
  { value: "natural", label: "Natural" },
  { value: "classic-wash", label: "Classic Wash" },
] as const;

export type ProductStyleValue = (typeof PRODUCT_STYLE_OPTIONS)[number]["value"];

export const PRODUCT_STYLE_VALUES = new Set<string>(
  PRODUCT_STYLE_OPTIONS.map((o) => o.value),
);

export type ProductStyleOption = {
  grindType: string;
  isDefault?: boolean;
  available?: boolean;
};

/** Backward-compat for older catalogs still using brew grind values in CMS. */
const LEGACY_GRIND_LABELS: Record<string, string> = {
  cafetiere: "Cafetiere",
  filter: "Filter",
  espresso: "Espresso",
};

export function getStyleOptionLabel(value: string): string {
  const found = PRODUCT_STYLE_OPTIONS.find((o) => o.value === value);
  if (found) return found.label;
  return LEGACY_GRIND_LABELS[value] ?? value;
}

export function defaultProductStyleOptions(): Array<{
  grindType: ProductStyleValue;
  isDefault: boolean;
  available: boolean;
}> {
  return PRODUCT_STYLE_OPTIONS.map((o, i) => ({
    grindType: o.value,
    isDefault: i === 0,
    available: true,
  }));
}

/** Keep only allowed styles; if none left (legacy grind lists), use defaults. */
export function resolveProductStyleOptions(
  options?: ProductStyleOption[] | null,
): Array<{
  grindType: string;
  isDefault: boolean;
  available: boolean;
}> {
  const cleaned = (options || [])
    .filter((o) => o?.grindType && PRODUCT_STYLE_VALUES.has(o.grindType))
    .map((o) => ({
      grindType: o.grindType,
      isDefault: Boolean(o.isDefault),
      available: o.available !== false,
    }));

  if (cleaned.length === 0) {
    return defaultProductStyleOptions();
  }

  if (!cleaned.some((o) => o.isDefault && o.available)) {
    const firstAvail = cleaned.find((o) => o.available) || cleaned[0];
    return cleaned.map((o) => ({
      ...o,
      isDefault: o.grindType === firstAvail.grindType,
    }));
  }

  return cleaned;
}

export function getDefaultStyleOption(
  options?: ProductStyleOption[] | null,
): {
  grindType: string;
  isDefault: boolean;
  available: boolean;
} {
  const list = resolveProductStyleOptions(options);
  return (
    list.find((o) => o.isDefault && o.available) ||
    list.find((o) => o.available) ||
    list[0]
  );
}
