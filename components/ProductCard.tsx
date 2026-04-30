import { memo } from "react";
import { Product } from "@/sanity.types";
import PriceView from "./PriceView";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import Title from "./Title";
import { StarIcon } from "@sanity/icons";
import ProductSideMenu from "./ProductSideMenu";
import { Flame } from "lucide-react";
import { image } from "@/sanity/image";

interface ProductCardProps {
  product: Product;
  mode?: "default" | "home";
  isExpanded?: boolean;
  onImageTap?: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

const ProductCard = memo(
  ({
    product,
    mode = "default",
    isExpanded = false,
    onImageTap,
    onHoverStart,
    onHoverEnd,
  }: ProductCardProps) => {
  const isHomeMode = mode === "home";

  return (
    <div
      className={`text-sm border rounded-md border-dark-blue/20 group bg-white ${
        isHomeMode
          ? "transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          : ""
      }`}
      onMouseEnter={isHomeMode ? onHoverStart : undefined}
      onMouseLeave={isHomeMode ? onHoverEnd : undefined}
    >
      <div className="relative group overflow-hidden bg-shop_light_bg">
        {product?.images && (
          <>
            {isHomeMode ? (
              <>
                <button
                  type="button"
                  onClick={onImageTap}
                  className="block w-full text-left md:hidden"
                  aria-expanded={isExpanded}
                >
                  <img
                    src={image(product.images[0]).size(900, 880).url()}
                    className={`w-full h-64 object-contain overflow-hidden transition-transform bg-shop_light_bg duration-500 ${
                      product?.stock !== 0 ? "group-hover:scale-105" : "opacity-50"
                    }`}
                    alt="productImage"
                    loading="lazy"
                  />
                </button>
                <Link href={`/product/${product?.slug?.current}`} className="hidden md:block">
                  <img
                    src={image(product.images[0]).size(900, 880).url()}
                    className={`w-full h-64 object-contain overflow-hidden transition-transform bg-shop_light_bg duration-500 ${
                      product?.stock !== 0 ? "group-hover:scale-105" : "opacity-50"
                    }`}
                    alt="productImage"
                    loading="lazy"
                  />
                </Link>
              </>
            ) : (
              <Link href={`/product/${product?.slug?.current}`}>
                <img
                  src={image(product.images[0]).size(900, 880).url()}
                  className={`w-full h-64 object-contain overflow-hidden transition-transform bg-shop_light_bg duration-500 ${
                    product?.stock !== 0
                      ? "group-hover:scale-105"
                      : "opacity-50"
                  }`}
                  alt="productImage"
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
          <Link
            href={"/deal"}
            className="absolute top-2 left-2 z-10 border border-shop_orange/50 p-1 rounded-full group-hover:border-shop_orange hover:text-shop_dark_green hoverEffect"
          >
            <Flame
              size={18}
              fill="#fb6c08"
              className="text-shop_orange/50 group-hover:text-shop_orange hoverEffect"
            />
          </Link>
        )}
      </div>

      <div className="p-3 flex flex-col gap-2">
        <Link href={`/product/${product?.slug?.current}`} className="block">
          <Title className="text-sm line-clamp-1">{product?.name}</Title>

          <div className="flex items-center gap-2 mt-2">
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

        {!isHomeMode && (
          <div>
            {product?.categories && (
              <p className="uppercase line-clamp-1 text-xs font-medium text-light-text">
                {product.categories.map((cat) => cat).join(", ")}
              </p>
            )}

            <PriceView
              price={product?.price}
              discount={product?.discount}
              className="text-sm mt-2"
            />
            <AddToCartButton product={product} className="w-36 rounded-full mt-2" />
          </div>
        )}
      </div>
    </div>
  );
},
);

ProductCard.displayName = "ProductCard";

export default ProductCard;
