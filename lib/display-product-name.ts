import type { Locale } from "@/i18n-config";
import { i18n } from "@/i18n-config";
import { resolveLocaleString } from "@/lib/locale-content";

/**
 * Safe display string for product names that may be a plain string or
 * locale object `{ en, es, ar }`. Never pass the raw value to React children.
 */
export function displayProductName(
  productOrName: { name?: unknown } | unknown,
  locale: Locale = i18n.defaultLocale,
): string {
  if (productOrName == null) return "";
  if (typeof productOrName === "string") {
    return productOrName.trim();
  }
  if (typeof productOrName === "object") {
    const obj = productOrName as Record<string, unknown>;
    if ("name" in obj) {
      return resolveLocaleString(obj.name, locale);
    }
    // bare locale map
    if ("en" in obj || "es" in obj || "ar" in obj) {
      return resolveLocaleString(productOrName, locale);
    }
  }
  return "";
}
