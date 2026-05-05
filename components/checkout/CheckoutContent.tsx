"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Truck,
  MapPin,
  ShoppingBag,
  Package,
  Loader2,
  X,
} from "lucide-react";
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
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";

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
  const {
    items: cart,
    resetCart,
    getSubTotalPrice,
    getTotalDiscount,
  } = useCartStore();
  const { placeOrder, isPlacingOrder, orderStep } = useOrderPlacement({
    user: user!,
  });
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>(PAYMENT_METHODS.STRIPE);
  const [selectedAddress, setSelectedAddress] = useState<OrderAddress | null>(
    null
  );
  const [addresses, setAddresses] = useState<OrderAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [actionType, setActionType] = useState<"pay" | "order" | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasInitialCart, setHasInitialCart] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<{
    isBusiness: boolean;
    isActive: boolean;
  } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // --- PACKAGING LOGIC ---
  // Extract packaging price from URL search params
  const packagingPrice = parseFloat(searchParams.get("packagingPrice") || "0");
  const packagingId = searchParams.get("packagingId") || undefined;

  // Pricing structure
  const grossSubtotal = getSubTotalPrice(); 
  const totalDiscount = getTotalDiscount(); 
  const currentSubtotal = grossSubtotal - totalDiscount; 

  // Business account discount (2% additional discount)
  const businessDiscount = userProfile?.isBusiness ? currentSubtotal * 0.02 : 0;
  const finalSubtotal = currentSubtotal - businessDiscount;

  const shipping = finalSubtotal > 100 ? 0 : 10;
  const tax = finalSubtotal * (parseFloat(process.env.TAX_AMOUNT || "0") || 0);
  
  // Total includes packaging price
  const total = finalSubtotal + shipping + tax + packagingPrice;

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress) return;
      try {
        const response = await fetch("/api/user/status");
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUserProfile({
              isBusiness: data.user.isBusiness || false,
              isActive: data.user.isActive || false,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    if (user && isLoaded) fetchUserProfile();
  }, [user, isLoaded]);

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress) return;
      try {
        const response = await fetch(
          `/api/orders/addresses?email=${encodeURIComponent(
            user.emailAddresses[0].emailAddress
          )}`
        );
        if (response.ok) {
          const data = await response.json();
          setAddresses(data.addresses || []);
          const defaultAddress = data.addresses?.find((addr: OrderAddress) => addr.default);
          if (defaultAddress) setSelectedAddress(defaultAddress);
          else if (data.addresses?.length > 0) setSelectedAddress(data.addresses[0]);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setIsLoadingAddresses(false);
      }
    };
    if (isLoaded && user) fetchAddresses();
  }, [isLoaded, user]);

  // Read address from URL
  useEffect(() => {
    const addressParam = searchParams.get("address");
    if (addressParam) {
      try {
        const decodedAddress = JSON.parse(decodeURIComponent(addressParam));
        const orderAddress: OrderAddress = {
          ...decodedAddress,
          lastUsed: new Date().toISOString(),
          orderNumber: "cart-selected",
          source: "order",
        };
        setSelectedAddress(orderAddress);
      } catch (error) {
        console.error("Error parsing address:", error);
      }
    }
  }, [searchParams]);

  const handlePayNowClick = () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentMethodSelect = async (method: "stripe") => {
    setShowPaymentModal(false);
    await handlePlaceOrder("pay", method);
  };

  const handlePlaceOrder = async (
    action: "pay" | "order",
    paymentGateway?: "stripe"
  ) => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    setActionType(action);
    let paymentMethodToUse = selectedPaymentMethod;
    if (action === "pay" && paymentGateway === "stripe") {
      paymentMethodToUse = PAYMENT_METHODS.STRIPE;
    }

    const result = await placeOrder(
      selectedAddress,
      paymentMethodToUse,
      finalSubtotal,
      shipping,
      tax,
      total,
      false, // isCustomAmount (if applicable)
      packagingId // Pass packagingId to the backend hook
    );

    if (result?.success && result.redirectTo) {
      setIsRedirecting(true);
      resetCart();
      window.location.href = result.redirectTo;
    }
    setActionType(null);
  };

  if (!isLoaded) return <CheckoutSkeleton />;
  if (!user) return <div className="text-center py-10">Sign in to proceed.</div>;
  if (isRedirecting) return <div className="text-center py-10">Processing...</div>;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {/* Payment and Address Cards (kept as in your original) */}
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" />Payment Method</CardTitle></CardHeader>
            <CardContent>
                <RadioGroup value={selectedPaymentMethod} onValueChange={(v) => setSelectedPaymentMethod(v as PaymentMethod)} className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 border rounded-lg">
                        <RadioGroupItem value={PAYMENT_METHODS.CASH_ON_DELIVERY} id="cod" />
                        <Label htmlFor="cod">Cash on Delivery</Label>
                    </div>
                    <div className="flex items-start space-x-3 p-3 border rounded-lg">
                        <RadioGroupItem value={PAYMENT_METHODS.STRIPE} id="stripe" />
                        <Label htmlFor="stripe">Credit/Debit Card</Label>
                    </div>
                </RadioGroup>
            </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" />Shipping Address</CardTitle></CardHeader>
          <CardContent>
            <OrderAddressSelector 
                addresses={addresses} 
                selectedAddress={selectedAddress} 
                onAddressSelect={setSelectedAddress} 
                isLoading={isLoadingAddresses} 
            />
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader><CardTitle>Order Items ({cart.length})</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {cart.map((item: CartItem) => (
              <div key={item.product._id} className="flex gap-3 p-3 border rounded-lg">
                <div className="w-16 h-16 shrink-0">
                  <Image src={item.product.images?.[0] ? urlFor(item.product.images[0]).url() : "/placeholder.jpg"} alt={item.product.name || ""} width={64} height={64} className="object-cover rounded" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <PriceFormatter amount={(item.product.price || 0) * item.quantity} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Summary Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <PriceFormatter amount={grossSubtotal} />
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-<PriceFormatter amount={totalDiscount} /></span>
              </div>
            )}
            {businessDiscount > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>Business Discount (2%)</span>
                <span>-<PriceFormatter amount={businessDiscount} /></span>
              </div>
            )}
            
            {/* DISPLAY PACKAGING PRICE */}
            {packagingPrice > 0 && (
              <div className="flex justify-between">
                <span>Special Packaging</span>
                <PriceFormatter amount={packagingPrice} />
              </div>
            )}

            <div className="flex justify-between">
              <span>Shipping</span>
              {shipping === 0 ? <span className="text-green-600 font-medium">Free</span> : <PriceFormatter amount={shipping} />}
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <PriceFormatter amount={tax} />
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <PriceFormatter amount={total} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button onClick={handlePayNowClick} disabled={isPlacingOrder || !selectedAddress} className="w-full h-12" size="lg">
            {isPlacingOrder && actionType === "pay" ? <Loader2 className="animate-spin" /> : "Pay Now"}
          </Button>
          <Button onClick={() => handlePlaceOrder("order")} disabled={isPlacingOrder || !selectedAddress} variant="outline" className="w-full h-12" size="lg">
             Place Order (Pay Later)
          </Button>
        </div>
      </div>

      {isPlacingOrder && <OrderPlacementOverlay step={orderStep} isCheckoutRedirect={actionType === "pay"} />}

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-black/50" />
          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md bg-background p-6 rounded-lg shadow-xl">
            <DialogTitle className="text-xl font-bold mb-4">Choose Payment Gateway</DialogTitle>
            <Button onClick={() => handlePaymentMethodSelect("stripe")} className="w-full bg-blue-600">
              Pay with Stripe
            </Button>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </div>
  );
}