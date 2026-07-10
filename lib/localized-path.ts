import { i18n, type Locale } from "@/i18n-config";

function isLocale(value: string): value is Locale {
  return (i18n.locales as readonly string[]).includes(value);
}

/**
 * Prefix an internal path with the active locale.
 * Leaves external URLs, anchors, and already-localized paths unchanged.
 */
export function localizedPath(
  href: string,
  lang: string = i18n.defaultLocale,
): string {
  if (!href) {
    return `/${lang}`;
  }

  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#")
  ) {
    return href;
  }

  for (const locale of i18n.locales) {
    if (href === `/${locale}` || href.startsWith(`/${locale}/`)) {
      return href;
    }
  }

  const safeLang = isLocale(lang) ? lang : i18n.defaultLocale;
  const path = href.startsWith("/") ? href : `/${href}`;

  if (path === "/") {
    return `/${safeLang}`;
  }

  return `/${safeLang}${path}`;
}
