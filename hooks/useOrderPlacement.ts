"use client";

import { useState } from "react";
import useCartStore, { CartItem, PackagingOption, WeightOption, GrindOption } from "@/store";
import { PAYMENT_METHODS, PaymentMethod } from "@/lib/orderStatus";
import { toast } from "sonner";
import { localizedPath } from "@/lib/localized-path";
import { useLocale } from "@/hooks/useLocale";

interface EmailOrderItem {
  name: string;
  price: number;
  quantity: number;
  weight?: string;
  weightPrice?: number;
  grind?: string;
  packaging?: string;
  packagingPrice?: number;
  image?: any;
}

interface EmailOrderData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderDate: string;
  items: EmailOrderItem[];
  subtotal: number;
  packagingFee: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

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

interface UseOrderPlacementProps {
  user: {
    id?: string;
    emailAddresses: Array<{ emailAddress: string }>;
  } | null;
}

const getItemCurrentPrice = (item: CartItem): number => {
  if (item.selectedWeight && item.selectedWeight.price) {
    return item.selectedWeight.price;
  }
  const defaultWeight = (item.product as any).weightOptions?.find((w: WeightOption) => w.isDefault);
  return defaultWeight?.price || item.product.price || 0;
};

export function useOrderPlacement({ user }: UseOrderPlacementProps) {
  const lang = useLocale();
  const {
    items: cart,
    resetCart,
    isPlacingOrder,
    orderStep,
    setOrderPlacementState,
  } = useCartStore();

  const placeOrder = async (
    selectedAddress: Address,
    selectedPaymentMethod: PaymentMethod,
    subtotal: number,
    packagingFee: number,
    shipping: number,
    tax: number,
    total: number,
    redirectToCheckout: boolean = false,
    selectionsData?: Array<{ 
      productId: string; 
      weight: WeightOption | null; 
      grind: GrindOption | null;
      packaging: PackagingOption | null;
    }>
  ) => {
    if (!selectedAddress) {
      toast.error("Address Required", {
        description: "Please select a shipping address",
      });
      return { success: false };
    }

    if (cart.length === 0) {
      toast.error("Cart is empty");
      return { success: false };
    }

    const cartSnapshot: CartItem[] = JSON.parse(JSON.stringify(cart));

    // Stock validation with weight consideration
    const outOfStockItems = cartSnapshot.filter((item) => {
      const selectedWeightStock = item.selectedWeight?.stock;
      const productStock = item.product.stock;
      return (selectedWeightStock !== undefined ? selectedWeightStock : productStock) === 0;
    });
    
    if (outOfStockItems.length > 0) {
      toast.error("Insufficient Stock");
      return { success: false };
    }

    setOrderPlacementState(true, "validating");

    try {
      setOrderPlacementState(true, "creating");

      // Prepare items with weight, grind, and packaging data
      const itemsWithSelections = cartSnapshot.map((item) => {
        const productSelections = selectionsData?.find(
          (sel) => sel.productId === item.product._id
        );
        
        const finalWeight = item.selectedWeight || productSelections?.weight;
        const finalGrind = item.selectedGrind || productSelections?.grind;
        const finalPackaging = item.selectedPackaging || productSelections?.packaging;
        const itemPrice = finalWeight?.price || getItemCurrentPrice(item);
        
        const itemData: any = {
          product: {
            _id: item.product._id,
            name: item.product.name,
            price: itemPrice,
            originalPrice: item.product.price,
          },
          quantity: item.quantity,
        };
        
        // ✅ ADD WEIGHT INFORMATION
        if (finalWeight) {
          itemData.weight = {
            value: finalWeight.weight,
            price: finalWeight.price,
            isDefault: finalWeight.isDefault,
          };
        }
        
        // ✅ ADD GRIND INFORMATION
        if (finalGrind) {
          const grindLabel = finalGrind.grindType === "whole-bean" ? "Whole Bean" :
                   finalGrind.grindType === "cafetiere" ? "Cafetiere" :
                   finalGrind.grindType === "filter" ? "Filter" : "Espresso";
          itemData.grind = {
            type: finalGrind.grindType,
            label: grindLabel,
            isDefault: finalGrind.isDefault,
          };
        }

        // ✅ ADD PACKAGING INFORMATION
        if (finalPackaging) {
          itemData.packaging = {
            id: finalPackaging._id,
            title: finalPackaging.title,
            price: finalPackaging.price,
            isDefault: finalPackaging.default,
          };
        }
        
        return itemData;
      });

      // Calculate products total with weight prices
      const productsTotal = itemsWithSelections.reduce((sum, item) => {
        const productPrice = item.product.price * item.quantity;
        return sum + productPrice;
      }, 0);

      const orderData = {
        items: itemsWithSelections,
        shippingAddress: selectedAddress,
        paymentMethod: selectedPaymentMethod,
        totalAmount: total,
        subtotal: productsTotal,
        packagingFee,
        shipping,
        tax,
      };

      console.log("📦 Order Data being sent (with Weight, Grind, Packaging):", JSON.stringify(orderData, null, 2));

      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const orderResult = await orderResponse.json();
      const orderId = orderResult.order._id;
      const orderNumber = orderResult.order.orderNumber;

      setOrderPlacementState(true, "emailing");

      // ✅ Prepare Email Data with ALL selections (Weight, Grind, Packaging)
      const emailData: EmailOrderData = {
        customerName: selectedAddress.name || "Customer",
        customerEmail: user?.emailAddresses[0]?.emailAddress || "",
        orderId: orderNumber,
        orderDate: new Date().toLocaleDateString(),
        items: cartSnapshot.map((item) => {
          const finalWeight = item.selectedWeight || selectionsData?.find(s => s.productId === item.product._id)?.weight;
          const finalGrind = item.selectedGrind || selectionsData?.find(s => s.productId === item.product._id)?.grind;
          const finalPackaging = item.selectedPackaging || selectionsData?.find(s => s.productId === item.product._id)?.packaging;
          
          return {
            name: item.product.name || "Unknown Product",
            price: finalWeight?.price || getItemCurrentPrice(item),
            quantity: item.quantity,
            weight: finalWeight?.weight,
            weightPrice: finalWeight?.price,
            grind: finalGrind?.grindType,
            packaging: finalPackaging?.title,
            packagingPrice: finalPackaging?.price,
            image: item.product.images?.[0] || undefined,
          };
        }),
        subtotal,
        packagingFee,
        shipping,
        tax,
        total,
        shippingAddress: {
          name: selectedAddress.name,
          street: selectedAddress.address,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zip,
          country: "United States",
        },
      };

      // Send email asynchronously
      fetch("/api/orders/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderData: emailData }),
      }).catch(err => console.error("Email failed:", err));

      setOrderPlacementState(true, "redirecting");

      // Handle redirect based on payment method
      if (selectedPaymentMethod === PAYMENT_METHODS.STRIPE) {
        if (redirectToCheckout) {
          return {
            success: true,
            orderId,
            orderNumber,
            redirectTo: localizedPath(`/checkout?order_id=${orderId}&orderNumber=${orderNumber}`, lang),
            isCheckoutRedirect: true,
          };
        } else {
          // ✅ Stripe checkout with all item details
          const stripeResponse = await fetch("/api/checkout/stripe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
              orderNumber,
              items: itemsWithSelections,
              email: user?.emailAddresses[0]?.emailAddress,
              shippingAddress: selectedAddress,
              orderAmount: total,
              subtotal: subtotal,
              packagingFee,
              shipping,
              tax,
            }),
          });

          const stripeResult = await stripeResponse.json();
          return {
            success: true,
            orderId,
            orderNumber,
            redirectTo: stripeResult.url || localizedPath("/user/orders", lang),
            isStripeRedirect: !!stripeResult.url,
          };
        }
      } else {
        // COD Logic
        const targetPath = redirectToCheckout
          ? localizedPath("/checkout", lang)
          : localizedPath("/success", lang);
        const params = new URLSearchParams({
          order_id: orderId,
          orderNumber: orderNumber,
          payment_method: 'cod'
        });

        return {
          success: true,
          orderId,
          orderNumber,
          redirectTo: `${targetPath}?${params.toString()}`,
          isCOD: !redirectToCheckout,
        };
      }
    } catch (error: any) {
      console.error("Order placement error:", error);
      toast.error("Order Failed", { description: error.message });
      setOrderPlacementState(false, "validating");
      return { success: false };
    }
  };

  return {
    placeOrder,
    isPlacingOrder,
    orderStep,
    cartSnapshot: cart,
  };
}