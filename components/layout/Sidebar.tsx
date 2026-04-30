"use client";

import {
  X,
  Home,
  ShoppingBag,
  BookOpen,
  Coffee,
  User,
  ShoppingCart,
  Heart,
  Package,
  Phone,
  HelpCircle,
  Info,
  Grid3X3,
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
import { createPortal } from "react-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
  logoText: { first: string; second: string };
  dealNavLabel?: string;
}

const Sidebar: FC<SidebarProps> = ({
  isOpen,
  onClose,
  lang,
  logoText,
  dealNavLabel,
}) => {
  const pathname = usePathname();
  const { items, favoriteProduct, openAuthSidebar } = useStore();
  const { signOut } = useClerk();
  const [mounted, setMounted] = useState(false);

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

  const menuSections: { title: string; items: SidebarNavItem[] }[] = [
    {
      title: "Navigation",
      items: [
        { title: "Home", href: "/", icon: Home },
        { title: "Shop", href: "/shop", icon: ShoppingBag },
        { title: "Categories", href: "/category", icon: Grid3X3 },
        { title: "Blog", href: "/blog", icon: BookOpen },
        {
          title: dealNavLabel ?? "Limited Roasts",
          href: "/deal",
          icon: Coffee,
        },
      ],
    },
    {
      title: "Support",
      items: [
        { title: "Help Center", href: "/help", icon: HelpCircle },
        { title: "Contact Us", href: "/contact", icon: Phone },
        { title: "About Us", href: "/about", icon: Info },
      ],
    },
  ];

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm md:hidden"
      />

      {/* Sidebar Container */}
      <motion.div
        variants={sidebarVariants}
        initial="closed"
        animate="open"
        exit="exit"
        className="fixed top-0 left-0 bottom-0 z-[9999] w-[400px] max-w-[85vw] bg-white text-gray-800 shadow-2xl flex flex-col md:hidden overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white sticky top-0 z-10">
          <Logo lang={lang} logoText={logoText} />
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
                        My Account
                      </p>
                      <p className="text-xs text-gray-500">
                        Manage your profile
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <Link
                      onClick={onClose}
                      href="/user/orders"
                      className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 hover:border-shop_light_green hover:text-shop_dark_green transition-all text-xs font-medium"
                    >
                      <Package size={14} />
                      <span>Orders</span>
                    </Link>
                    <Link
                      onClick={onClose}
                      href="/favorites"
                      className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 hover:border-shop_light_green hover:text-shop_dark_green transition-all text-xs font-medium"
                    >
                      <Heart size={14} />
                      <span>Wishlist</span>
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
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          openAuthSidebar("signUp");
                          onClose();
                        }}
                        className="w-full bg-white border border-shop_dark_green text-shop_dark_green py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
                      >
                        Sign Up
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      Sign in to access your orders and wishlist
                    </p>
                  </div>
                </SignedOut>
              </ClerkLoaded>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                onClick={onClose}
                href="/cart"
                className="flex flex-col items-center justify-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-shop_light_green transition-all group"
              >
                <div className="relative mb-1">
                  <ShoppingBag className="w-6 h-6 text-gray-600 group-hover:text-shop_dark_green transition-colors" />
                  {items?.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-shop_orange text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                      {items.length}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-700">Cart</span>
              </Link>
              <Link
                onClick={onClose}
                href="/wishlist"
                className="flex flex-col items-center justify-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-shop_light_green transition-all group"
              >
                <div className="relative mb-1">
                  <Heart className="w-6 h-6 text-gray-600 group-hover:text-pink-500 transition-colors" />
                  {favoriteProduct?.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                      {favoriteProduct.length}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-700">
                  Wishlist
                </span>
              </Link>
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
                        href={item.href}
                        className={`group flex items-center justify-between p-2.5 rounded-lg transition-all duration-200 ${
                          pathname === item.href
                            ? "bg-shop_dark_green/10 text-shop_dark_green font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            size={18}
                            className={`${
                              pathname === item.href
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
                            pathname === item.href
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
                Quick Categories
              </h3>
              <div className="flex flex-wrap gap-2 px-1">
                {categoriesData.slice(0, 5).map((cat) => (
                  <Link
                    key={cat.title}
                    onClick={onClose}
                    href={`/category/${cat.href}`}
                    className="text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-shop_light_green hover:text-white transition-colors border border-transparent hover:border-shop_dark_green/20"
                  >
                    {cat.title}
                  </Link>
                ))}
                <Link
                  onClick={onClose}
                  href="/category"
                  className="text-xs text-shop_dark_green font-medium bg-shop_dark_green/10 px-3 py-1.5 rounded-full hover:bg-shop_dark_green hover:text-white transition-colors"
                >
                  View All
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-4">
          {/* Socials */}
          <div className="flex justify-center">
            <SocialMedia />
          </div>

          <div className="text-center">
            <p className="text-[10px] text-gray-400">
              © 2024 {logoText.first}
              {logoText.second}. All rights reserved.
            </p>
          </div>
        </div>
      </motion.div>
    </>,
    document.body,
  );
};

export default Sidebar;
