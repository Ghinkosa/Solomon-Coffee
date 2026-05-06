"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Package, Box } from "lucide-react";
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
  packagingPrice?: number;
}

export function CheckoutButton({ 
  cart, 
  selectedAddress, 
  packagingPrice = 0 
}: CheckoutButtonProps) {
  const { user } = useUser();
  const { resetCart, setOrderPlacementState } = useCartStore();
  const { placeOrder, isPlacingOrder, orderStep } = useOrderPlacement({
    user: user ? { emailAddresses: user.emailAddresses } : null,
  });
  const [actionType, setActionType] = useState<"checkout" | "order" | null>(null);

  // Log when component mounts and props change
  useEffect(() => {
    console.log("✅ CheckoutButton received packagingPrice:", packagingPrice);
    console.log("✅ CheckoutButton cart items:", cart.length);
  }, [packagingPrice, cart.length]);

  // Calculate cart totals
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
  const finalTotal = currentSubtotal + shipping + tax + packagingPrice;

  const handleCheckout = async () => {
    console.log("🚀 handleCheckout clicked - packagingPrice:", packagingPrice);
    
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
      cartValue: cartValue + packagingPrice,
      itemCount: cart.length,
    });

    const addressParam = encodeURIComponent(JSON.stringify(selectedAddress));
    
    // Build URL with packaging price
    const checkoutUrl = `/checkout?address=${addressParam}&packagingPrice=${packagingPrice}`;
    
    console.log("🔗 Redirecting to checkout URL:", checkoutUrl);
    
    // Use window.location.href for redirect
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

    const result = await placeOrder(
      selectedAddress,
      PAYMENT_METHODS.CASH_ON_DELIVERY,
      currentSubtotal,
      shipping,
      tax,
      finalTotal,
      false,
      undefined
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
        {/* Packaging Summary Display */}
        {packagingPrice > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Packaging Fee</span>
              </div>
              <span className="text-sm font-semibold text-blue-700">
                ${packagingPrice.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Premium packaging selected for your items
            </p>
          </div>
        )}

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
                Proceed to Checkout {packagingPrice > 0 ? `(+$${packagingPrice.toFixed(2)})` : ""}
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
                Place Order (Pay Later) {packagingPrice > 0 ? `(+$${packagingPrice.toFixed(2)})` : ""}
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