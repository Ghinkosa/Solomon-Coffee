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

const LanguageSwitcher = ({ lang }: LanguageSwitcherProps) => {
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

  function renderLocaleFlag(locale: Locale, className = "h-4 w-5 rounded-xs") {
    if (failedFlagLocales[locale]) return <span>{localeNames[locale]}</span>;
    return (
      <img
        src={localeFlags[locale]}
        alt={`${localeNames[locale]} flag`}
        className={className}
        loading="lazy"
        onError={() =>
          setFailedFlagLocales((prev) => ({ ...prev, [locale]: true }))
        }
      />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 border md:h-[38px]"
        >
          {renderLocaleFlag(currentLocale)}
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
          <span className="sr-only">Switch Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {visibleLocales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={`cursor-pointer flex items-center gap-2 ${
              lang === locale ? "font-bold bg-gray-50 text-shop_dark_green" : ""
            }`}
          >
            {renderLocaleFlag(locale, "h-4 w-5 rounded-xs")}
            <span>{localeNames[locale]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
