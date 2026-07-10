"use client";

import useCartStore from "@/store";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useLocalizedPath } from "@/hooks/useLocale";

const CartIcon = ({
  variant = "light",
  compact = false,
}: {
  variant?: "light" | "dark";
  compact?: boolean;
}) => {
  const { items, openAuthSidebar } = useCartStore();
  const { isSignedIn } = useUser();
  const [isClient, setIsClient] = useState(false);
  const toLocalizedPath = useLocalizedPath();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const itemCount = items?.length || 0;
  const displayCount = itemCount > 9 ? "9+" : itemCount;
  const isDark = variant === "dark";

  const handleClick = (e: React.MouseEvent) => {
    if (!isSignedIn) {
      e.preventDefault();
      openAuthSidebar("signIn");
    }
  };

  const sizeClass = compact ? "h-9 w-9 sm:h-10 sm:w-10" : "h-10 w-10";

  const linkClass = isDark
    ? `group relative inline-flex ${sizeClass} items-center justify-center text-shop_light_pink/85 transition-colors hover:text-shop_orange hoverEffect`
    : `group relative inline-flex ${sizeClass} items-center justify-center text-shop_dark_green transition-colors hover:text-shop_light_green hoverEffect`;

  const iconClass = isDark
    ? "h-[18px] w-[18px] text-shop_light_pink/85 group-hover:text-shop_orange"
    : "h-[18px] w-[18px] group-hover:text-shop_light_green";

  const badgeClass = isDark
    ? "absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-shop_orange px-0.5 text-[10px] font-bold text-shop_dark_green"
    : "absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-shop_dark_green px-0.5 text-[10px] font-bold text-white";

  if (!isClient) {
    return (
      <Link href={toLocalizedPath("/cart")} className={linkClass} aria-label="Shopping cart">
        <ShoppingBag className={iconClass} />
      </Link>
    );
  }

  return (
    <Link
      href={toLocalizedPath("/cart")}
      onClick={handleClick}
      className={linkClass}
      aria-label="Shopping cart"
    >
      <ShoppingBag className={iconClass} />
      {itemCount > 0 && (
        <span className={badgeClass}>{displayCount}</span>
      )}
    </Link>
  );
};

export default CartIcon;
