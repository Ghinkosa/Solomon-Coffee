"use client";

import Logo from "@/components/common/Logo";
import Link from "next/link";
import { useLocalizedPath, useLocale } from "@/hooks/useLocale";
import enDict from "@/dictionaries/en.json";
import esDict from "@/dictionaries/es.json";
import arDict from "@/dictionaries/ar.json";
import type { Locale } from "@/i18n-config";

const dictionaries = {
  en: enDict,
  es: esDict,
  ar: arDict,
};

type NotFoundCopy = {
  title: string;
  description: string;
  homeButton: string;
  helpButton: string;
  footerPrefix: string;
  helpLink: string;
  footerMiddle: string;
  contactLink: string;
};

const fallback: NotFoundCopy = {
  title: "Looking for something?",
  description:
    "We're sorry. The Web address you entered is not a functioning page on our site.",
  homeButton: "Go to Sheba Cup Coffee home page",
  helpButton: "Help",
  footerPrefix: "Need help? Visit the",
  helpLink: "Help section",
  footerMiddle: "or",
  contactLink: "contact us",
};

function getNotFoundCopy(lang: Locale): NotFoundCopy {
  const page = (dictionaries[lang] as { notFoundPage?: NotFoundCopy })
    .notFoundPage;
  return { ...fallback, ...page };
}

const NotFoundPage = () => {
  const toLocalizedPath = useLocalizedPath();
  const lang = useLocale();
  const copy = getNotFoundCopy(lang);

  return (
    <div className="bg-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-10 md:py-32">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo />

          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {copy.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{copy.description}</p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-xs space-y-4">
            <Link
              href={toLocalizedPath("/")}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md text-white bg-shop_dark_green/80 hover:bg-shop_dark_green focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-amazonOrangeDark hoverEffect"
            >
              {copy.homeButton}
            </Link>
            <Link
              href={toLocalizedPath("/help")}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-semibold rounded-md text-amazonBlue bg-white hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-amazonBlue"
            >
              {copy.helpButton}
            </Link>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            {copy.footerPrefix}{" "}
            <Link
              href={toLocalizedPath("/help")}
              className="font-medium text-amazon-blue hover:text-amazon-blue-dark"
            >
              {copy.helpLink}
            </Link>{" "}
            {copy.footerMiddle}{" "}
            <Link
              href={toLocalizedPath("/contact")}
              className="font-medium text-amazon-blue hover:text-amazon-blue-dark"
            >
              {copy.contactLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
