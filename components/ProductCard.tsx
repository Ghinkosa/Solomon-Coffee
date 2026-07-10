"use client";

import { memo } from "react";
import { Product } from "@/sanity.types";
import PriceView from "./PriceView";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import Title from "./Title";
import { StarIcon } from "@sanity/icons";
import ProductSideMenu from "./ProductSideMenu";
import { Flame, ArrowUpRight } from "lucide-react";
import { image } from "@/sanity/image";
import { useLocalizedPath } from "@/hooks/useLocale";

interface ProductCardProps {
  product: Product;
  mode?: "default" | "home" | "shop";
  isExpanded?: boolean;
  onImageTap?: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

const getDisplayPrice = (product: Product): number => {
  const defaultWeight = (product as Product & {
    weightOptions?: Array<{ isDefault?: boolean; price?: number }>;
  }).weightOptions?.find((option) => option.isDefault);

  return defaultWeight?.price ?? product.price ?? 0;
};

const hasProductOptions = (product: Product): boolean => {
  const extendedProduct = product as Product & {
    weightOptions?: unknown[];
    grindOptions?: unknown[];
    packagingOptions?: unknown[];
  };

  return Boolean(
    extendedProduct.weightOptions?.length ||
      extendedProduct.grindOptions?.length ||
      extendedProduct.packagingOptions?.length,
  );
};

const ProductCard = memo(
  ({
    product,
    mode = "default",
    isExpanded = false,
    onImageTap,
    onHoverStart,
    onHoverEnd,
  }: ProductCardProps) => {
  const toLocalizedPath = useLocalizedPath();
  const isHomeMode = mode === "home";
  const isShopMode = mode === "shop";
  const isExpandable = mode === "home" || mode === "shop";
  const productHref = toLocalizedPath(`/product/${product?.slug?.current}`);
  const displayPrice = getDisplayPrice(product);
  const showOptionsHint = isShopMode && hasProductOptions(product);
  const primaryCategory = product?.categories?.[0];

  return (
    <div
      className={`text-sm group bg-white flex flex-col h-full ${
        isExpandable
          ? "overflow-hidden rounded-xl border border-gray-200/80 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-shop_light_green/40 hover:shadow-md"
          : "rounded-md border border-dark-blue/20"
      }`}
      onMouseEnter={isExpandable ? onHoverStart : undefined}
      onMouseLeave={isExpandable ? onHoverEnd : undefined}
    >
      <div className="relative overflow-hidden bg-shop_light_bg/70">
        {product?.images && (
          <>
            {isExpandable ? (
              <>
                <button
                  type="button"
                  onClick={onImageTap}
                  className="block w-full text-left md:hidden"
                  aria-expanded={isExpanded}
                >
                  <img
                    src={image(product.images[0]).size(900, 880).url()}
                    className={`w-full aspect-[4/3] object-contain p-4 transition-transform duration-500 ${
                      product?.stock !== 0 ? "group-hover:scale-[1.03]" : "opacity-50"
                    }`}
                    alt={product.name || "Product image"}
                    loading="lazy"
                  />
                </button>
                <Link href={productHref} className="hidden md:block">
                  <img
                    src={image(product.images[0]).size(900, 880).url()}
                    className={`w-full aspect-[4/3] object-contain p-4 transition-transform duration-500 ${
                      product?.stock !== 0 ? "group-hover:scale-[1.03]" : "opacity-50"
                    }`}
                    alt={product.name || "Product image"}
                    loading="lazy"
                  />
                </Link>
              </>
            ) : (
              <Link href={productHref}>
                <img
                  src={image(product.images[0]).size(900, 880).url()}
                  className={`w-full aspect-[4/3] object-contain p-4 transition-transform duration-500 ${
                    product?.stock !== 0
                      ? "group-hover:scale-[1.03]"
                      : "opacity-50"
                  }`}
                  alt={product.name || "Product image"}
                  loading="lazy"
                />
              </Link>
            )}
          </>
        )}
        <ProductSideMenu product={product} />
        {product?.status === "sale" ? (
          <p className="absolute top-2 left-2 z-10 text-xs border border-dark-color/50 px-2 rounded-full group-hover:border-light-green hover:text-shop_dark_green hoverEffect">
            Sale!
          </p>
        ) : (
          !isHomeMode && (
            <span className="absolute top-2 left-2 z-10 border border-shop_orange/50 p-1 rounded-full group-hover:border-shop_orange hover:text-shop_dark_green hoverEffect">
              <Flame
                size={18}
                fill="#fb6c08"
                className="text-shop_orange/50 group-hover:text-shop_orange hoverEffect"
              />
            </span>
          )
        )}
      </div>

      <div className={`flex flex-col flex-1 ${isShopMode ? "p-4 gap-3" : "p-3 gap-2"}`}>
        <Link href={productHref} className="block space-y-2">
          {isShopMode && primaryCategory && (
            <span className="inline-flex items-center rounded-full bg-shop_light_bg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-shop_light_green">
              {primaryCategory}
            </span>
          )}

          <Title className={`${isShopMode ? "text-base font-semibold leading-snug line-clamp-2 min-h-[2.5rem]" : "text-sm line-clamp-1"}`}>
            {product?.name}
          </Title>

          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <StarIcon
                  key={index}
                  className={
                    index < Math.round(product?.averageRating || 0)
                      ? "text-shop_light_green"
                      : " text-light-text"
                  }
                  fill={
                    index < Math.round(product?.averageRating || 0)
                      ? "#93D991"
                      : "#ababab"
                  }
                />
              ))}
            </div>
            <p className="text-light-text text-xs tracking-wide">
              {product?.totalReviews
                ? `${product.totalReviews} ${
                    product.totalReviews === 1 ? "Review" : "Reviews"
                  }`
                : "No Reviews"}
            </p>
          </div>
        </Link>

        {mode !== "home" && (
          <div className={`mt-auto ${isShopMode ? "space-y-3 border-t border-gray-100 pt-3" : ""}`}>
            {!isShopMode && product?.categories && (
              <p className="uppercase line-clamp-1 text-xs font-medium text-light-text">
                {product.categories.map((cat) => cat).join(", ")}
              </p>
            )}

            {isShopMode ? (
              <>
                <div className="space-y-1">
                  {showOptionsHint && (
                    <p className="text-[11px] text-muted-foreground">From</p>
                  )}
                  <PriceView
                    price={displayPrice}
                    discount={product?.discount}
                    layout="stack"
                  />
                </div>

                <div className="space-y-2">
                  <AddToCartButton
                    product={product}
                    compact
                    className="rounded-full h-10"
                  />
                  {showOptionsHint && (
                    <Link
                      href={productHref}
                      className="inline-flex items-center gap-1 text-xs font-medium text-shop_light_green transition-colors hover:text-shop_dark_green"
                    >
                      Customize options
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <>
                <PriceView
                  price={product?.price}
                  discount={product?.discount}
                  className="text-sm mt-2"
                />
                <AddToCartButton product={product} className="w-36 rounded-full mt-2" />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
},
);

ProductCard.displayName = "ProductCard";

export default ProductCard;
