"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Package } from "lucide-react";
import useCartStore, { CartItem } from "@/store";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { useOrderPlacement } from "@/hooks/useOrderPlacement";
import { PAYMENT_METHODS } from "@/lib/orderStatus";
import { trackCheckoutStarted } from "@/lib/analytics";

import { OrderPlacementOverlay } from "./OrderPlacementSkeleton";

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
  packagingId?: string;    // Added packaging ID
  packagingPrice?: number; // Added packaging price
}

export function CheckoutButton({ 
  cart, 
  selectedAddress, 
  packagingId, 
  packagingPrice = 0 
}: CheckoutButtonProps) {
  const { user } = useUser();
  const { resetCart, setOrderPlacementState } = useCartStore();
  const { placeOrder, isPlacingOrder, orderStep } = useOrderPlacement({
    user: user ? { emailAddresses: user.emailAddresses } : null,
  });
  const [actionType, setActionType] = useState<"checkout" | "order" | null>(
    null
  );

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    const outOfStockItems = cart.filter((item) => item.product.stock === 0);
    if (outOfStockItems.length > 0) {
      toast.error("Some items are out of stock. Please remove them to continue.");
      return;
    }

    setActionType("checkout");

    const cartValue = cart.reduce(
      (sum, item) => sum + (item.product.price || 0) * item.quantity,
      0
    );
    
    trackCheckoutStarted({
      userId: user?.id,
      cartValue: cartValue + packagingPrice, // Include packaging in tracking
      itemCount: cart.length,
    });

    const addressParam = encodeURIComponent(JSON.stringify(selectedAddress));
    
    // Construct URL with packaging info if available
    let checkoutUrl = `/checkout?address=${addressParam}`;
    if (packagingId) {
      checkoutUrl += `&packagingId=${packagingId}`;
    }
    
    window.location.href = checkoutUrl;
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    const outOfStockItems = cart.filter((item) => item.product.stock === 0);
    if (outOfStockItems.length > 0) {
      toast.error("Some items are out of stock. Please remove them to continue.");
      return;
    }

    setActionType("order");

    const grossSubtotal = cart.reduce((sum, item) => {
      const currentPrice = item.product.price || 0;
      const discount = item.product.discount || 0;
      const discountAmount = (discount * currentPrice) / 100;
      const grossPrice = currentPrice + discountAmount;
      return sum + grossPrice * item.quantity;
    }, 0);

    const totalDiscount = cart.reduce((sum, item) => {
      const currentPrice = item.product.price || 0;
      const discount = item.product.discount || 0;
      const discountAmount = (discount * currentPrice) / 100;
      return sum + discountAmount * item.quantity;
    }, 0);

    const currentSubtotal = grossSubtotal - totalDiscount;
    const shipping = currentSubtotal > 100 ? 0 : 10;
    const tax = currentSubtotal * (parseFloat(process.env.NEXT_PUBLIC_TAX_AMOUNT || "0") || 0);
    
    // Final total including packaging
    const orderTotal = currentSubtotal + shipping + tax + packagingPrice;

    const result = await placeOrder(
      selectedAddress,
      PAYMENT_METHODS.CASH_ON_DELIVERY,
      grossSubtotal,
      shipping,
      tax,
      orderTotal,
      false,
      packagingId // Ensure your placeOrder hook is updated to accept this if needed
    );

    if (result?.success && result.redirectTo) {
      setTimeout(() => {
        resetCart();
        setOrderPlacementState(false, "validating");
        window.location.href = result.redirectTo;
      }, 1500);
    } else {
      setOrderPlacementState(false, "validating");
    }

    setActionType(null);
  };

  const hasOutOfStockItems = cart.some((item) => item.product.stock === 0);

  return (
    <>
      {isPlacingOrder && actionType === "order" && (
        <OrderPlacementOverlay step={orderStep} isCheckoutRedirect={false} />
      )}

      <div className="space-y-4">
        {hasOutOfStockItems && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">
              Some items are out of stock and need to be removed
            </p>
          </div>
        )}

        {!selectedAddress && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
            <p className="text-sm text-orange-700">
              Please select a shipping address to continue
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleCheckout}
            disabled={
              isPlacingOrder ||
              actionType === "checkout" ||
              hasOutOfStockItems ||
              !selectedAddress ||
              cart.length === 0
            }
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            {actionType === "checkout" ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Redirecting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Proceed to Checkout
              </div>
            )}
          </Button>

          <Button
            onClick={handlePlaceOrder}
            disabled={
              isPlacingOrder ||
              hasOutOfStockItems ||
              !selectedAddress ||
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
            ) : (
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Place Order (Pay Later)
              </div>
            )}
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>🔒 Secure checkout powered by Stripe</p>
          <p>Your payment information is encrypted and secure</p>
        </div>
      </div>
    </>
  );
}