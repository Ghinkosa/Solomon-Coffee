"use client";

import { useState } from "react";
import useCartStore, { CartItem, PackagingOption, WeightOption, GrindOption } from "@/store";
import { PAYMENT_METHODS, PaymentMethod } from "@/lib/orderStatus";
import { toast } from "sonner";
import { localizedPath } from "@/lib/localized-path";
import { useLocale } from "@/hooks/useLocale";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";
import { getGrindLabel } from "@/lib/i18n-nav";

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
  phone?: string;
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
  const dictionary = useDictionary();
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
      toast.error(t(dictionary, "checkoutPlacement.addressRequired", "Address Required"), {
        description: t(
          dictionary,
          "checkoutPlacement.selectAddress",
          "Please select a shipping address",
        ),
      });
      return { success: false };
    }

    if (cart.length === 0) {
      toast.error(t(dictionary, "checkoutPlacement.cartEmpty", "Cart is empty"));
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
      toast.error(
        t(dictionary, "checkoutPlacement.insufficientStock", "Insufficient Stock"),
      );
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
          const grindLabel = getGrindLabel(dictionary, finalGrind.grindType);
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

      const orderData = {
        items: itemsWithSelections,
        shippingAddress: selectedAddress,
        paymentMethod: selectedPaymentMethod,
        totalAmount: total,
        subtotal,
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
        customerEmail:
          selectedAddress.email ||
          user?.emailAddresses[0]?.emailAddress ||
          "",
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
          resetCart();
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
              email:
                selectedAddress.email ||
                user?.emailAddresses[0]?.emailAddress,
              shippingAddress: selectedAddress,
              orderAmount: total,
              subtotal: subtotal,
              packagingFee,
              shipping,
              tax,
              isGuest: !user,
            }),
          });

          const stripeResult = await stripeResponse.json();

          // Only clear the cart once Stripe returns a redirect URL. If the
          // session failed, keep the cart so the customer can retry payment
          // (the order exists as pending and can be paid from /user/orders).
          if (!stripeResult.url) {
            toast.error(
              t(dictionary, "checkoutPlacement.orderFailed", "Order Failed"),
              {
                description: t(
                  dictionary,
                  "checkoutPlacement.paymentSessionFailed",
                  "We couldn't start the payment. Your order was saved — you can pay it from My Orders.",
                ),
              },
            );
            setOrderPlacementState(true, "redirecting");
            return {
              success: true,
              orderId,
              orderNumber,
              redirectTo: localizedPath("/user/orders", lang),
              isStripeRedirect: false,
            };
          }

          resetCart();
          return {
            success: true,
            orderId,
            orderNumber,
            redirectTo: stripeResult.url,
            isStripeRedirect: true,
          };
        }
      } else {
        // COD Logic
        resetCart();
        const targetPath = redirectToCheckout
          ? localizedPath("/checkout", lang)
          : localizedPath("/success", lang);
        const params = new URLSearchParams({
          order_id: orderId,
          orderNumber: orderNumber,
          payment_method: 'cod'
        });
        if (!user && selectedAddress.email) {
          params.set("guest", "true");
        }

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
      toast.error(t(dictionary, "checkoutPlacement.orderFailed", "Order Failed"), {
        description: error.message,
      });
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