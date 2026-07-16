"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Package, ShoppingBag, Check } from "lucide-react";
import { CartItem } from "@/store";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { trackCheckoutStarted } from "@/lib/analytics";
import { useRouter } from "next/navigation";
import { useLocalizedPath } from "@/hooks/useLocale";
import {
  buildCheckoutPricingItems,
  calculateCheckoutTotals,
} from "@/lib/checkout-pricing";
import { useDictionary } from "@/lib/dictionary-context";
import type { Dictionary } from "@/lib/dictionary-context";
import { useUserData } from "@/contexts/UserDataContext";

interface Address {
  _id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  default: boolean;
  createdAt: string;
}

interface CheckoutButtonProps {
  cart: CartItem[];
  selectedAddress: Address | null;
  isGuestCheckout?: boolean;
}

const getItemCurrentPrice = (item: CartItem): number => {
  if (item.selectedWeight && item.selectedWeight.price) {
    return item.selectedWeight.price;
  }
  const defaultWeight = (item.product as any).weightOptions?.find(
    (w: any) => w.isDefault,
  );
  return defaultWeight?.price || item.product.price || 0;
};

const getItemPackagingFee = (item: CartItem): number => {
  return item.selectedPackaging?.price || 0;
};

export function CheckoutButton({
  cart,
  selectedAddress,
  isGuestCheckout = false,
}: CheckoutButtonProps) {
  const dictionary = useDictionary() as Dictionary;
  const btn = (dictionary.cart as Record<string, unknown>)?.checkoutButton as
    | Record<string, string>
    | undefined;
  const { user } = useUser();
  const router = useRouter();
  const toLocalizedPath = useLocalizedPath();
  const { accountDiscountRate } = useUserData();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [actionType, setActionType] = useState<"checkout" | "cod" | null>(null);

  const checkoutTotals = calculateCheckoutTotals({
    items: buildCheckoutPricingItems(
      cart.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        unitPrice: getItemCurrentPrice(item),
        packagingPrice: getItemPackagingFee(item),
      })),
    ),
    businessDiscountRate: accountDiscountRate,
    taxRate: 0,
    taxShipping: false,
  });

  const totalPackagingFee = checkoutTotals.packagingFee;

  const hasOutOfStockItems = cart.some((item) => {
    const selectedWeightStock = item.selectedWeight?.stock;
    const productStock = item.product.stock;
    const available =
      selectedWeightStock !== undefined ? selectedWeightStock : productStock;
    if (available === undefined || available === null) return false;
    return available < item.quantity;
  });

  const addressReady = isGuestCheckout || Boolean(selectedAddress);

  const buildCheckoutUrl = (intent?: "cod") => {
    const selectionsDataForUrl = cart.map((item) => ({
      productId: item.product._id,
      weight: item.selectedWeight || null,
      grind: item.selectedGrind || null,
      packaging: item.selectedPackaging || null,
    }));

    const addressParam = selectedAddress
      ? `address=${encodeURIComponent(JSON.stringify(selectedAddress))}&`
      : "";
    const intentParam = intent ? `intent=${intent}&` : "";
    const selectionsParam = encodeURIComponent(
      JSON.stringify(selectionsDataForUrl),
    );

    return `${toLocalizedPath("/checkout")}?${addressParam}${intentParam}selections=${selectionsParam}`;
  };

  const redirectToCheckout = async (intent?: "cod") => {
    const checkoutUrl = buildCheckoutUrl(intent);

    try {
      await router.push(checkoutUrl);
    } catch (error) {
      console.error("Redirect error:", error);
      window.location.href = checkoutUrl;
    }
  };

  const handleProceedToCheckout = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isGuestCheckout && !selectedAddress) {
      toast.error(
        btn?.selectAddressToast ?? "Please select a shipping address",
      );
      setIsRedirecting(false);
      return;
    }

    const outOfStockItems = cart.filter((item) => {
      const selectedWeightStock = item.selectedWeight?.stock;
      const productStock = item.product.stock;
      const available =
        selectedWeightStock !== undefined ? selectedWeightStock : productStock;
      if (available === undefined || available === null) return false;
      return available < item.quantity;
    });

    if (outOfStockItems.length > 0) {
      toast.error(
        btn?.outOfStock ??
          "Some items are out of stock. Please remove them to continue.",
      );
      setIsRedirecting(false);
      return;
    }

    setIsRedirecting(true);
    setActionType("checkout");

    const cartValue = cart.reduce(
      (sum, item) =>
        sum +
        (getItemCurrentPrice(item) + getItemPackagingFee(item)) * item.quantity,
      0,
    );

    trackCheckoutStarted({
      userId: user?.id,
      cartValue: cartValue,
      itemCount: cart.length,
    });

    await redirectToCheckout();
  };

  const handlePlaceOrder = async () => {
    if (hasOutOfStockItems) {
      toast.error(
        btn?.outOfStock ??
          "Some items are out of stock. Please remove them to continue.",
      );
      return;
    }

    if (!isGuestCheckout && !selectedAddress) {
      toast.error(
        btn?.selectAddressToast ?? "Please select a shipping address",
      );
      return;
    }

    // Destination tax is resolved on checkout from admin state rates.
    setIsRedirecting(true);
    setActionType("cod");
    await redirectToCheckout("cod");
  };

  return (
    <div className="space-y-4">
      {totalPackagingFee > 0 && (
        <div className="p-3 bg-shop_light_bg border border-shop_orange/25 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-shop_light_green" />
              <span className="text-sm font-medium text-shop_dark_green">
                {btn?.packagingSelected ?? "Packaging Selected"}
              </span>
            </div>
            <span className="text-sm font-semibold text-shop_dark_green">
              +${totalPackagingFee.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-light-color mt-1">
            {btn?.packagingHint ??
              "Premium packaging selected for your items"}
          </p>
        </div>
      )}

      {hasOutOfStockItems && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">
            {btn?.outOfStock ??
              "Some items are out of stock. Please remove them to continue."}
          </p>
        </div>
      )}

      {!isGuestCheckout && !selectedAddress && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
          <p className="text-sm text-orange-700">
            {btn?.selectAddress ??
              "Please select a shipping address to continue"}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <Button
          onClick={handleProceedToCheckout}
          disabled={
            isRedirecting ||
            hasOutOfStockItems ||
            (!isGuestCheckout && !selectedAddress) ||
            cart.length === 0
          }
          className="w-full h-12 text-lg font-semibold bg-shop_dark_green hover:bg-shop_light_green text-white shadow-md hover:shadow-shop_orange/20"
          size="lg"
        >
          {isRedirecting && actionType === "checkout" ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {btn?.redirecting ?? "Redirecting to Checkout..."}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              {btn?.proceedToCheckout ?? "Proceed to Checkout"}
              {totalPackagingFee > 0 && ` (+$${totalPackagingFee.toFixed(2)})`}
            </div>
          )}
        </Button>

        <Button
          onClick={handlePlaceOrder}
          disabled={
            isRedirecting ||
            hasOutOfStockItems ||
            !addressReady ||
            cart.length === 0
          }
          variant="outline"
          className="w-full h-12 text-lg font-semibold"
          size="lg"
        >
          {isRedirecting && actionType === "cod" ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              {btn?.redirecting ?? "Redirecting to Checkout..."}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {btn?.placeOrder ?? "Place Order (Pay Later)"}
              {totalPackagingFee > 0 && ` (+$${totalPackagingFee.toFixed(2)})`}
            </div>
          )}
        </Button>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        <p className="text-shop_light_green inline-flex items-center justify-center gap-1.5">
          <Check className="h-3.5 w-3.5" />
          {btn?.recommended ??
            'Recommended: Use "Proceed to Checkout" for secure payment'}
        </p>
        <p className="text-muted-foreground mt-1">
          {btn?.signedCodHint ??
            '"Place Order (Pay Later)" continues to checkout with cash on delivery and destination tax'}
        </p>
      </div>
    </div>
  );
}
