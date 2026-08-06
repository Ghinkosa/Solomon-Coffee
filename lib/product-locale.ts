import type { Locale } from "@/i18n-config";
import { resolveLocaleString, localeStringsToForm } from "@/lib/locale-content";
import { toPlainText } from "@/lib/sanity-text";

type Named = { name?: unknown; description?: unknown };

/** Display name for the active storefront locale. */
export function getProductName(
  product: Named | null | undefined,
  locale: Locale,
): string {
  return resolveLocaleString(product?.name, locale);
}

/**
 * Display description for the active locale.
 * Supports plain locale strings, legacy strings, and portable text.
 */
export function getProductDescription(
  product: Named | null | undefined,
  locale: Locale,
): string {
  const value = product?.description;
  if (value == null) return "";

  // Localized object first
  if (typeof value === "object" && !Array.isArray(value)) {
    const map = value as Record<string, unknown>;
    if ("en" in map || "es" in map || "ar" in map) {
      return resolveLocaleString(value, locale);
    }
  }

  // Portable text or plain string
  return toPlainText(value);
}

/** English form values for admin editors. */
export function productNameForm(product: Named | null | undefined) {
  return localeStringsToForm(product?.name);
}

export function productDescriptionForm(product: Named | null | undefined) {
  const value = product?.description;
  if (Array.isArray(value)) {
    return localeStringsToForm(toPlainText(value));
  }
  return localeStringsToForm(value);
}

/** Text all locales (name + description) for client search. */
export function productSearchBlob(
  product: Named | null | undefined,
): string {
  if (!product) return "";
  const parts: string[] = [];
  const name = product.name;
  const description = product.description;

  if (typeof name === "string") parts.push(name);
  else if (name && typeof name === "object") {
    for (const v of Object.values(name as Record<string, unknown>)) {
      if (typeof v === "string") parts.push(v);
    }
  }

  if (typeof description === "string") parts.push(description);
  else if (Array.isArray(description)) parts.push(toPlainText(description));
  else if (description && typeof description === "object") {
    for (const v of Object.values(description as Record<string, unknown>)) {
      if (typeof v === "string") parts.push(v);
    }
  }

  return parts.join(" ").toLowerCase();
}
