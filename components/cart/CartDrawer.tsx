"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, CheckCircle2, ShoppingBag } from "lucide-react";
import useCartStore, {
  CartItem,
  getCartItemKey,
  type GrindOption,
} from "@/store";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import PriceFormatter from "@/components/PriceFormatter";
import QuantityButtons from "@/components/QuantityButtons";
import { useLocalizedPath } from "@/hooks/useLocale";
import { image } from "@/sanity/image";
import { cn } from "@/lib/utils";
import {
  buildCheckoutPricingItems,
  calculateCheckoutTotals,
} from "@/lib/checkout-pricing";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";
import { getGrindLabel } from "@/lib/i18n-nav";
import { useUserData } from "@/contexts/UserDataContext";

const FREE_SHIPPING_THRESHOLD = 100;

function getItemUnitPrice(item: CartItem): number {
  return item.selectedWeight?.price ?? item.product.price ?? 0;
}

function getItemLineTotal(item: CartItem): number {
  const unitPrice = getItemUnitPrice(item);
  const packagingPrice = item.selectedPackaging?.price ?? 0;
  return (unitPrice + packagingPrice) * item.quantity;
}

function CartDrawerItem({
  item,
  highlighted,
  dictionary,
}: {
  item: CartItem;
  highlighted: boolean;
  dictionary: ReturnType<typeof useDictionary>;
}) {
  const toLocalizedPath = useLocalizedPath();
  const grindLabel = item.selectedGrind
    ? getGrindLabel(
        dictionary,
        item.selectedGrind.grindType ?? "",
      )
    : null;
  const lineTotal = getItemLineTotal(item);
  const productImage = item.product.images?.[0];

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border p-3 transition-colors",
        highlighted
          ? "border-shop_light_green/50 bg-shop_light_bg/80"
          : "border-stone-200 bg-white",
      )}
    >
      <Link
        href={toLocalizedPath(`/product/${item.product.slug?.current}`)}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-shop_light_bg"
      >
        {productImage ? (
          <img
            src={image(productImage).width(160).height(160).url()}
            alt={item.product.name || "Product"}
            className="h-full w-full object-contain p-1"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-300">
            <ShoppingBag className="h-6 w-6" />
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="space-y-1">
          <Link
            href={toLocalizedPath(`/product/${item.product.slug?.current}`)}
            className="line-clamp-2 text-sm font-semibold text-shop_dark_green hover:text-shop_light_green"
          >
            {item.product.name}
          </Link>

          <div className="space-y-0.5 text-xs text-muted-foreground">
            {item.selectedWeight && (
              <p>
                {t(dictionary, "cart.options.weight", "Weight")}:{" "}
                {item.selectedWeight.weight}
              </p>
            )}
            {grindLabel && (
              <p>
                {t(dictionary, "cart.options.grind", "Grind")}: {grindLabel}
              </p>
            )}
            {item.selectedPackaging && (
              <p>
                {t(dictionary, "cart.options.packaging", "Packaging")}:{" "}
                {item.selectedPackaging.title}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <QuantityButtons
            product={item.product}
            selectedWeight={item.selectedWeight}
            selectedGrind={item.selectedGrind}
            selectedPackaging={item.selectedPackaging}
          />
          <PriceFormatter
            amount={lineTotal}
            className="text-sm font-semibold text-shop_dark_green"
          />
        </div>
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const dictionary = useDictionary();
  const pathname = usePathname();
  const toLocalizedPath = useLocalizedPath();
  const {
    items,
    isCartDrawerOpen,
    cartDrawerHighlightKey,
    closeCartDrawer,
  } = useCartStore();
  const { accountDiscountRate, accountDiscountType } = useUserData();

  const checkoutTotals = useMemo(
    () =>
      calculateCheckoutTotals({
        items: buildCheckoutPricingItems(
          items.map((item) => ({
            product: item.product,
            quantity: item.quantity,
            unitPrice: getItemUnitPrice(item),
            packagingPrice: item.selectedPackaging?.price ?? 0,
          })),
        ),
        businessDiscountRate: accountDiscountRate,
      }),
    [items, accountDiscountRate],
  );

  const itemQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalBeforeShipping =
    checkoutTotals.subtotal -
    checkoutTotals.productDiscount -
    checkoutTotals.businessDiscount +
    checkoutTotals.packagingFee;
  const amountToFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotalBeforeShipping,
  );

  useEffect(() => {
    closeCartDrawer();
  }, [pathname, closeCartDrawer]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeCartDrawer();
    }
  };

  const drawer = dictionary.cart as Record<string, unknown> | undefined;
  const drawerCopy = (drawer?.drawer ?? {}) as Record<string, string>;

  return (
    <Sheet open={isCartDrawerOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 border-l border-stone-200 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-stone-100 px-5 py-4 text-left">
          <SheetTitle className="flex items-center gap-2 text-lg text-shop_dark_green">
            <ShoppingBag className="h-5 w-5" />
            {drawerCopy.title ?? "Your cart"}
            {itemQuantity > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({itemQuantity}{" "}
                {itemQuantity === 1
                  ? (drawerCopy.item ?? "item")
                  : (drawerCopy.items ?? "items")}
                )
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {drawerCopy.description ??
              "Review items in your cart and proceed to checkout"}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-shop_light_bg">
              <ShoppingBag className="h-8 w-8 text-shop_light_green" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-shop_dark_green">
                {drawerCopy.emptyTitle ?? "Your cart is empty"}
              </p>
              <p className="text-sm text-muted-foreground">
                {drawerCopy.emptyDescription ??
                  "Discover our coffees and add your favorites here."}
              </p>
            </div>
            <Button
              asChild
              className="bg-shop_dark_green hover:bg-shop_light_green"
            >
              <Link href={toLocalizedPath("/shop")} onClick={closeCartDrawer}>
                {drawerCopy.browseShop ?? "Browse shop"}
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {cartDrawerHighlightKey && (
              <div className="flex items-center gap-2 border-b border-shop_light_green/20 bg-shop_light_bg/70 px-5 py-3 text-sm text-shop_dark_green">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-shop_light_green" />
                <span>{drawerCopy.addedToCart ?? "Added to your cart"}</span>
              </div>
            )}

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {items.map((item) => (
                <CartDrawerItem
                  key={getCartItemKey(item)}
                  item={item}
                  highlighted={getCartItemKey(item) === cartDrawerHighlightKey}
                  dictionary={dictionary}
                />
              ))}
            </div>

            <div className="mt-auto border-t border-stone-100 bg-stone-50/80 px-5 py-4">
              {amountToFreeShipping > 0 ? (
                <p className="mb-3 text-center text-xs text-muted-foreground">
                  {(drawerCopy.freeShippingAdd ?? "Add {amount} more for free shipping")
                    .split("{amount}")
                    .map((part, i, arr) =>
                      i < arr.length - 1 ? (
                        <span key={i}>
                          {part}
                          <span className="font-semibold text-shop_dark_green">
                            <PriceFormatter amount={amountToFreeShipping} />
                          </span>
                        </span>
                      ) : (
                        part
                      ),
                    )}
                </p>
              ) : (
                <p className="mb-3 text-center text-xs font-medium text-shop_light_green">
                  {drawerCopy.freeShippingQualified ??
                    "You qualify for free shipping"}
                </p>
              )}

              <div className="mb-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {drawerCopy.subtotal ?? "Subtotal"}
                  </span>
                  <PriceFormatter
                    amount={
                      checkoutTotals.subtotal + checkoutTotals.packagingFee
                    }
                  />
                </div>
                {checkoutTotals.productDiscount > 0 && (
                  <div className="flex items-center justify-between text-shop_light_green">
                    <span>{drawerCopy.discount ?? "Discount"}</span>
                    <span>
                      -<PriceFormatter amount={checkoutTotals.productDiscount} />
                    </span>
                  </div>
                )}
                {checkoutTotals.businessDiscount > 0 && (
                  <div className="flex items-center justify-between text-shop_light_green">
                    <span>
                      {accountDiscountType === "premium"
                        ? t(
                            dictionary,
                            "checkout.premiumDiscount",
                            "Premium Member Discount (5%)",
                          )
                        : t(
                            dictionary,
                            "checkout.businessDiscount",
                            "Business Account Discount (2%)",
                          )}
                    </span>
                    <span>
                      -<PriceFormatter amount={checkoutTotals.businessDiscount} />
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between font-semibold text-shop_dark_green">
                  <span>{drawerCopy.estimatedTotal ?? "Estimated total"}</span>
                  <PriceFormatter amount={checkoutTotals.total} />
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  asChild
                  className="h-11 w-full bg-shop_dark_green text-base font-semibold hover:bg-shop_light_green"
                >
                  <Link
                    href={toLocalizedPath("/checkout")}
                    onClick={closeCartDrawer}
                  >
                    {drawerCopy.checkout ?? "Checkout"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="h-10 border-2 border-shop_dark_green/20 bg-white font-medium text-shop_dark_green shadow-none transition-all duration-200 hover:border-shop_dark_green hover:bg-shop_dark_green hover:text-shop_light_pink"
                    onClick={closeCartDrawer}
                  >
                    {drawerCopy.continueShopping ?? "Continue shopping"}
                  </Button>
                  <Button
                    asChild
                    className="h-10 border-2 border-shop_dark_green/20 bg-white font-medium text-shop_dark_green shadow-none transition-all duration-200 hover:border-shop_dark_green hover:bg-shop_dark_green hover:text-shop_light_pink"
                  >
                    <Link
                      href={toLocalizedPath("/cart")}
                      onClick={closeCartDrawer}
                    >
                      {drawerCopy.viewCart ?? "View cart"}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
