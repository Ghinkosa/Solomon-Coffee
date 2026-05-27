"use client";
import { Product } from "@/sanity.types";
import { useEffect, useState, memo, useCallback } from "react";
import { toast } from "sonner";
import PriceFormatter from "./PriceFormatter";
import { Button } from "./ui/button";
import useCartStore, { WeightOption, GrindOption, PackagingOption } from "@/store";
import QuantityButtons from "./QuantityButtons";
import { cn } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import { trackAddToCart } from "@/lib/analytics";

interface Props {
  product: Product;
  className?: string;
  theme?: "default" | "onDark";
  selectedWeight?: WeightOption;
  selectedGrind?: GrindOption;
  selectedPackaging?: PackagingOption;
}

// Helper functions to get default values
const getDefaultWeight = (product: Product): WeightOption | undefined => {
  return (product as any).weightOptions?.find((w: WeightOption) => w.isDefault);
};

const getDefaultGrind = (product: Product): GrindOption | undefined => {
  return (product as any).grindOptions?.find((g: GrindOption) => g.isDefault && g.available);
};

const getDefaultPackaging = (product: Product): PackagingOption | undefined => {
  return (product as any).packagingOptions?.find((p: any) => p.isDefault)?.packaging;
};

const getItemCurrentPrice = (product: Product, selectedWeight?: WeightOption): number => {
  if (selectedWeight && selectedWeight.price) {
    return selectedWeight.price;
  }
  const defaultWeight = getDefaultWeight(product);
  return defaultWeight?.price || product.price || 0;
};

const getItemPackagingPrice = (selectedPackaging?: PackagingOption): number => {
  return selectedPackaging?.price || 0;
};

const AddToCartButton = memo(({ 
  product, 
  className, 
  theme = "default",
  selectedWeight,
  selectedGrind,
  selectedPackaging,
}: Props) => {
  const isOnDark = theme === "onDark";
  const { addItem, getItemCount } = useCartStore();
  const [isClient, setIsClient] = useState(false);

  // Get effective selections (use passed values or fallback to defaults)
  const effectiveWeight = selectedWeight || getDefaultWeight(product);
  const effectiveGrind = selectedGrind || getDefaultGrind(product);
  const effectivePackaging = selectedPackaging || getDefaultPackaging(product);
  
  const itemCurrentPrice = getItemCurrentPrice(product, effectiveWeight);
  const itemPackagingPrice = getItemPackagingPrice(effectivePackaging);
  const totalItemPrice = itemCurrentPrice + itemPackagingPrice;
  
  const itemCount = getItemCount(product?._id);
  const isOutOfStock = product?.stock === 0;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddToCart = useCallback(() => {
    if ((product?.stock as number) > itemCount) {
      // Pass all selections to the store
      addItem(product, effectiveWeight, effectiveGrind, effectivePackaging);
      
      let description = `Current quantity: ${itemCount + 1}`;
      if (effectiveWeight) description += ` | Weight: ${effectiveWeight.weight}`;
      if (effectiveGrind) description += ` | Grind: ${effectiveGrind.grindType}`;
      if (effectivePackaging) description += ` | Packaging: ${effectivePackaging.title}`;
      
      toast.success(`${product?.name} added to cart!`, {
        description,
        duration: 3000,
      });
      
      // Analytics tracking
      trackAddToCart({
        productId: product._id,
        name: product.name || "Unknown",
        price: totalItemPrice,
        quantity: itemCount + 1,
        weight: effectiveWeight?.weight,
        grind: effectiveGrind?.grindType,
        packaging: effectivePackaging?.title,
      });
    } else {
      toast.error("Stock limit reached", {
        description: "Cannot add more than available stock",
        duration: 4000,
      });
    }
  }, [product, itemCount, addItem, effectiveWeight, effectiveGrind, effectivePackaging, totalItemPrice]);

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
              "mt-2 flex flex-col gap-1 border-t pt-2",
              isOnDark ? "border-[#e4c290]/25" : "",
            )}
          >
            {/* Display selected options summary */}
            {(effectiveWeight || effectiveGrind || effectivePackaging) && (
              <div className="text-xs space-y-0.5">
                {effectiveWeight && (
                  <div className="flex justify-between">
                    <span className={isOnDark ? "text-[#e4c290]/70" : "text-muted-foreground"}>
                      Weight:
                    </span>
                    <span className={isOnDark ? "text-[#fdf6e8]" : ""}>
                      {effectiveWeight.weight} (+${effectiveWeight.price})
                    </span>
                  </div>
                )}
                {effectiveGrind && (
                  <div className="flex justify-between">
                    <span className={isOnDark ? "text-[#e4c290]/70" : "text-muted-foreground"}>
                      Grind:
                    </span>
                    <span className={isOnDark ? "text-[#fdf6e8]" : ""}>
                      {effectiveGrind.grindType === "whole-bean" ? "Whole Bean" :
                       effectiveGrind.grindType === "cafetiere" ? "Cafetiere" :
                       effectiveGrind.grindType === "filter" ? "Filter" : "Espresso"}
                    </span>
                  </div>
                )}
                {effectivePackaging && (
                  <div className="flex justify-between">
                    <span className={isOnDark ? "text-[#e4c290]/70" : "text-muted-foreground"}>
                      Packaging:
                    </span>
                    <span className={isOnDark ? "text-[#fdf6e8]" : ""}>
                      {effectivePackaging.title} {effectivePackaging.price > 0 && `(+$${effectivePackaging.price})`}
                    </span>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "text-xs font-semibold",
                  isOnDark ? "text-[#e4c290]" : "",
                )}
              >
                Subtotal
              </span>
              <PriceFormatter
                amount={totalItemPrice * itemCount}
                className={isOnDark ? "text-[#fdf6e8] font-semibold" : undefined}
              />
            </div>
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