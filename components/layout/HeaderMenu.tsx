"use client";

import {
  headerBlogNav,
  headerContactNav,
  headerPrimaryNav,
} from "@/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
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
  if (item.title === "Our Roasting Process" || item.title === "Hot Deal")
    return dictionary.header.menu.deals;
  if (item.title === "Contact") return dictionary.header.menu.contact;
  if (item.title === "Blog") return dictionary.header.menu.blog;
  if (item.title === "Education") return dictionary.header.menu.education;
  if (item.title === "Wholesalers") return dictionary.header.menu.wholesalers;
  return item.title;
}

interface NavDropdownProps {
  items: NavItem[];
  triggerLabel: string;
  isActive: boolean;
  dictionary: HeaderMenuProps["dictionary"];
  lang: string;
  pathname: string;
}

function NavDropdown({
  items,
  triggerLabel,
  isActive,
  dictionary,
  lang,
  pathname,
}: NavDropdownProps) {
  function isItemActive(href: string) {
    const localized = `/${lang}${href === "/" ? "" : href}`;
    return pathname === localized || pathname === href;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`inline-flex items-center gap-1 hover:text-shop_orange hoverEffect outline-none whitespace-nowrap ${
          isActive ? "text-shop_orange" : "text-shop_dark_green"
        }`}
      >
        {triggerLabel}
        <ChevronDown className="h-4 w-4 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="min-w-[10rem]">
        {items.map((item) => {
          const label = getNavLabel(item, dictionary);
          const href = `/${lang}${item.href === "/" ? "" : item.href}`;
          const active = isItemActive(item.href);

          return (
            <DropdownMenuItem key={item.title} asChild>
              <Link
                href={href}
                className={`cursor-pointer ${active ? "text-shop_orange font-medium" : ""}`}
              >
                {label}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const HeaderMenu = ({ dictionary, lang }: HeaderMenuProps) => {
  const pathname = usePathname();

  function isActive(href: string) {
    const localized = `/${lang}${href === "/" ? "" : href}`;
    return pathname === localized || pathname === href;
  }

  function renderLink(item: NavItem) {
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
  }

  const blogDropdownActive = headerBlogNav.some((item) => isActive(item.href));
  const contactDropdownActive = headerContactNav.some((item) =>
    isActive(item.href),
  );
  const blogLabel = dictionary?.header?.menu?.blog ?? "Blog";
  const contactUsLabel =
    dictionary?.header?.menu?.contactUs ?? "Contact Us";

  return (
    <nav className="hidden lg:inline-flex w-full items-center justify-center gap-5 xl:gap-6 text-sm capitalize font-semibold text-shop_dark_green">
      {headerPrimaryNav.map((item) => renderLink(item))}

      <NavDropdown
        items={headerBlogNav}
        triggerLabel={blogLabel}
        isActive={blogDropdownActive}
        dictionary={dictionary}
        lang={lang}
        pathname={pathname}
      />

      <NavDropdown
        items={headerContactNav}
        triggerLabel={contactUsLabel}
        isActive={contactDropdownActive}
        dictionary={dictionary}
        lang={lang}
        pathname={pathname}
      />
    </nav>
  );
};

export default HeaderMenu;
