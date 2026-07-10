import React, { Suspense } from "react";
import ClientHeader from "./ClientHeader";
import AuthSidebar from "./AuthSidebar";
import CartDrawer from "./cart/CartDrawer";
import { Locale } from "@/i18n-config";
import type { getDictionary } from "@/lib/dictionary";

const Header = async ({
  lang,
  dictionary,
}: {
  lang: Locale;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
}) => {
  return (
    <>
      <AuthSidebar dictionary={dictionary} lang={lang} />
      <CartDrawer />
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
