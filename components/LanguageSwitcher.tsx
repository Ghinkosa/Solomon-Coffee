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
import Image from "next/image";

interface LanguageSwitcherProps {
  lang: string;
}

const localeNames: Record<Locale, string> = {
  en: "English",
  it: "Italian",
  fr: "French",
  hi: "Hindi",
  ar: "Arabic",
  am: "Amharic",
};

// Map locales to potential flag images or just initials?
// User asked for "language initial".
// I'll use a neat button with the language code and a small flag if I had them, but distinct text is safer.

const LanguageSwitcher = ({ lang }: LanguageSwitcherProps) => {
  const router = useRouter();
  const pathname = usePathname();

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 border md:h-[38px]"
        >
          <span className="font-semibold uppercase text-xs sm:text-sm">
            {lang}
          </span>
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
          <span className="sr-only">Switch Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {i18n.locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={`cursor-pointer flex items-center gap-2 ${
              lang === locale ? "font-bold bg-gray-50 text-shop_dark_green" : ""
            }`}
          >
            <span className="uppercase text-xs font-bold border border-gray-200 px-1 rounded bg-gray-50 text-gray-600">
              {locale}
            </span>
            <span>{localeNames[locale]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
