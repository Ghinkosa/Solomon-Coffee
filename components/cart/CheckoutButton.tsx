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
  packagingId?: string;
  packagingPrice?: number;
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
  const [actionType, setActionType] = useState<"checkout" | "order" | null>(null);

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    if (cart.some(item => item.product.stock === 0)) {
      toast.error("Some items are out of stock.");
      return;
    }

    setActionType("checkout");
    const cartValue = cart.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);
    
    trackCheckoutStarted({
      userId: user?.id,
      cartValue: cartValue + packagingPrice,
      itemCount: cart.length,
    });

    const addressParam = encodeURIComponent(JSON.stringify(selectedAddress));
    let checkoutUrl = `/checkout?address=${addressParam}`;
    if (packagingId) checkoutUrl += `&packagingId=${packagingId}`;
    if (packagingPrice) checkoutUrl += `&packagingPrice=${packagingPrice}`;
    
    window.location.href = checkoutUrl;
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    setActionType("order");
    
    // Summary calculation for immediate "Pay Later" placement
    const currentSubtotal = cart.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);
    const shipping = currentSubtotal > 100 ? 0 : 10;
    const tax = currentSubtotal * (parseFloat(process.env.NEXT_PUBLIC_TAX_AMOUNT || "0") || 0);
    const orderTotal = currentSubtotal + shipping + tax + packagingPrice;

    const result = await placeOrder(
      selectedAddress as any,
      PAYMENT_METHODS.CASH_ON_DELIVERY,
      currentSubtotal,
      shipping,
      tax,
      orderTotal,
      false,
      packagingId
    );

    if (result?.success && result.redirectTo) {
      setTimeout(() => {
        resetCart();
        window.location.href = result.redirectTo;
      }, 1500);
    }
    setActionType(null);
  };

  return (
    <div className="space-y-3">
      <Button 
        onClick={handleCheckout} 
        disabled={isPlacingOrder || !selectedAddress || cart.length === 0} 
        className="w-full h-12"
      >
        {actionType === "checkout" ? "Redirecting..." : "Proceed to Checkout"}
      </Button>
      <Button 
        onClick={handlePlaceOrder} 
        variant="outline" 
        disabled={isPlacingOrder || !selectedAddress || cart.length === 0} 
        className="w-full h-12"
      >
        {isPlacingOrder && actionType === "order" ? "Placing Order..." : "Place Order (Pay Later)"}
      </Button>
      {isPlacingOrder && actionType === "order" && <OrderPlacementOverlay step={orderStep} isCheckoutRedirect={false} />}
    </div>
  );
}