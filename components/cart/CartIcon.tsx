"use client";

import useCartStore from "@/store";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

const CartIcon = ({
  variant = "light",
  compact = false,
}: {
  variant?: "light" | "dark";
  compact?: boolean;
}) => {
  const { items, openCartDrawer } = useCartStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const itemCount = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const displayCount = itemCount > 9 ? "9+" : itemCount;
  const isDark = variant === "dark";

  const sizeClass = compact ? "h-9 w-9 sm:h-10 sm:w-10" : "h-10 w-10";

  const buttonClass = isDark
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
      <span className={buttonClass} aria-hidden>
        <ShoppingBag className={iconClass} />
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openCartDrawer()}
      className={buttonClass}
      aria-label={`Shopping cart, ${itemCount} items`}
    >
      <ShoppingBag className={iconClass} />
      {itemCount > 0 && <span className={badgeClass}>{displayCount}</span>}
    </button>
  );
};

export default CartIcon;
