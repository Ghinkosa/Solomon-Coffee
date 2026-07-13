"use client";

import { usePathname, useRouter } from "next/navigation";
import { i18n, Locale } from "@/i18n-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface LanguageSwitcherProps {
  lang: string;
  variant?: "light" | "dark";
}

const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Spanish",
  ar: "Arabic",
};

const visibleLocales: Locale[] = ["en", "es", "ar"];

const localeCountryCodes: Record<Locale, string> = {
  en: "us",
  es: "es",
  ar: "sa",
};

// Pre-rasterized PNGs render crisper than downscaled SVGs for detailed flags
// (e.g. the US flag) at these small sizes. w40 is the 1x source, w80 the 2x.
const flagPng = (code: string, width: 40 | 80) =>
  `https://flagcdn.com/w${width}/${code}.png`;

// Map locales to potential flag images or just initials?
// User asked for "language initial".
// I'll use a neat button with the language code and a small flag if I had them, but distinct text is safer.

const LanguageSwitcher = ({
  lang,
  variant = "light",
}: LanguageSwitcherProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [failedFlagLocales, setFailedFlagLocales] = useState<
    Partial<Record<Locale, boolean>>
  >({});

  const redirectedPathName = (locale: string) => {
    if (!pathname) return "/";
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/");
  };

  const handleLocaleChange = (locale: Locale) => {
    const newPath = redirectedPathName(locale);
    router.push(newPath);
  };

  const currentLocale = (visibleLocales.includes(lang as Locale)
    ? (lang as Locale)
    : "en") as Locale;

  function renderLocaleFlag(locale: Locale, className = "h-4 w-5 rounded-[1px] object-cover border border-stone-200/70") {
    if (failedFlagLocales[locale]) {
      return (
        <span className="text-xs font-semibold uppercase" aria-hidden>
          {locale}
        </span>
      );
    }
    const code = localeCountryCodes[locale];
    return (
      <img
        src={flagPng(code, 40)}
        srcSet={`${flagPng(code, 40)} 1x, ${flagPng(code, 80)} 2x`}
        alt=""
        aria-hidden
        className={className}
        loading="lazy"
        onError={() =>
          setFailedFlagLocales((prev) => ({ ...prev, [locale]: true }))
        }
      />
    );
  }

  const isDark = variant === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={
            isDark
              ? "h-10 gap-1 border-0 bg-transparent px-2 text-shop_light_pink/85 shadow-none hover:bg-transparent hover:text-shop_orange"
              : "h-10 gap-1 border-0 bg-transparent px-2 text-shop_dark_green shadow-none hover:bg-transparent hover:text-shop_light_green"
          }
          aria-label={`Switch language (${localeNames[currentLocale]})`}
        >
          {renderLocaleFlag(currentLocale, "h-[18px] w-[26px] rounded-[1px] object-cover border border-stone-200/70")}
          <ChevronDown
            className={`h-3.5 w-3.5 opacity-60 ${isDark ? "text-shop_light_pink/70" : "text-stone-500"}`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-[3.5rem] p-1">
        {visibleLocales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            aria-label={localeNames[locale]}
            className={`cursor-pointer flex items-center justify-center px-2.5 py-2 ${
              lang === locale ? "bg-gray-50" : ""
            }`}
          >
            {renderLocaleFlag(locale, "h-[18px] w-[26px] rounded-[1px] object-cover border border-stone-200/70")}
            <span className="sr-only">{localeNames[locale]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
