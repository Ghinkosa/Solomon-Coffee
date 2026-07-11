"use client";
import { cn } from "@/lib/utils";
import { Product } from "@/sanity.types";
import useCartStore from "@/store";
import { Heart } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import _ from "lodash";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";

const ProductSideMenu = ({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) => {
  const { favoriteProduct, addToFavorite } = useCartStore();
  const dictionary = useDictionary();
  const [existingProduct, setExistingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const availableItem = _.find(
      favoriteProduct,
      (item) => item?._id === product?._id
    );
    setExistingProduct(availableItem || null);
  }, [product, favoriteProduct]);

  const handleFavorite = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    if (product?._id) {
      addToFavorite(product).then(() => {
        toast.success(
          existingProduct
            ? t(dictionary, "wishlist.toasts.removed", "Removed from wishlist")
            : t(dictionary, "wishlist.toasts.added", "Added to wishlist"),
          {
            description: existingProduct
              ? t(
                  dictionary,
                  "wishlist.toasts.removedDescription",
                  "Product removed successfully!",
                )
              : t(
                  dictionary,
                  "wishlist.toasts.addedDescription",
                  "Product added successfully!",
                ),
            duration: 3000,
          }
        );
      });
    }
  };
  return (
    <div className={cn("absolute top-2 right-2", className)}>
      <div
        onClick={handleFavorite}
        className={`p-2.5 rounded-full hover:bg-shop_dark_green/80 hover:text-white hoverEffect ${existingProduct ? "bg-shop_dark_green/80 text-white" : "bg-product-bg"}`}
      >
        <Heart size={15} />
      </div>
    </div>
  );
};

export default ProductSideMenu;
