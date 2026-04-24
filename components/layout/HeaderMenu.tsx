"use client";
import { headerData } from "@/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderMenuProps {
  dictionary: any;
  lang: string;
}

const HeaderMenu = ({ dictionary, lang }: HeaderMenuProps) => {
  const pathname = usePathname();

  return (
    <div className="hidden md:inline-flex w-full items-center justify-center gap-7 text-sm capitalize font-semibold text-light-color">
      {headerData?.map((item) => {
        const titleKey = item?.title?.toLowerCase();
        let label = item?.title;
        if (item.title === "Home") label = dictionary.header.menu.home;
        if (item.title === "Shop") label = dictionary.header.menu.shop;
        if (item.title === "Limited Roasts" || item.title === "Hot Deal")
          label = dictionary.header.menu.deals;
        if (item.title === "Contact") label = dictionary.header.menu.contact;
        if (item.title === "Blog") label = dictionary.header.menu.blog;
        // "Deals" is "deals", "Orders" is "orders".
        // item.href is usually a good key?
        // href: /deal -> deals

        const href = `/${lang}${item.href === "/" ? "" : item.href}`;
        // Note: pathname includes locale: /en/shop
        // item.href: /shop

        const isActive = pathname === href || pathname === item.href; // Simple check

        return (
          <Link
            key={item?.title}
            href={href}
            className={`hover:text-shop_light_green hoverEffect relative group ${isActive && "text-shop_light_green"}`}
          >
            {label}
            <span
              className={`absolute -bottom-0.5 left-1/2 w-0 h-0.5 bg-shop_light_green transition-all duration-300 group-hover:w-1/2 group-hover:left-0 ${
                isActive && "w-1/2"
              }`}
            />
            <span
              className={`absolute -bottom-0.5 right-1/2 w-0 h-0.5 bg-shop_light_green transition-all duration-300 group-hover:w-1/2 group-hover:right-0 ${
                isActive && "w-1/2"
              }`}
            />
          </Link>
        );
      })}
    </div>
  );
};

export default HeaderMenu;
