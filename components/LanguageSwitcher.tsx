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

const localeFlags: Record<Locale, string> = {
  en: "https://flagcdn.com/us.svg",
  es: "https://flagcdn.com/es.svg",
  ar: "https://flagcdn.com/sa.svg",
};

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

  function renderLocaleFlag(locale: Locale, className = "h-4 w-5 object-cover") {
    if (failedFlagLocales[locale]) {
      return (
        <span className="text-xs font-semibold uppercase" aria-hidden>
          {locale}
        </span>
      );
    }
    return (
      <img
        src={localeFlags[locale]}
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
          {renderLocaleFlag(currentLocale, "h-5 w-7 object-cover")}
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
            {renderLocaleFlag(locale, "h-5 w-7 object-cover")}
            <span className="sr-only">{localeNames[locale]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
