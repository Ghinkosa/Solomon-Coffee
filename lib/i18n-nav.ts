import type { Dictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";

type NavItem = { title: string; href: string };

export function getQuickLinks(dictionary: Dictionary, lang: string): NavItem[] {
  const links = (dictionary as { footer?: { quickLinks?: NavItem[] } }).footer
    ?.quickLinks;
  if (links?.length) return links;
  return [
    { title: "About us", href: `/${lang}/about` },
    { title: "Wholesale", href: `/${lang}/shop#wholesale` },
    { title: "Contact us", href: `/${lang}/contact` },
    { title: "Terms & Conditions", href: `/${lang}/terms` },
    { title: "Privacy Policy", href: `/${lang}/privacy` },
    { title: "FAQs", href: `/${lang}/faqs` },
    { title: "Help", href: `/${lang}/help` },
  ];
}

export function getSidebarNav(dictionary: Dictionary): {
  navigation: NavItem[];
  support: NavItem[];
} {
  const menu = (dictionary as { header?: { menu?: Record<string, string> } })
    .header?.menu;
  const sidebar = (dictionary as { sidebar?: { nav?: Record<string, string> } })
    .sidebar?.nav;

  return {
    navigation: [
      { title: menu?.home ?? "Home", href: "/" },
      { title: menu?.shop ?? "Shop", href: "/shop" },
      {
        title: sidebar?.categories ?? "Categories",
        href: "/category",
      },
      { title: menu?.ourCoffee ?? "Our Coffee", href: "/our-coffee" },
      { title: menu?.blog ?? "Blog", href: "/blog" },
      {
        title: menu?.education ?? "Our Roasting Process",
        href: "/education",
      },
      { title: menu?.contact ?? "Contact", href: "/contact" },
    ],
    support: [
      {
        title: sidebar?.helpCenter ?? "Help Center",
        href: "/help",
      },
      {
        title: sidebar?.wholesale ?? "Wholesale",
        href: "/wholesalers",
      },
      { title: sidebar?.aboutUs ?? "About Us", href: "/about" },
    ],
  };
}

export function getGrindLabel(
  dictionary: Dictionary,
  grindType: string,
): string {
  const grind = (dictionary as { product?: { grind?: Record<string, string> } })
    .product?.grind;
  const keyMap: Record<string, string> = {
    "whole-bean": grind?.wholeBean ?? "Whole Bean",
    cafetiere: grind?.cafetiere ?? "Cafetiere",
    filter: grind?.filter ?? "Filter",
    espresso: grind?.espresso ?? "Espresso",
  };
  return keyMap[grindType] ?? grindType;
}

export { t };
