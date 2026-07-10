"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Package, Box, ShoppingBag } from "lucide-react";
import useCartStore, { CartItem } from "@/store";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { useOrderPlacement } from "@/hooks/useOrderPlacement";
import { PAYMENT_METHODS } from "@/lib/orderStatus";
import { trackCheckoutStarted } from "@/lib/analytics";
import { OrderPlacementOverlay } from "./OrderPlacementSkeleton";
import { useRouter } from "next/navigation";
import { useLocalizedPath } from "@/hooks/useLocale";
import {
  buildCheckoutPricingItems,
  calculateCheckoutTotals,
} from "@/lib/checkout-pricing";

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

// Helper to get current price based on selected weight
const getItemCurrentPrice = (item: CartItem): number => {
  if (item.selectedWeight && item.selectedWeight.price) {
    return item.selectedWeight.price;
  }
  const defaultWeight = (item.product as any).weightOptions?.find((w: any) => w.isDefault);
  return defaultWeight?.price || item.product.price || 0;
};

// Helper to get packaging fee for an item
const getItemPackagingFee = (item: CartItem): number => {
  return item.selectedPackaging?.price || 0;
};

export function CheckoutButton({ 
  cart, 
  selectedAddress,
  isGuestCheckout = false,
}: CheckoutButtonProps) {
  const { user } = useUser();
  const router = useRouter();
  const toLocalizedPath = useLocalizedPath();
  const { setOrderPlacementState } = useCartStore();
  const { placeOrder, isPlacingOrder, orderStep } = useOrderPlacement({
    user: user ? { emailAddresses: user.emailAddresses } : null,
  });
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [actionType, setActionType] = useState<"checkout" | "order" | null>(null);

  useEffect(() => {
    console.log("✅ CheckoutButton - cart items:", cart.length);
  }, [cart.length]);

  // Calculate cart totals with shared checkout pricing
  const checkoutTotals = calculateCheckoutTotals({
    items: buildCheckoutPricingItems(
      cart.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        unitPrice: getItemCurrentPrice(item),
        packagingPrice: getItemPackagingFee(item),
      })),
    ),
  });

  const grossSubtotal = checkoutTotals.subtotal;
  const totalPackagingFee = checkoutTotals.packagingFee;
  const shipping = checkoutTotals.shipping;
  const tax = checkoutTotals.tax;
  const finalTotal = checkoutTotals.total;

  const hasOutOfStockItems = cart.some((item) => {
    const selectedWeightStock = item.selectedWeight?.stock;
    const productStock = item.product.stock;
    return (selectedWeightStock !== undefined ? selectedWeightStock : productStock) === 0;
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
    const selectionsParam = encodeURIComponent(JSON.stringify(selectionsDataForUrl));

    return `${toLocalizedPath("/checkout")}?${addressParam}${intentParam}selections=${selectionsParam}`;
  };

  const redirectToCheckout = async () => {
    const checkoutUrl = buildCheckoutUrl();

    try {
      await router.push(checkoutUrl);
    } catch (error) {
      console.error("Redirect error:", error);
      window.location.href = checkoutUrl;
    }
  };

  const handleProceedToCheckout = async (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("🚀 PROCEED TO CHECKOUT clicked");
    
    if (!isGuestCheckout && !selectedAddress) {
      toast.error("Please select a shipping address");
      setIsRedirecting(false);
      return;
    }

    const outOfStockItems = cart.filter((item) => {
      const selectedWeightStock = item.selectedWeight?.stock;
      const productStock = item.product.stock;
      return (selectedWeightStock !== undefined ? selectedWeightStock : productStock) === 0;
    });
    
    if (outOfStockItems.length > 0) {
      toast.error("Some items are out of stock. Please remove them to continue.");
      setIsRedirecting(false);
      return;
    }

    setIsRedirecting(true);
    setActionType("checkout");

    const cartValue = cart.reduce(
      (sum, item) => sum + (getItemCurrentPrice(item) + getItemPackagingFee(item)) * item.quantity,
      0
    );
    
    trackCheckoutStarted({
      userId: user?.id,
      cartValue: cartValue,
      itemCount: cart.length,
    });

    await redirectToCheckout();
  };

  const handlePlaceOrder = async () => {
    console.log("🚀 PLACE ORDER (Pay Later) clicked");

    if (hasOutOfStockItems) {
      toast.error("Some items are out of stock. Please remove them to continue.");
      return;
    }

    if (isGuestCheckout) {
      setIsRedirecting(true);
      setActionType("checkout");
      const checkoutUrl = buildCheckoutUrl("cod");

      try {
        await router.push(checkoutUrl);
      } catch (error) {
        console.error("Redirect error:", error);
        window.location.href = checkoutUrl;
      }
      return;
    }
    
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    setActionType("order");

    const selectionsData = cart.map((item) => ({
      productId: item.product._id,
      weight: item.selectedWeight || null,
      grind: item.selectedGrind || null,
      packaging: item.selectedPackaging || null,
    }));

    const checkoutTotalsForOrder = calculateCheckoutTotals({
      items: buildCheckoutPricingItems(
        cart.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          unitPrice: getItemCurrentPrice(item),
          packagingPrice: getItemPackagingFee(item),
        })),
      ),
    });

    const result = await placeOrder(
      selectedAddress,
      PAYMENT_METHODS.CASH_ON_DELIVERY,
      checkoutTotalsForOrder.subtotal - checkoutTotalsForOrder.productDiscount,
      checkoutTotalsForOrder.packagingFee,
      checkoutTotalsForOrder.shipping,
      checkoutTotalsForOrder.tax,
      checkoutTotalsForOrder.total,
      false,                  // redirectToCheckout
      selectionsData          // selectionsData with weight, grind, packaging
    );

    if (result?.success && result.redirectTo) {
      console.log("✅ Order placed successfully, redirecting to:", result.redirectTo);
      if (result.orderNumber) {
        sessionStorage.setItem("completedOrder", result.orderNumber);
      }
      setTimeout(() => {
        setOrderPlacementState(false, "validating");
        window.location.href = result.redirectTo;
      }, 1500);
    } else {
      console.error("❌ Order placement failed");
      setOrderPlacementState(false, "validating");
      setActionType(null);
    }
  };

  return (
    <>
      {isPlacingOrder && actionType === "order" && (
        <OrderPlacementOverlay step={orderStep} isCheckoutRedirect={false} />
      )}

      <div className="space-y-4">
        {totalPackagingFee > 0 && (
          <div className="p-3 bg-shop_light_bg border border-shop_orange/25 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-shop_light_green" />
                <span className="text-sm font-medium text-shop_dark_green">Packaging Fee</span>
              </div>
              <span className="text-sm font-semibold text-shop_light_green">
                +${totalPackagingFee.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-light-color mt-1">
              Premium packaging selected for your items
            </p>
          </div>
        )}

        {hasOutOfStockItems && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">
              Some items are out of stock. Please remove them to continue.
            </p>
          </div>
        )}

        {!isGuestCheckout && !selectedAddress && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
            <p className="text-sm text-orange-700">
              Please select a shipping address to continue
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleProceedToCheckout}
            disabled={
              isRedirecting ||
              isPlacingOrder ||
              hasOutOfStockItems ||
              (!isGuestCheckout && !selectedAddress) ||
              cart.length === 0
            }
            className="w-full h-12 text-lg font-semibold bg-shop_dark_green hover:bg-shop_light_green text-white shadow-md hover:shadow-shop_orange/20"
            size="lg"
          >
            {isRedirecting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Redirecting to Checkout...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Proceed to Checkout
                {totalPackagingFee > 0 && ` (+$${totalPackagingFee.toFixed(2)})`}
              </div>
            )}
          </Button>

          <Button
            onClick={handlePlaceOrder}
            disabled={
              isRedirecting ||
              isPlacingOrder ||
              hasOutOfStockItems ||
              !addressReady ||
              cart.length === 0
            }
            variant="outline"
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            {isPlacingOrder && actionType === "order" ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                Placing Order...
              </div>
            ) : isRedirecting && actionType === "checkout" ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                Redirecting to Checkout...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Place Order (Pay Later)
                {totalPackagingFee > 0 && ` (+$${totalPackagingFee.toFixed(2)})`}
              </div>
            )}
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p className="text-green-600">✓ Recommended: Use "Proceed to Checkout" for secure payment</p>
          <p className="text-muted-foreground mt-1">
            {isGuestCheckout
              ? '"Place Order (Pay Later)" takes you to checkout to complete shipping and pay on delivery'
              : '"Place Order (Pay Later)" places order directly with Cash on Delivery'}
          </p>
        </div>
      </div>
    </>
  );
}