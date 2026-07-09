"use client";
import { Product } from "@/sanity.types";
import useCartStore from "@/store";
import { Heart } from "lucide-react";
import BreadcrumbLink from "@/components/BreadcrumbLink";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import isArray from "js-isarray";
import _ from "lodash";
import { trackWishlistAdd, trackWishlistRemove } from "@/lib/analytics";

const FavoriteButton = ({
  showProduct = false,
  product,
  variant = "light",
}: {
  showProduct?: boolean;
  product?: Product;
  variant?: "light" | "dark";
}) => {
  const { favoriteProduct, addToFavorite, openAuthSidebar } = useCartStore();
  const { isSignedIn } = useUser();
  const [existingProduct, setExistingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const availableItem = _.find(
      favoriteProduct,
      (item) => item?._id === product?._id,
    );
    setExistingProduct(availableItem || null);
  }, [product, favoriteProduct]);

  const handleFavorite = (
    e: React.MouseEvent<HTMLSpanElement | HTMLButtonElement>,
  ) => {
    e.preventDefault();
    if (!isSignedIn) {
      openAuthSidebar("signIn");
      return;
    }

    if (product?._id) {
      const isRemoving = !!existingProduct;

      addToFavorite(product).then(() => {
        toast.success(
          isRemoving ? "Removed from wishlist" : "Added to wishlist",
          {
            description: isRemoving
              ? "Product removed successfully!"
              : "Product added successfully!",
            duration: 3000,
          },
        );

        // Track wishlist analytics
        if (isRemoving) {
          trackWishlistRemove({
            productId: product._id,
            name: product.name || "Unknown Product",
          });
        } else {
          trackWishlistAdd({
            productId: product._id,
            name: product.name || "Unknown Product",
          });
        }
      });
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    if (!isSignedIn) {
      e.preventDefault();
      openAuthSidebar("signIn");
    }
  };

  const isProductMode = showProduct || !!product;

  if (!isProductMode && !isSignedIn) {
    return null;
  }

  const isDark = variant === "dark";
  const navIconClass = isDark
    ? "h-[18px] w-[18px] text-shop_light_pink/85 group-hover:text-shop_orange"
    : "h-[18px] w-[18px] text-shop_dark_green group-hover:text-shop_light_green";
  const navLinkClass = isDark
    ? "group relative inline-flex h-10 w-10 items-center justify-center text-shop_light_pink/85 transition-colors hover:text-shop_orange hoverEffect"
    : "group relative inline-flex h-10 w-10 items-center justify-center text-shop_dark_green transition-colors hover:text-shop_light_green hoverEffect";

  return (
    <>
      {!isProductMode ? (
        <BreadcrumbLink
          href={"/wishlist"}
          onClick={handleWishlistClick}
          className={navLinkClass}
        >
          <Heart className={`hoverEffect ${navIconClass}`} />
          {isArray(favoriteProduct) && favoriteProduct.length > 0 && (
          <span
            className={`absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[10px] font-bold ${
              isDark
                ? "bg-shop_orange text-shop_dark_green"
                : "bg-shop_dark_green text-white"
            } ${favoriteProduct.length > 9 ? "px-1" : ""}`}
          >
            {favoriteProduct.length > 9 ? "9+" : favoriteProduct.length}
          </span>
          )}
        </BreadcrumbLink>
      ) : (
        <button
          onClick={handleFavorite}
          className="group relative hover:text-shop_light_green hoverEffect border border-shop_light_green/80 p-1.5 rounded-sm "
        >
          <Heart
            fill={existingProduct ? "#063c28" : "#fff"}
            className="text-shop_light_green/80 group-hover:text-shop_light_green hoverEffect mt-.5"
          />
        </button>
      )}
    </>
  );
};

export default FavoriteButton;
