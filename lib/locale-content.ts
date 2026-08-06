import { i18n, type Locale } from "@/i18n-config";

/** Locale-keyed content (banner/product name & description). */
export type LocaleStrings = Partial<Record<Locale, string>>;

/**
 * Resolve CMS text for a locale with English fallback, then any filled locale.
 * Accepts legacy plain strings so existing products keep working.
 */
export function resolveLocaleString(
  value: unknown,
  locale: Locale,
  fallbackLocale: Locale = i18n.defaultLocale,
): string {
  if (value == null) return "";

  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    // Portable-text blocks should use toPlainText() before this helper.
    return "";
  }

  if (typeof value === "object") {
    const map = value as Record<string, unknown>;
    const orderedLocales: Locale[] = [
      locale,
      fallbackLocale,
      ...i18n.locales.filter((l) => l !== locale && l !== fallbackLocale),
    ];

    for (const key of orderedLocales) {
      const candidate = map[key];
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
      }
    }
  }

  return "";
}

/** Build a locale object, dropping empty strings. */
export function toLocaleStrings(
  input: Partial<Record<Locale, string | undefined>> | string | null | undefined,
  /** If input is a string, treat it as this locale (usually English). */
  stringAsLocale: Locale = i18n.defaultLocale,
): LocaleStrings {
  if (input == null) return {};

  if (typeof input === "string") {
    const trimmed = input.trim();
    return trimmed ? { [stringAsLocale]: trimmed } : {};
  }

  const next: LocaleStrings = {};
  for (const locale of i18n.locales) {
    const raw = input[locale];
    if (typeof raw === "string" && raw.trim()) {
      next[locale] = raw.trim();
    }
  }
  return next;
}

export function localeStringsToForm(
  value: unknown,
): Record<Locale, string> {
  const empty: Record<Locale, string> = { en: "", es: "", ar: "" };
  if (value == null) return empty;
  if (typeof value === "string") {
    return { ...empty, en: value };
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    const map = value as Record<string, unknown>;
    return {
      en: typeof map.en === "string" ? map.en : "",
      es: typeof map.es === "string" ? map.es : "",
      ar: typeof map.ar === "string" ? map.ar : "",
    };
  }
  return empty;
}
