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
import { User } from "lucide-react";

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

  // Track when component is mounted on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle redirect after successful login
  useEffect(() => {
    if (isSignedIn && user && isMounted && typeof window !== "undefined") {
      const redirectTo = searchParams.get("redirectTo");
      if (redirectTo) {
        // Clean up the URL and redirect
        const cleanUrl = decodeURIComponent(redirectTo);
        router.push(cleanUrl);
        // Remove the redirectTo param from current URL
        const currentPath = window.location.pathname;
        router.replace(currentPath);
      }
    }
  }, [isSignedIn, user, searchParams, router, isMounted]);

  const getSignInUrl = () => {
    if (!isMounted || typeof window === "undefined") return "/sign-in";
    const currentPath = window.location.pathname + window.location.search;
    return `/sign-in?redirectTo=${encodeURIComponent(currentPath)}`;
  };

  const getSignUpUrl = () => {
    if (!isMounted || typeof window === "undefined") return "/sign-up";
    const currentPath = window.location.pathname + window.location.search;
    return `/sign-up?redirectTo=${encodeURIComponent(currentPath)}`;
  };

  return (
    <header className="sticky top-0 z-40 py-2 sm:py-3 lg:py-4 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <Container className="h-full">
        <div className="flex items-center h-full min-h-12 sm:min-h-14 lg:min-h-16">
          {/* Left Section: Mobile Menu + Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <MobileMenu lang={lang} dictionary={dictionary} />
            <Logo lang={lang} logoText={dictionary.logo} />
          </div>

          {/* Center Section: Navigation Menu (Desktop Only) */}
          <div className="hidden lg:flex items-center justify-center flex-1 mx-8">
            <HeaderMenu dictionary={dictionary} lang={lang} />
          </div>

          {/* Right Section: Search + Actions */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 ml-auto">
            {/* Search Bar */}
            <div className="shrink-0">
              <SearchBar dictionary={dictionary} />
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <LanguageSwitcher lang={lang} />
              <CartIcon />
              <FavoriteButton />

              <ClerkLoaded>
                <SignedIn>
                  <UserDropdown dictionary={dictionary} lang={lang} />
                </SignedIn>

                <SignedOut>
                  <button
                    className="group"
                    onClick={() => openAuthSidebar("signIn")}
                  >
                    <User className="group-hover:text-shop_light_green hoverEffect" />
                  </button>
                </SignedOut>
              </ClerkLoaded>
            </div>

            {/* Tablet Actions (Medium screens) */}
            <div className="hidden md:flex lg:hidden items-center gap-2">
              <LanguageSwitcher lang={lang} />
              <CartIcon />
              <FavoriteButton />

              <ClerkLoaded>
                <SignedIn>
                  <UserDropdown dictionary={dictionary} lang={lang} />
                </SignedIn>
                <SignedOut>
                  <div className="flex items-center gap-1">
                    <button
                      className="group"
                      onClick={() => openAuthSidebar("signIn")}
                    >
                      <User className="group-hover:text-shop_light_green hoverEffect" />
                    </button>
                  </div>
                </SignedOut>
              </ClerkLoaded>
            </div>

            {/* Mobile Actions (Small screens) */}
            <div className="flex md:hidden items-center gap-1">
              <LanguageSwitcher lang={lang} />
              <ClerkLoaded>
                <SignedIn>
                  <UserDropdown dictionary={dictionary} lang={lang} />
                </SignedIn>
                <SignedOut>
                  <div className="flex items-center gap-1">
                    <button
                      className="group"
                      onClick={() => openAuthSidebar("signIn")}
                    >
                      <User className="group-hover:text-shop_light_green hoverEffect" />
                    </button>
                  </div>
                </SignedOut>
              </ClerkLoaded>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default ClientHeader;
