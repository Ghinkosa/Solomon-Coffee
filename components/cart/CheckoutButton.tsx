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
  packagingPrice?: number;
}

export function CheckoutButton({ 
  cart, 
  selectedAddress, 
  packagingPrice = 0 
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
    console.log("✅ CheckoutButton - packagingPrice received:", packagingPrice);
    console.log("✅ CheckoutButton - cart items:", cart.length);
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

  const handleProceedToCheckout = async (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("🚀 PROCEED TO CHECKOUT clicked - packagingPrice:", packagingPrice);
    
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      setIsRedirecting(false);
      return;
    }

    const outOfStockItems = cart.filter((item) => item.product.stock === 0);
    if (outOfStockItems.length > 0) {
      toast.error("Some items are out of stock. Please remove them to continue.");
      setIsRedirecting(false);
      return;
    }

    setIsRedirecting(true);
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

    // Prepare packaging data for URL (store as JSON string)
    const packagingDataForUrl = cart.map(item => ({
      productId: item.product._id,
      packaging: item.selectedPackaging ? {
        _id: item.selectedPackaging._id,
        title: item.selectedPackaging.title,
        price: item.selectedPackaging.price,
      } : null
    }));
    
    const addressParam = encodeURIComponent(JSON.stringify(selectedAddress));
    const packagingParam = encodeURIComponent(JSON.stringify(packagingDataForUrl));
    
    // Build URL with packaging data
    const checkoutUrl = `/checkout?address=${addressParam}&packagingData=${packagingParam}&packagingPrice=${packagingPrice}`;
    
    console.log("🔗 REDIRECTING TO CHECKOUT:", checkoutUrl);
    console.log("🔗 packagingData:", packagingDataForUrl);
    
    // Use router.push for Next.js navigation
    try {
      await router.push(checkoutUrl);
    } catch (error) {
      console.error("Redirect error:", error);
      window.location.href = checkoutUrl;
    }
  };

  const handlePlaceOrder = async () => {
    console.log("🚀 PLACE ORDER (Pay Later) clicked - packagingPrice:", packagingPrice);
    
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

    // Prepare packaging data for each product
    const packagingData = cart.map(item => ({
      productId: item.product._id,
      packaging: item.selectedPackaging || null,
    }));

    const result = await placeOrder(
      selectedAddress,
      PAYMENT_METHODS.CASH_ON_DELIVERY,
      currentSubtotal,
      shipping,
      tax,
      finalTotal,
      false,
      packagingData // Pass packaging data
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
                Proceed to Checkout {packagingPrice > 0 ? `(+$${packagingPrice.toFixed(2)})` : ""}
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
                Place Order (Pay Later) {packagingPrice > 0 ? `(+$${packagingPrice.toFixed(2)})` : ""}
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