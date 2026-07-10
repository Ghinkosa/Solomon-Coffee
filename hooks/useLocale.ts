"use client";

import { useParams } from "next/navigation";
import { i18n, type Locale } from "@/i18n-config";
import { localizedPath } from "@/lib/localized-path";

export function useLocale(): Locale {
  const params = useParams();
  const lang = params?.lang;

  if (typeof lang === "string" && (i18n.locales as readonly string[]).includes(lang)) {
    return lang as Locale;
  }

  return i18n.defaultLocale;
}

export function useLocalizedPath() {
  const lang = useLocale();

  return (href: string) => localizedPath(href, lang);
}
