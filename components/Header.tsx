import React, { Suspense } from "react";
import ClientHeader from "./ClientHeader";
import AuthSidebar from "./AuthSidebar";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

const Header = async ({ lang }: { lang: Locale }) => {
  const dictionary = await getDictionary(lang);

  return (
    <>
      <AuthSidebar dictionary={dictionary} lang={lang} />
      <Suspense
        fallback={
          <div className="h-20 bg-white border-b border-gray-100 animate-pulse" />
        }
      >
        <ClientHeader dictionary={dictionary} lang={lang} />
      </Suspense>
    </>
  );
};

export default Header;
