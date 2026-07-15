"use client";

import {
  X,
  Home,
  ShoppingBag,
  BookOpen,
  GraduationCap,
  Coffee,
  User,
  ShoppingCart,
  Heart,
  Package,
  Phone,
  HelpCircle,
  Info,
  Grid3X3,
  Store,
  Logs,
  ChevronRight,
  LogOut,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useOutsideClick } from "@/hooks";
import { categoriesData } from "@/constants";
import {
  ClerkLoaded,
  SignedIn,
  SignedOut,
  UserButton,
  useClerk,
} from "@clerk/nextjs";
import useStore from "@/store";
import Logo from "../common/Logo";
import SocialMedia from "../common/SocialMedia";
import LanguageSwitcher from "../LanguageSwitcher";
import { getSidebarNav } from "@/lib/i18n-nav";
import { localizedPath } from "@/lib/localized-path";
import { createPortal } from "react-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
  logoText: { first: string; second: string };
  dictionary: any;
}

const Sidebar: FC<SidebarProps> = ({
  onClose,
  lang,
  logoText,
  dictionary,
}) => {
  const pathname = usePathname();
  const { items, favoriteProduct, openAuthSidebar } = useStore();
  const [mounted, setMounted] = useState(false);

  const localizedHref = (href: string) => localizedPath(href, lang);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animation variants
  const sidebarVariants = {
    closed: { x: "-100%", opacity: 0 },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
    exit: {
      x: "-100%",
      opacity: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const itemVariants = {
    closed: { x: -20, opacity: 0 },
    open: { x: 0, opacity: 1 },
  };

  interface SidebarNavItem {
    title: string;
    href: string;
    icon: LucideIcon;
    badge?: string;
  }

  const menuSections: { title: string; items: SidebarNavItem[] }[] = (() => {
    const nav = getSidebarNav(dictionary);
    const sections = dictionary?.sidebar?.sections ?? {};
    return [
      {
        title: sections.navigation ?? "Navigation",
        items: [
          { title: nav.navigation[0]?.title ?? "Home", href: "/", icon: Home },
          { title: nav.navigation[1]?.title ?? "Shop", href: "/shop", icon: ShoppingBag },
          { title: nav.navigation[2]?.title ?? "Categories", href: "/category", icon: Grid3X3 },
          { title: nav.navigation[3]?.title ?? "Our Coffee", href: "/our-coffee", icon: Coffee },
          { title: nav.navigation[4]?.title ?? "Blog", href: "/blog", icon: BookOpen },
          { title: nav.navigation[5]?.title ?? "Our Roasting Process", href: "/education", icon: GraduationCap },
          { title: nav.navigation[6]?.title ?? "Contact", href: "/contact", icon: Phone },
        ],
      },
      {
        title: sections.support ?? "Support",
        items: [
          { title: nav.support[0]?.title ?? "Help Center", href: "/help", icon: HelpCircle },
          { title: nav.support[1]?.title ?? "Wholesale", href: "/wholesalers", icon: Store },
          { title: nav.support[2]?.title ?? "About Us", href: "/about", icon: Info },
        ],
      },
    ];
  })();

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm lg:hidden"
      />

      {/* Sidebar Container */}
      <motion.div
        variants={sidebarVariants}
        initial="closed"
        animate="open"
        exit="exit"
        className="fixed top-0 left-0 bottom-0 z-[9999] w-[400px] max-w-[85vw] bg-white text-gray-800 shadow-2xl flex flex-col lg:hidden overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white sticky top-0 z-10">
          <Logo
            lang={lang}
            logoText={logoText}
            showText={false}
            imageClassName="h-12 sm:h-14"
          />
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 text-gray-500 hover:text-shop_dark_green"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <div className="p-4 space-y-6">
            {/* User Profile / Auth Section */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <ClerkLoaded>
                <SignedIn>
                  <div className="flex items-center gap-3 mb-3">
                    <UserButton afterSignOutUrl="/" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {dictionary?.sidebar?.sections?.account ?? "My Account"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {dictionary?.sidebar?.account?.manageProfile ?? "Manage your profile"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <Link
                      onClick={onClose}
                        href={localizedHref("/user/orders")}
                      className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 hover:border-shop_light_green hover:text-shop_dark_green transition-all text-xs font-medium"
                    >
                      <Package size={14} />
                      <span>{dictionary?.sidebar?.account?.orders ?? "Orders"}</span>
                    </Link>
                    <Link
                      onClick={onClose}
                        href={localizedHref("/wishlist")}
                      className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 hover:border-shop_light_green hover:text-shop_dark_green transition-all text-xs font-medium"
                    >
                      <Heart size={14} />
                      <span>{dictionary?.userDropdown?.wishlist ?? dictionary?.sidebar?.account?.wishlist ?? "Wishlist"}</span>
                    </Link>
                  </div>
                </SignedIn>
                <SignedOut>
                  <div className="text-center">
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => {
                          openAuthSidebar("signIn");
                          onClose();
                        }}
                        className="w-full bg-shop_dark_green text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-shop_light_green transition-colors shadow-sm"
                      >
                        {dictionary?.sidebar?.auth?.signIn ?? dictionary?.header?.auth?.signIn ?? "Sign In"}
                      </button>
                      <button
                        onClick={() => {
                          openAuthSidebar("signUp");
                          onClose();
                        }}
                        className="w-full bg-white border border-shop_dark_green text-shop_dark_green py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
                      >
                        {dictionary?.sidebar?.auth?.signUp ?? dictionary?.header?.auth?.signUp ?? "Sign Up"}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      {dictionary?.sidebar?.auth?.signInPrompt ??
                        "Sign in to track orders and keep favorites across devices"}
                    </p>
                  </div>
                </SignedOut>
              </ClerkLoaded>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Link
                  onClick={onClose}
                  href={localizedHref("/cart")}
                  className="group flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:border-shop_light_green hover:shadow-md"
                >
                  <div className="relative mb-1">
                    <ShoppingBag className="h-6 w-6 text-gray-600 transition-colors group-hover:text-shop_dark_green" />
                    {items?.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-shop_orange text-[10px] font-bold text-white">
                        {items.length}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    {dictionary?.sidebar?.stats?.cart ?? "Cart"}
                  </span>
                </Link>
                <Link
                  onClick={onClose}
                  href={localizedHref("/wishlist")}
                  className="group flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:border-shop_light_green hover:shadow-md"
                >
                  <div className="relative mb-1">
                    <Heart className="h-6 w-6 text-gray-600 transition-colors group-hover:text-pink-500" />
                    {favoriteProduct?.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white">
                        {favoriteProduct.length}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    {dictionary?.sidebar?.stats?.wishlist ?? "Wishlist"}
                  </span>
                </Link>
              </div>
            </div>

            {/* Menu Sections */}
            {menuSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <h3 className="px-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div variants={itemVariants} key={item.title}>
                      <Link
                        onClick={onClose}
                        href={localizedHref(item.href)}
                        className={`group flex items-center justify-between p-2.5 rounded-lg transition-all duration-200 ${
                          pathname === localizedHref(item.href)
                            ? "bg-shop_dark_green/10 text-shop_dark_green font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            size={18}
                            className={`${
                              pathname === localizedHref(item.href)
                                ? "text-shop_dark_green"
                                : "text-gray-400 group-hover:text-gray-600"
                            }`}
                          />
                          <span>{item.title}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-bold bg-shop_orange/10 text-shop_orange px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight
                          size={14}
                          className={`text-gray-300 transition-transform ${
                            pathname === localizedHref(item.href)
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          }`}
                        />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ))}

            {/* Popular Categories Chips */}
            <div>
              <h3 className="px-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                {dictionary?.sidebar?.sections?.quickCategories ?? "Quick Categories"}
              </h3>
              <div className="flex flex-wrap gap-2 px-1">
                {categoriesData.slice(0, 5).map((cat) => (
                  <Link
                    key={cat.title}
                    onClick={onClose}
                    href={localizedHref(`/category/${cat.href}`)}
                    className="text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-shop_light_green hover:text-white transition-colors border border-transparent hover:border-shop_dark_green/20"
                  >
                    {cat.title}
                  </Link>
                ))}
                <Link
                  onClick={onClose}
                  href={localizedHref("/category")}
                  className="text-xs text-shop_dark_green font-medium bg-shop_dark_green/10 px-3 py-1.5 rounded-full hover:bg-shop_dark_green hover:text-white transition-colors"
                >
                  {dictionary?.sidebar?.viewAll ?? "View All"}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-4">
          <div className="flex justify-center lg:hidden">
            <LanguageSwitcher lang={lang} />
          </div>

          {/* Socials */}
          <div className="flex justify-center">
            <SocialMedia />
          </div>

          <div className="text-center">
            <p className="text-[10px] text-gray-400">
              © 2024 {logoText.first}
              . {dictionary?.footer?.copyright ?? "All rights reserved."}
            </p>
          </div>
        </div>
      </motion.div>
    </>,
    document.body,
  );
};

export default Sidebar;
