import React, { Suspense } from "react";
import ClientHeader from "./ClientHeader";
import AuthSidebar from "./AuthSidebar";
import CartDrawer from "./cart/CartDrawer";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

const Header = async ({ lang }: { lang: Locale }) => {
  const dictionary = await getDictionary(lang);

  return (
    <>
      <AuthSidebar dictionary={dictionary} lang={lang} />
      <CartDrawer lang={lang} />
      <Suspense
        fallback={
          <div className="h-[4.25rem] animate-pulse border-b border-stone-200 bg-white lg:h-[4.75rem]" />
        }
      >
        <ClientHeader dictionary={dictionary} lang={lang} />
      </Suspense>
    </>
  );
};

export default Header;
