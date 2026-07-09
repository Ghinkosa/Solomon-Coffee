"use client";

import React, { useEffect, useState } from "react";
import { ClerkLoaded, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Container from "./Container";
import HeaderMenu from "./layout/HeaderMenu";
import Logo from "./common/Logo";
import CartIcon from "./cart/CartIcon";
import MobileMenu from "./layout/MobileMenu";
import SearchBar from "./common/SearchBar";
import FavoriteButton from "./FavoriteButton";
import UserDropdown from "./UserDropdown";
import { useRouter, useSearchParams } from "next/navigation";
import useCartStore from "@/store";
import LanguageSwitcher from "./LanguageSwitcher";

interface ClientHeaderProps {
  dictionary: any;
  lang: string;
}

const ClientHeader = ({ dictionary, lang }: ClientHeaderProps) => {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const { openAuthSidebar } = useCartStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isSignedIn && user && isMounted && typeof window !== "undefined") {
      const redirectTo = searchParams.get("redirectTo");
      if (redirectTo) {
        const cleanUrl = decodeURIComponent(redirectTo);
        router.push(cleanUrl);
        const currentPath = window.location.pathname;
        router.replace(currentPath);
      }
    }
  }, [isSignedIn, user, searchParams, router, isMounted]);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white">
      <Container>
        <div className="flex h-[4.25rem] items-center gap-4 lg:h-[4.75rem] lg:gap-6">
          <div className="flex min-w-0 items-center gap-3 lg:shrink-0">
            <MobileMenu lang={lang} dictionary={dictionary} />
            <Logo
              lang={lang}
              logoText={dictionary.logo}
              theme="light"
              showText={false}
              imageClassName="h-12 w-auto sm:h-14 lg:h-16"
            />
          </div>

          <div className="hidden min-w-0 flex-1 justify-center lg:flex">
            <HeaderMenu dictionary={dictionary} lang={lang} />
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <SearchBar dictionary={dictionary} variant="light" />

            <div className="hidden h-7 w-px bg-stone-200 md:block" />

            <div className="flex items-center gap-0.5 sm:gap-1">
              <CartIcon />
              <SignedIn>
                <FavoriteButton />
              </SignedIn>
              <LanguageSwitcher lang={lang} />
            </div>

            <ClerkLoaded>
              <SignedIn>
                <UserDropdown dictionary={dictionary} lang={lang} />
              </SignedIn>
              <SignedOut>
                <button
                  type="button"
                  onClick={() => openAuthSidebar("signIn")}
                  className="ml-1 rounded-full border border-shop_dark_green bg-shop_dark_green px-5 py-2 text-sm font-medium text-white transition-colors hover:border-shop_light_green hover:bg-shop_light_green"
                >
                  Sign in
                </button>
              </SignedOut>
            </ClerkLoaded>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default ClientHeader;
