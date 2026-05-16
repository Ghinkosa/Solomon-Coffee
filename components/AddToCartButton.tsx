"use client";
import { Product } from "@/sanity.types";
import { useEffect, useState, memo, useCallback } from "react";
import { toast } from "sonner";
import PriceFormatter from "./PriceFormatter";
import { Button } from "./ui/button";
import useCartStore from "@/store";
import QuantityButtons from "./QuantityButtons";
import { cn } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import { trackAddToCart } from "@/lib/analytics";

interface Props {
  product: Product;
  className?: string;
  theme?: "default" | "onDark";
}

const AddToCartButton = memo(({ product, className, theme = "default" }: Props) => {
  const isOnDark = theme === "onDark";
  const { addItem, getItemCount } = useCartStore();
  const [isClient, setIsClient] = useState(false);

  // All hooks must be called before any conditional logic
  const itemCount = getItemCount(product?._id);
  const isOutOfStock = product?.stock === 0;

  // Use useEffect to set isClient to true after component mounts
  // This ensures that the component only renders on the client-side
  // Preventing hydration errors due to server/client mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddToCart = useCallback(() => {
    if ((product?.stock as number) > itemCount) {
      addItem(product);
      toast.success(`${product?.name} added to cart!`, {
        description: `Current quantity: ${itemCount + 1}`,
        duration: 3000,
      });
      // Firebase Analytics event
      trackAddToCart({
        productId: product._id,
        name: product.name || "Unknown",
        price: product.price ?? 0,
        quantity: itemCount + 1,
      });
    } else {
      toast.error("Stock limit reached", {
        description: "Cannot add more than available stock",
        duration: 4000,
      });
    }
  }, [product, itemCount, addItem]);

  // Early return after all hooks have been called - this is crucial for Rules of Hooks
  if (!isClient) {
    return (
      <div className="w-full h-12 flex items-center">
        <Button
          disabled
          className={cn(
            "w-full bg-gray-200 text-gray-500 shadow-none border border-gray-300",
            className
          )}
        >
          <ShoppingBag /> Loading...
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-12 flex items-center">
      {itemCount ? (
        <div className="text-sm w-full">
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-xs font-medium",
                isOnDark ? "text-[#e4c290]/90" : "text-muted-foreground",
              )}
            >
              Quantity
            </span>
            <QuantityButtons
              product={product}
              countClassName={isOnDark ? "text-[#fdf6e8]" : undefined}
              buttonClassName={
                isOnDark
                  ? "border-[#e4c290]/40 bg-[#2a1810]/80 text-[#fdf6e8] hover:bg-[#3a2417]"
                  : undefined
              }
            />
          </div>
          <div
            className={cn(
              "mt-2 flex items-center justify-between border-t pt-2",
              isOnDark ? "border-[#e4c290]/25" : "",
            )}
          >
            <span
              className={cn(
                "text-xs font-semibold",
                isOnDark ? "text-[#e4c290]" : "",
              )}
            >
              Subtotal
            </span>
            <PriceFormatter
              amount={product?.price ? product.price * itemCount : 0}
              className={isOnDark ? "text-[#fdf6e8] font-semibold" : undefined}
            />
          </div>
        </div>
      ) : (
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={cn(
            "w-full bg-shop_dark_green/80 text-light-bg shadow-none border border-shop_dark_green/80 font-semibold tracking-wide hover:text-white hover:bg-shop_dark_green hover:border-shop_dark_green hoverEffect",
            className
          )}
        >
          <ShoppingBag /> {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      )}
    </div>
  );
});

AddToCartButton.displayName = "AddToCartButton";

export default AddToCartButton;
