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
import { User } from "lucide-react";
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
      <Container className="px-3 sm:px-4">
        <div className="flex h-14 items-center justify-between gap-2 sm:h-[4.25rem] sm:gap-4 lg:h-[4.75rem] lg:gap-6">
          <div className="flex min-w-0 items-center gap-1 sm:gap-2 lg:gap-3">
            <MobileMenu lang={lang} dictionary={dictionary} />
            <Logo
              lang={lang}
              logoText={dictionary.logo}
              theme="light"
              showText={false}
              imageClassName="h-9 w-auto sm:h-11 lg:h-14"
            />
          </div>

          <div className="hidden min-w-0 flex-1 justify-center lg:flex">
            <HeaderMenu dictionary={dictionary} lang={lang} />
          </div>

          <div className="flex shrink-0 items-center gap-0 sm:gap-1 md:gap-2 lg:gap-3">
            <SearchBar dictionary={dictionary} variant="light" compact />

            <div className="hidden h-7 w-px bg-stone-200 md:block" />

            <div className="flex items-center">
              <CartIcon compact />
              <SignedIn>
                <div className="hidden sm:contents">
                  <FavoriteButton />
                </div>
              </SignedIn>
              <div className="hidden md:block">
                <LanguageSwitcher lang={lang} />
              </div>
            </div>

            <ClerkLoaded>
              <SignedIn>
                <UserDropdown dictionary={dictionary} lang={lang} />
              </SignedIn>
              <SignedOut>
                <button
                  type="button"
                  onClick={() => openAuthSidebar("signIn")}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-shop_dark_green bg-shop_dark_green text-white transition-colors hover:border-shop_light_green hover:bg-shop_light_green sm:hidden"
                  aria-label="Sign in"
                >
                  <User className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => openAuthSidebar("signIn")}
                  className="ml-1 hidden whitespace-nowrap rounded-full border border-shop_dark_green bg-shop_dark_green px-5 py-2 text-sm font-medium text-white transition-colors hover:border-shop_light_green hover:bg-shop_light_green sm:inline-flex"
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
