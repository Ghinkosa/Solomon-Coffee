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
    packagingId?: string // FIXED: Added 8th argument
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

    // Stock validation
    const outOfStockItems = cartSnapshot.filter((item) => (item.product.stock || 0) === 0);
    if (outOfStockItems.length > 0) {
      toast.error("Insufficient Stock");
      return { success: false };
    }

    setOrderPlacementState(true, "validating");

    try {
      setOrderPlacementState(true, "creating");

      // FIXED: Include packagingId in the payload for your API
      const orderData = {
        items: cartSnapshot,
        shippingAddress: selectedAddress,
        paymentMethod: selectedPaymentMethod,
        totalAmount: total,
        subtotal,
        shipping,
        tax,
        packagingId, 
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

      // Prepare Email Data
      const emailData: EmailOrderData = {
        customerName: selectedAddress.name || "Customer",
        customerEmail: user?.emailAddresses[0]?.emailAddress || "",
        orderId: orderNumber,
        orderDate: new Date().toLocaleDateString(),
        items: cartSnapshot.map((item) => ({
          name: item.product.name || "Unknown Product",
          price: item.product.price || 0,
          quantity: item.quantity,
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
            redirectTo: `/checkout?order_id=${orderId}&orderNumber=${orderNumber}${packagingId ? `&packagingId=${packagingId}` : ''}`,
            isCheckoutRedirect: true,
          };
        } else {
          const stripeResponse = await fetch("/api/checkout/stripe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
              orderNumber,
              items: cartSnapshot,
              email: user?.emailAddresses[0]?.emailAddress,
              shippingAddress: selectedAddress,
              orderAmount: total,
              packagingId, // Optional: for Stripe metadata
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
        if (packagingId) params.append('packagingId', packagingId);

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