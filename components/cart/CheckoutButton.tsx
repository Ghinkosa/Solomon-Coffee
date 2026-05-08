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
}: CheckoutButtonProps) {
  const { user } = useUser();
  const router = useRouter();
  const { resetCart, setOrderPlacementState } = useCartStore();
  const { placeOrder, isPlacingOrder, orderStep } = useOrderPlacement({
    user: user ? { emailAddresses: user.emailAddresses } : null,
  });
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [actionType, setActionType] = useState<"checkout" | "order" | null>(null);

  useEffect(() => {
    console.log("✅ CheckoutButton - cart items:", cart.length);
  }, [cart.length]);

  // Calculate cart totals with weight-based pricing and packaging fees
  const grossSubtotal = cart.reduce((sum, item) => {
    const itemPrice = getItemCurrentPrice(item);
    return sum + itemPrice * item.quantity;
  }, 0);

  const totalPackagingFee = cart.reduce((sum, item) => {
    return sum + getItemPackagingFee(item) * item.quantity;
  }, 0);

  const subtotalWithPackaging = grossSubtotal + totalPackagingFee;
  const shipping = subtotalWithPackaging > 100 ? 0 : 10;
  const tax = subtotalWithPackaging * (parseFloat(process.env.NEXT_PUBLIC_TAX_AMOUNT || "0") || 0);
  const finalTotal = subtotalWithPackaging + shipping + tax;

  const handleProceedToCheckout = async (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("🚀 PROCEED TO CHECKOUT clicked");
    
    if (!selectedAddress) {
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

    // Prepare weight, grind, and packaging data for URL
    const selectionsDataForUrl = cart.map(item => ({
      productId: item.product._id,
      weight: item.selectedWeight || null,
      grind: item.selectedGrind || null,
      packaging: item.selectedPackaging || null,
    }));
    
    const addressParam = encodeURIComponent(JSON.stringify(selectedAddress));
    const selectionsParam = encodeURIComponent(JSON.stringify(selectionsDataForUrl));
    
    const checkoutUrl = `/checkout?address=${addressParam}&selections=${selectionsParam}`;
    
    console.log("🔗 REDIRECTING TO CHECKOUT:", checkoutUrl);
    
    try {
      await router.push(checkoutUrl);
    } catch (error) {
      console.error("Redirect error:", error);
      window.location.href = checkoutUrl;
    }
  };

  const handlePlaceOrder = async () => {
    console.log("🚀 PLACE ORDER (Pay Later) clicked");
    
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    const outOfStockItems = cart.filter((item) => {
      const selectedWeightStock = item.selectedWeight?.stock;
      const productStock = item.product.stock;
      return (selectedWeightStock !== undefined ? selectedWeightStock : productStock) === 0;
    });
    
    if (outOfStockItems.length > 0) {
      toast.error("Some items are out of stock. Please remove them to continue.");
      return;
    }

    setActionType("order");

    // Prepare weight, grind, and packaging data for each product
    const selectionsData = cart.map(item => ({
      productId: item.product._id,
      weight: item.selectedWeight || null,
      grind: item.selectedGrind || null,
      packaging: item.selectedPackaging || null,
    }));

// In CheckoutButton.tsx, update the placeOrder call:

  const result = await placeOrder(
    selectedAddress,
    PAYMENT_METHODS.CASH_ON_DELIVERY,
    grossSubtotal,      // subtotal
    totalPackagingFee,  // packagingFee
    shipping,           // shipping
    tax,                // tax
    finalTotal,         // total
    false,              // redirectToCheckout
    selectionsData      // selectionsData
  );

    if (result?.success && result.redirectTo) {
      console.log("✅ Order placed successfully, redirecting to:", result.redirectTo);
      setTimeout(() => {
        resetCart();
        setOrderPlacementState(false, "validating");
        window.location.href = result.redirectTo;
      }, 1500);
    } else {
      console.error("❌ Order placement failed");
      setOrderPlacementState(false, "validating");
      setActionType(null);
    }
  };

  const hasOutOfStockItems = cart.some((item) => {
    const selectedWeightStock = item.selectedWeight?.stock;
    const productStock = item.product.stock;
    return (selectedWeightStock !== undefined ? selectedWeightStock : productStock) === 0;
  });

  return (
    <>
      {isPlacingOrder && actionType === "order" && (
        <OrderPlacementOverlay step={orderStep} isCheckoutRedirect={false} />
      )}

      <div className="space-y-4">
        {totalPackagingFee > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Packaging Fee</span>
              </div>
              <span className="text-sm font-semibold text-blue-700">
                +${totalPackagingFee.toFixed(2)}
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
              Some items are out of stock. Please remove them to continue.
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
            onClick={handleProceedToCheckout}
            disabled={
              isRedirecting ||
              isPlacingOrder ||
              hasOutOfStockItems ||
              !selectedAddress ||
              cart.length === 0
            }
            className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90"
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
                {totalPackagingFee > 0 && ` (+$${totalPackagingFee.toFixed(2)})`}
              </div>
            )}
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p className="text-green-600">✓ Recommended: Use "Proceed to Checkout" for secure payment</p>
          <p className="text-muted-foreground mt-1">"Place Order (Pay Later)" places order directly with Cash on Delivery</p>
        </div>
      </div>
    </>
  );
}