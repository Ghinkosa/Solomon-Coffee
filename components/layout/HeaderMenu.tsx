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
    if (href === "/") {
      return pathname === localized;
    }
    return pathname === localized || pathname.startsWith(`${localized}/`);
  }

  return (
    <nav aria-label="Main navigation">
      <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 xl:gap-x-7">
        {headerPrimaryNav.map((item) => {
          const label = getNavLabel(item, dictionary);
          const href = `/${lang}${item.href === "/" ? "" : item.href}`;
          const active = isActive(item.href);

          return (
            <li key={item.title} className="shrink-0">
              <Link
                href={href}
                className={`whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors duration-200 xl:text-[13px] xl:tracking-[0.12em] ${
                  active
                    ? "text-shop_dark_green"
                    : "text-stone-500 hover:text-shop_light_green"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default HeaderMenu;
