"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Settings,
  Package,
  Heart,
  LogOut,
  UserCircle,
  Logs,
  Shield,
  Briefcase,
  Bell,
  Languages,
  ChevronRight,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsAdmin } from "@/lib/adminUtils";
import { useUserData } from "@/contexts/UserDataContext";
import { usePathname, useRouter } from "next/navigation";
import { i18n, Locale } from "@/i18n-config";
import { localizedPath } from "@/lib/localized-path";

interface UserDropdownProps {
  dictionary: any;
  lang: string;
  variant?: "light" | "dark";
}

const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Spanish",
  ar: "Arabic",
};

const UserDropdown = ({
  dictionary,
  lang,
  variant = "light",
}: UserDropdownProps) => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const {
    ordersCount,
    isEmployee,
    isLoading: isLoadingOrders,
  } = useUserData();

  // Check if user is admin
  const isAdmin = useIsAdmin(user?.primaryEmailAddress?.emailAddress);

  if (!user) return null;

  const handleSignOut = () => {
    signOut();
    setOpen(false);
  };

  const handleLinkClick = () => {
    setOpen(false);
    setShowLanguage(false);
  };

  const redirectedPathName = (locale: string) => {
    if (!pathname) return "/";
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/");
  };

  const handleLocaleChange = (locale: Locale) => {
    const newPath = redirectedPathName(locale);
    router.push(newPath);
    setOpen(false);
  };

  // The dictionary is now deep-merged with English base in getDictionary,
  // so t.key should always have his English value if translation is missing.
  const t = dictionary?.userDropdown || {};

  const isDark = variant === "dark";

  return (
    <Popover
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) setShowLanguage(false);
      }}
    >
      <PopoverTrigger asChild>
        <button
          className={
            isDark
              ? "group flex h-9 w-9 items-center justify-center transition-colors hover:text-shop_orange hoverEffect sm:h-10 sm:w-auto sm:gap-2 sm:px-1.5"
              : "group flex h-9 w-9 items-center justify-center border-0 bg-transparent p-0 transition-colors hover:text-shop_light_green hoverEffect sm:h-10 sm:w-auto sm:gap-2 sm:border sm:border-stone-200 sm:bg-stone-50 sm:px-2 sm:py-1 sm:hover:border-shop_light_green/40 sm:hover:bg-white"
          }
        >
          <div className="relative">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || "User"}
                className={`h-7 w-7 rounded-full object-cover transition-colors sm:h-8 sm:w-8 ${
                  isDark
                    ? "border-2 border-shop_orange/40 group-hover:border-shop_orange"
                    : "border-2 border-shop_light_green/20 group-hover:border-shop_light_green/40"
                }`}
              />
            ) : (
              <UserCircle
                className={`h-7 w-7 transition-colors sm:h-8 sm:w-8 ${
                  isDark
                    ? "text-shop_light_pink/80 group-hover:text-shop_orange"
                    : "text-gray-500 group-hover:text-shop_light_green"
                }`}
              />
            )}
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-shop_dark_green bg-green-500 shadow-sm sm:-bottom-1 sm:-right-1 sm:h-3 sm:w-3" />
          </div>
          {!isDark && (
            <div className="hidden flex-col items-start lg:flex">
              <span className="text-sm font-medium text-gray-800 transition-colors group-hover:text-shop_light_green">
                {user.firstName || "User"}
              </span>
            </div>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-72 p-0" align="end" sideOffset={5}>
        {!showLanguage ? (
          <>
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || "User"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="w-12 h-12 text-gray-500" />
                )}
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {user.fullName || user.firstName || "User"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <Link
                href={localizedPath("/user/profile", lang)}
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-shop_light_bg transition-colors duration-200 group"
              >
                <User className="w-4 h-4 text-gray-500 group-hover:text-shop_light_green transition-colors" />
                <span className="text-gray-800 group-hover:text-shop_light_green transition-colors">
                  {t.myProfile}
                </span>
              </Link>

              <Link
                href={localizedPath("/user/orders", lang)}
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-shop_light_bg transition-colors duration-200 group"
              >
                <Package className="w-4 h-4 text-gray-500 group-hover:text-shop_light_green transition-colors" />
                <div className="flex items-center justify-between w-full">
                  <span className="text-gray-800 group-hover:text-shop_light_green transition-colors">
                    {t.myOrders}
                  </span>
                  {isLoadingOrders ? (
                    <div className="w-4 h-4 border-2 border-shop_btn_dark_green border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    ordersCount > 0 && (
                      <span className="bg-shop_btn_dark_green text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                        {ordersCount}
                      </span>
                    )
                  )}
                </div>
              </Link>

              <Link
                href={localizedPath("/wishlist", lang)}
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-shop_light_bg transition-colors duration-200 group"
              >
                <Heart className="w-4 h-4 text-gray-500 group-hover:text-shop_light_green transition-colors" />
                <span className="text-gray-800 group-hover:text-shop_light_green transition-colors">
                  {t.wishlist}
                </span>
              </Link>

              <Link
                href={localizedPath("/user", lang)}
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-shop_light_bg transition-colors duration-200 group"
              >
                <Logs className="w-4 h-4 text-gray-500 group-hover:text-shop_light_green transition-colors" />
                <span className="text-gray-800 group-hover:text-shop_light_green transition-colors">
                  {t.dashboard}
                </span>
              </Link>

              <Link
                href={localizedPath("/user/notifications", lang)}
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-shop_light_bg transition-colors duration-200 group"
              >
                <Bell className="w-4 h-4 text-gray-500 group-hover:text-shop_light_green transition-colors" />
                <span className="text-gray-800 group-hover:text-shop_light_green transition-colors">
                  {t.notifications}
                </span>
              </Link>

              <Link
                href={localizedPath("/user/settings", lang)}
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-shop_light_bg transition-colors duration-200 group"
              >
                <Settings className="w-4 h-4 text-gray-500 group-hover:text-shop_light_green transition-colors" />
                <span className="text-gray-800 group-hover:text-shop_light_green transition-colors">
                  {t.settings}
                </span>
              </Link>

              <div className="my-1 border-t border-gray-100"></div>

              <button
                onClick={() => setShowLanguage(true)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg hover:bg-shop_light_bg transition-colors duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <Languages className="w-4 h-4 text-gray-500 group-hover:text-shop_light_green transition-colors" />
                  <span className="text-gray-800 group-hover:text-shop_light_green transition-colors">
                    {t.language}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold uppercase text-gray-400">
                    {lang}
                  </span>
                  <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-shop_light_green" />
                </div>
              </button>

              <div className="my-1 border-t border-gray-100"></div>

              {isEmployee && !isAdmin && (
                <Link
                  href={localizedPath("/employee", lang)}
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-blue-50 transition-colors duration-200 group"
                >
                  <Briefcase className="w-4 h-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
                  <span className="text-blue-600 group-hover:text-blue-700 transition-colors font-medium">
                    {t.employeeDashboard}
                  </span>
                </Link>
              )}

              <Link
                href={localizedPath("/help", lang)}
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-shop_light_bg transition-colors duration-200 group"
              >
                <svg
                  className="w-4 h-4 text-gray-500 group-hover:text-shop_light_green transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-gray-800 group-hover:text-shop_light_green transition-colors">
                  {t.helpSupport}
                </span>
              </Link>
              {isAdmin && (
                <Link
                  href={localizedPath("/admin", lang)}
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-shop_light_bg transition-colors duration-200 group"
                >
                  <Shield className="w-4 h-4 text-orange-500 group-hover:text-orange-600 transition-colors" />
                  <span className="text-orange-600 group-hover:text-orange-700 transition-colors font-medium">
                    {t.adminPanel}
                  </span>
                </Link>
              )}
            </div>

            <div className="p-2 border-t border-gray-100">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-red-50 transition-colors duration-200 w-full text-left group"
              >
                <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-600" />
                <span className="text-red-600 group-hover:text-red-700 font-medium">
                  {t.signOut}
                </span>
              </button>
            </div>
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-2 duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <button
                onClick={() => setShowLanguage(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180 text-gray-500" />
              </button>
              <h3 className="font-semibold text-gray-800">{t.language}</h3>
            </div>
            <div className="p-2">
              {i18n.locales.map((locale) => (
                <button
                  key={locale}
                  onClick={() => handleLocaleChange(locale)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                    lang === locale
                      ? "bg-shop_light_green/10 text-shop_dark_green font-semibold"
                      : "hover:bg-shop_light_bg text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="uppercase text-[10px] font-bold border border-gray-200 px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">
                      {locale}
                    </span>
                    <span>{localeNames[locale]}</span>
                  </div>
                  {lang === locale && (
                    <div className="w-1.5 h-1.5 rounded-full bg-shop_dark_green"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default UserDropdown;
