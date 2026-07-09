"use client";

import { headerPrimaryNav } from "@/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderMenuProps {
  dictionary: any;
  lang: string;
}

type NavItem = { title: string; href: string };

function getNavLabel(item: NavItem, dictionary: HeaderMenuProps["dictionary"]) {
  if (item.title === "Home") return dictionary.header.menu.home;
  if (item.title === "Shop") return dictionary.header.menu.shop;
  if (item.title === "Hot Deal") return dictionary.header.menu.deals;
  if (item.title === "Our Coffee") return dictionary.header.menu.ourCoffee;
  if (item.title === "Our Roasting Process")
    return dictionary.header.menu.education;
  if (item.title === "Contact") return dictionary.header.menu.contact;
  if (item.title === "Blog") return dictionary.header.menu.blog;
  if (item.title === "Wholesalers") return dictionary.header.menu.wholesalers;
  return item.title;
}

const HeaderMenu = ({ dictionary, lang }: HeaderMenuProps) => {
  const pathname = usePathname();

  function isActive(href: string) {
    const localized = `/${lang}${href === "/" ? "" : href}`;
    return pathname === localized || pathname === href;
  }

  return (
    <nav className="hidden lg:inline-flex w-full items-center justify-center gap-5 xl:gap-6 text-sm capitalize font-semibold text-shop_dark_green">
      {headerPrimaryNav.map((item) => {
        const label = getNavLabel(item, dictionary);
        const href = `/${lang}${item.href === "/" ? "" : item.href}`;
        const active = isActive(item.href);

        return (
          <Link
            key={item.title}
            href={href}
            className={`hover:text-shop_orange hoverEffect relative group whitespace-nowrap ${
              active ? "text-shop_orange" : "text-shop_dark_green"
            }`}
          >
            {label}
            <span
              className={`absolute -bottom-0.5 left-1/2 w-0 h-0.5 bg-shop_orange transition-all duration-300 group-hover:w-1/2 group-hover:left-0 ${
                active && "w-1/2"
              }`}
            />
            <span
              className={`absolute -bottom-0.5 right-1/2 w-0 h-0.5 bg-shop_orange transition-all duration-300 group-hover:w-1/2 group-hover:right-0 ${
                active && "w-1/2"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
};

export default HeaderMenu;
