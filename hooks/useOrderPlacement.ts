"use client";

import { useState } from "react";
import useCartStore, { CartItem } from "@/store";
import { PAYMENT_METHODS, PaymentMethod } from "@/lib/orderStatus";
import { toast } from "sonner";

// Extended interface for email preparation
interface EmailOrderItem {
  name: string;
  price: number;
  quantity: number;
  weight?: string;
  grind?: string;
  image?: any; 
}

interface EmailOrderData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderDate: string;
  items: EmailOrderItem[];
  subtotal: number;
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
  estimatedDelivery?: string;
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

// Helper to get current price based on selected weight
const getItemCurrentPrice = (item: CartItem): number => {
  if (item.selectedWeight && item.selectedWeight.price) {
    return item.selectedWeight.price;
  }
  const defaultWeight = item.product.weightOptions?.find((w: any) => w.isDefault);
  return defaultWeight?.price || item.product.price || 0;
};

export function useOrderPlacement({ user }: UseOrderPlacementProps) {
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
    shipping: number,
    tax: number,
    total: number,
    redirectToCheckout: boolean = false,
    selectionsData?: Array<{ productId: string; weight: any | null; grind: any | null }>
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

      // Prepare items with weight and grind data
      const itemsWithSelections = cartSnapshot.map((item) => {
        const productSelections = selectionsData?.find(
          (sel) => sel.productId === item.product._id
        );
        
        const finalWeight = item.selectedWeight || productSelections?.weight;
        const finalGrind = item.selectedGrind || productSelections?.grind;
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
        
        if (finalWeight) {
          itemData.weight = {
            value: finalWeight.weight,
            price: finalWeight.price,
          };
        }
        
        if (finalGrind) {
          itemData.grind = {
            type: finalGrind.grindType,
            label: finalGrind.grindType === "whole-bean" ? "Whole Bean" :
                   finalGrind.grindType === "cafetiere" ? "Cafetiere" :
                   finalGrind.grindType === "filter" ? "Filter" : "Espresso",
          };
        }
        
        return itemData;
      });

      // Calculate totals with weight-based pricing
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
        shipping,
        tax,
      };

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

      // Prepare Email Data with weight and grind info
      const emailData: EmailOrderData = {
        customerName: selectedAddress.name || "Customer",
        customerEmail: user?.emailAddresses[0]?.emailAddress || "",
        orderId: orderNumber,
        orderDate: new Date().toLocaleDateString(),
        items: cartSnapshot.map((item) => ({
          name: item.product.name || "Unknown Product",
          price: getItemCurrentPrice(item),
          quantity: item.quantity,
          weight: item.selectedWeight?.weight,
          grind: item.selectedGrind?.grindType,
          image: item.product.images?.[0] || undefined,
        })),
        subtotal,
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

      // Async email trigger
      fetch("/api/orders/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderData: emailData }),
      }).catch(err => console.error("Email failed:", err));

      setOrderPlacementState(true, "redirecting");

      // REDIRECT LOGIC
      if (selectedPaymentMethod === PAYMENT_METHODS.STRIPE) {
        if (redirectToCheckout) {
          return {
            success: true,
            orderId,
            orderNumber,
            redirectTo: `/checkout?order_id=${orderId}&orderNumber=${orderNumber}`,
            isCheckoutRedirect: true,
          };
        } else {
          // Stripe payment
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
              shipping: shipping,
              tax: tax,
            }),
          });

          const stripeResult = await stripeResponse.json();
          return {
            success: true,
            orderId,
            orderNumber,
            redirectTo: stripeResult.url || `/user/orders`,
            isStripeRedirect: !!stripeResult.url,
          };
        }
      } else {
        // COD Logic
        const targetPath = redirectToCheckout ? '/checkout' : '/success';
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