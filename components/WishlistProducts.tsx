"use client";

import useCartStore from "@/store";
import { useState } from "react";
import PriceFormatter from "./PriceFormatter";
import { Button } from "./ui/button";
import AddToCartButton from "./AddToCartButton";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import Container from "./Container";
import { Heart, X, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogDescription,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
  DialogHeader,
  DialogFooter,
} from "./ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { useLocalizedPath } from "@/hooks/useLocale";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";
import type { Dictionary } from "@/lib/dictionary-context";

const WishlistProducts = () => {
  const dictionary = useDictionary() as Dictionary;
  const wl = (dictionary.wishlist ?? {}) as Record<string, unknown>;
  const empty = wl.empty as Record<string, string> | undefined;
  const features = wl.features as Record<
    string,
    { title?: string; description?: string }
  > | undefined;
  const clearModal = wl.clearModal as Record<string, string> | undefined;
  const [visibleProducts, setVisibleProducts] = useState(8);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { favoriteProduct, removeFromFavorite, resetFavorite } = useCartStore();
  const toLocalizedPath = useLocalizedPath();

  const loadMore = () => {
    setVisibleProducts((prev) => Math.min(prev + 8, favoriteProduct.length));
  };

  const handleResetFavorite = () => {
    setShowDeleteModal(true);
  };

  const confirmResetFavorite = () => {
    resetFavorite();
    setShowDeleteModal(false);
    toast.success(String(wl.cleared ?? t(dictionary, "wishlist.cleared", "All products removed from wishlist")));
  };

  return (
    <Container className="my-10">
      {favoriteProduct.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favoriteProduct
              ?.slice(0, visibleProducts)
              .map((product: Product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col gap-4 relative group hover:shadow-md transition-all duration-200"
                >
                  <button
                    onClick={() => {
                      removeFromFavorite(product._id);
                      toast.success(String(wl.removed ?? t(dictionary, "wishlist.removed", "Product removed from wishlist")));
                    }}
                    className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 hover:bg-red-50 hover:text-red-600 transition-all duration-200 shadow-sm"
                    aria-label={String(wl.removeAria ?? t(dictionary, "wishlist.removeAria", "Remove from wishlist"))}
                  >
                    <X size={16} />
                  </button>

                  <Link
                    href={{
                      pathname: toLocalizedPath(`/product/${product?.slug?.current}`),
                      query: { id: product?._id },
                    }}
                    className="block rounded-lg overflow-hidden bg-gray-50"
                  >
                    <Image
                      src={
                        product?.images && product.images[0]
                          ? urlFor(product.images[0]).url()
                          : "/placeholder.jpg"
                      }
                      alt={product?.name ?? "Product"}
                      width={200}
                      height={200}
                      className={`w-full h-48 object-contain group-hover:scale-105 transition-transform duration-200 ${
                        product?.stock && product.stock === 0
                          ? "opacity-50"
                          : ""
                      }`}
                    />
                  </Link>

                  <div className="flex flex-col gap-2 flex-1">
                    <Link
                      href={{
                        pathname: toLocalizedPath(`/product/${product?.slug?.current}`),
                        query: { id: product?._id },
                      }}
                    >
                      <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight hover:text-shop_dark_green transition-colors">
                        {product?.name}
                      </h3>
                    </Link>

                    {product?.categories && product?.categories.length > 0 && (
                      <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                        {product.categories
                          .slice(0, 2)
                          .map((cat) => cat)
                          .join(", ")}
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          product?.stock && product.stock > 0
                            ? "text-green-700 bg-green-100"
                            : "text-red-700 bg-red-100"
                        }`}
                      >
                        {product?.stock && product.stock > 0
                          ? (String(wl.inStock ?? t(dictionary, "wishlist.inStock", "{count} in stock"))).replace(
                              "{count}",
                              String(product.stock),
                            )
                          : String(wl.outOfStock ?? t(dictionary, "wishlist.outOfStock", "Out of stock"))}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="flex flex-col">
                        <PriceFormatter
                          amount={product?.price}
                          className="text-lg font-bold text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="mt-2">
                      <AddToCartButton
                        product={product}
                        className="w-full h-10 text-sm font-semibold rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
          {visibleProducts < favoriteProduct.length && (
            <div className="mt-8 text-center">
              <Button
                onClick={loadMore}
                variant="outline"
                className="hover:bg-shop_dark_green hover:text-white hover:border-shop_dark_green font-semibold px-8 py-2"
              >
                {String(wl.loadMore ?? t(dictionary, "wishlist.loadMore", "Load More Products"))}
              </Button>
            </div>
          )}
          {visibleProducts > 8 && (
            <div className="mt-4 text-center">
              <Button
                onClick={() => setVisibleProducts(8)}
                variant="ghost"
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                {String(wl.showLess ?? t(dictionary, "wishlist.showLess", "Show Less"))}
              </Button>
            </div>
          )}
          {favoriteProduct.length > 0 && (
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={handleResetFavorite}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 font-semibold px-6 py-2"
              >
                {String(wl.clearWishlist ?? t(dictionary, "wishlist.clearWishlist", "Clear Wishlist"))}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center space-y-6 px-4 text-center">
          <div className="relative mb-4">
            <div className="absolute -top-1 -right-1 h-4 w-4 animate-ping rounded-full bg-red-100" />
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-400" />
            <Heart
              className="h-16 w-16 text-muted-foreground/60"
              strokeWidth={1}
            />
          </div>
          <div className="space-y-3 max-w-md">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              {empty?.title ?? "Your wishlist is empty"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {empty?.subtitle ?? "Save products you love for later"}
            </p>
            <p className="text-sm text-muted-foreground/80 leading-relaxed">
              {empty?.description ??
                "Add items to your wishlist by clicking the heart icon on any product. You can easily move them to your cart when you're ready to purchase."}
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mt-8">
            <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-gray-50">
              <Heart className="h-8 w-8 text-red-400" />
              <h3 className="font-semibold text-sm">
                {features?.saveFavorites?.title ?? "Save Favorites"}
              </h3>
              <p className="text-xs text-muted-foreground text-center">
                {features?.saveFavorites?.description ?? "Keep track of products you love"}
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-gray-50">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">🛍️</span>
              </div>
              <h3 className="font-semibold text-sm">
                {features?.easyShopping?.title ?? "Easy Shopping"}
              </h3>
              <p className="text-xs text-muted-foreground text-center">
                {features?.easyShopping?.description ?? "Quick add to cart from wishlist"}
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-gray-50">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">🔔</span>
              </div>
              <h3 className="font-semibold text-sm">
                {features?.stayUpdated?.title ?? "Stay Updated"}
              </h3>
              <p className="text-xs text-muted-foreground text-center">
                {features?.stayUpdated?.description ?? "Never miss deals on saved items"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button asChild size="lg" className="px-8">
              <Link href={toLocalizedPath("/shop")}>
                {empty?.browseProducts ?? "Browse Products"}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8">
              <Link href={toLocalizedPath("/category")}>
                {empty?.shopByCategory ?? "Shop by Category"}
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            className={cn(
              "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg"
            )}
          >
            <DialogHeader className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border-4 border-red-100">
                <AlertTriangle className="h-8 w-8 text-red-600 animate-pulse" />
              </div>
              <div className="space-y-2">
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {clearModal?.title ?? "Clear Wishlist"}
                </DialogTitle>
                <DialogDescription className="text-gray-600 leading-relaxed">
                  {(clearModal?.description ??
                    "You're about to remove {count} products from your wishlist. This action cannot be undone.")
                    .replace("{count}", String(favoriteProduct.length))}
                </DialogDescription>
              </div>
            </DialogHeader>
            <DialogFooter className="gap-3 sm:gap-2 pt-6">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="w-full sm:w-auto border-gray-300 hover:bg-gray-50 font-medium"
              >
                {clearModal?.keepProducts ?? "Keep Products"}
              </Button>
              <Button
                variant="destructive"
                onClick={confirmResetFavorite}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-500 font-semibold shadow-lg hover:shadow-red-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {clearModal?.confirm ?? "Clear All Products"}
              </Button>
            </DialogFooter>
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">{t(dictionary, "common.close", "Close")}</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </Container>
  );
};

export default WishlistProducts;
