"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, MapPin, Package, Loader2, X } from "lucide-react";
import useCartStore, { CartItem } from "@/store";
import PriceFormatter from "@/components/PriceFormatter";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { toast } from "sonner";
import { PAYMENT_METHODS, PaymentMethod } from "@/lib/orderStatus";
import { OrderAddressSelector } from "@/components/checkout/OrderAddressSelector";
import { useOrderPlacement } from "@/hooks/useOrderPlacement";
import { CheckoutSkeleton } from "@/components/checkout/CheckoutSkeleton";
import { OrderPlacementOverlay } from "@/components/cart/OrderPlacementSkeleton";
import { Dialog, DialogPortal, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface OrderAddress {
  _id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  default: boolean;
  createdAt: string;
  lastUsed: string;
  orderNumber: string;
  source: "order";
}

export function CheckoutContent() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const { items: cart, resetCart, getSubTotalPrice, getTotalDiscount } = useCartStore();
  const { placeOrder, isPlacingOrder, orderStep } = useOrderPlacement({ user: user! });
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHODS.STRIPE);
  const [selectedAddress, setSelectedAddress] = useState<OrderAddress | null>(null);
  const [addresses, setAddresses] = useState<OrderAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [actionType, setActionType] = useState<"pay" | "order" | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [userProfile, setUserProfile] = useState<{ isBusiness: boolean; isActive: boolean } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // --- PACKAGING LOGIC ---
  const packagingPrice = parseFloat(searchParams.get("packagingPrice") || "0");
  const packagingId = searchParams.get("packagingId") || undefined;

  const grossSubtotal = getSubTotalPrice(); 
  const totalDiscount = getTotalDiscount(); 
  const currentSubtotal = grossSubtotal - totalDiscount; 

  const businessDiscount = userProfile?.isBusiness ? currentSubtotal * 0.02 : 0;
  const finalSubtotal = currentSubtotal - businessDiscount;

  const shipping = finalSubtotal > 100 ? 0 : 10;
  const tax = finalSubtotal * (parseFloat(process.env.NEXT_PUBLIC_TAX_AMOUNT || "0") || 0);
  
  // Total includes packaging price passed from the cart
  const total = finalSubtotal + shipping + tax + packagingPrice;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress) return;
      const res = await fetch("/api/user/status");
      if (res.ok) {
        const data = await res.json();
        setUserProfile({ isBusiness: data.user?.isBusiness || false, isActive: data.user?.isActive || false });
      }
    };
    if (user && isLoaded) fetchUserProfile();
  }, [user, isLoaded]);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress) return;
      const res = await fetch(`/api/orders/addresses?email=${encodeURIComponent(user.emailAddresses[0].emailAddress)}`);
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
        const def = data.addresses?.find((a: OrderAddress) => a.default);
        setSelectedAddress(def || data.addresses?.[0] || null);
      }
      setIsLoadingAddresses(false);
    };
    if (isLoaded && user) fetchAddresses();
  }, [isLoaded, user]);

  const handlePlaceOrder = async (action: "pay" | "order", gateway?: "stripe") => {
    if (!selectedAddress) return;
    setActionType(action);
    const method = action === "pay" ? PAYMENT_METHODS.STRIPE : selectedPaymentMethod;

    const result = await placeOrder(selectedAddress, method, finalSubtotal, shipping, tax, total, false, packagingId);

    if (result?.success && result.redirectTo) {
      setIsRedirecting(true);
      resetCart();
      window.location.href = result.redirectTo;
    }
    setActionType(null);
  };

  if (!isLoaded) return <CheckoutSkeleton />;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" />Shipping Address</CardTitle></CardHeader>
          <CardContent>
            <OrderAddressSelector addresses={addresses} selectedAddress={selectedAddress} onAddressSelect={setSelectedAddress} isLoading={isLoadingAddresses} />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span>Subtotal</span><PriceFormatter amount={grossSubtotal} /></div>
            {totalDiscount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-<PriceFormatter amount={totalDiscount} /></span></div>}
            
            {/* MATCHES CART SUMMARY ICON AND LABEL */}
            <div className="flex justify-between">
              <span className="flex items-center gap-1"><Package className="w-3 h-3"/> Packaging</span>
              <PriceFormatter amount={packagingPrice} />
            </div>

            <div className="flex justify-between"><span>Shipping</span>{shipping === 0 ? <span className="text-green-600">Free</span> : <PriceFormatter amount={shipping} />}</div>
            <Separator />
            <div className="flex justify-between text-lg font-bold"><span>Total</span><PriceFormatter amount={total} /></div>
          </CardContent>
        </Card>
        <Button onClick={() => setShowPaymentModal(true)} disabled={isPlacingOrder || !selectedAddress} className="w-full h-12">Pay Now</Button>
      </div>

      {isPlacingOrder && <OrderPlacementOverlay step={orderStep} isCheckoutRedirect={actionType === "pay"} />}
    </div>
  );
}