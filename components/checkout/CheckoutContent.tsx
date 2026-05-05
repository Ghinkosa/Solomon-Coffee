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

  // Pricing Logic
  const grossSubtotal = getSubTotalPrice(); 
  const totalDiscount = getTotalDiscount(); 
  const currentSubtotal = grossSubtotal - totalDiscount;

  // Add packaging logic from URL
  const packagingPrice = parseFloat(searchParams.get("packagingPrice") || "0");
  const packagingId = searchParams.get("packagingId");

  const businessDiscount = userProfile?.isBusiness ? currentSubtotal * 0.02 : 0;
  const finalSubtotal = currentSubtotal - businessDiscount; // Fixed typo here

  const shipping = finalSubtotal > 100 ? 0 : 10;
  const tax = finalSubtotal * (parseFloat(process.env.NEXT_PUBLIC_TAX_AMOUNT || "0") || 0);
  const total = finalSubtotal + shipping + tax + packagingPrice;

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

    if (user && isLoaded) {
      fetchUserProfile();
    }
  }, [user, isLoaded]);

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
          const defaultAddress = data.addresses?.find(
            (addr: OrderAddress) => addr.default
          );
          if (defaultAddress) {
            setSelectedAddress(defaultAddress);
          } else if (data.addresses?.length > 0) {
            setSelectedAddress(data.addresses[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    if (isLoaded && user) {
      fetchAddresses();
    }
  }, [isLoaded, user]);

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
        toast.success("Ready for Checkout! 🛒");
      } catch (error) {
        console.error("Error parsing address:", error);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (hasInitialCart === null && isLoaded && cart !== undefined) {
      setHasInitialCart(cart.length > 0);
      if (cart.length === 0) {
        window.location.href = "/cart";
      }
    }
  }, [cart, hasInitialCart, isLoaded]);

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
    let paymentMethodToUse = action === "pay" ? PAYMENT_METHODS.STRIPE : PAYMENT_METHODS.CASH_ON_DELIVERY;

    const result = await placeOrder(
      selectedAddress,
      paymentMethodToUse,
      finalSubtotal,
      shipping,
      tax,
      total,
      false, // isCanceled
      packagingId || undefined
    );

    if (result?.success && result.redirectTo) {
      setIsRedirecting(true);
      resetCart();
      window.location.href = result.redirectTo;
    }
    setActionType(null);
  };

  if (!isLoaded) return <CheckoutSkeleton />;
  if (!user) return <div className="text-center py-10">Please sign in to proceed.</div>;
  if (isRedirecting) return <div className="text-center py-10"><Loader2 className="animate-spin mx-auto" /> Processing...</div>;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard /> Payment Method</CardTitle></CardHeader>
          <CardContent>
            <RadioGroup value={selectedPaymentMethod} onValueChange={(v) => setSelectedPaymentMethod(v as PaymentMethod)} className="space-y-3">
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value={PAYMENT_METHODS.CASH_ON_DELIVERY} id="cod" />
                <Label htmlFor="cod" className="flex-1 cursor-pointer">
                  <div className="font-medium flex items-center gap-2"><Truck className="w-4 h-4"/> Cash on Delivery</div>
                  <p className="text-sm text-muted-foreground">Pay when your order is delivered.</p>
                </Label>
              </div>
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value={PAYMENT_METHODS.STRIPE} id="stripe" />
                <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                  <div className="font-medium flex items-center gap-2"><CreditCard className="w-4 h-4"/> Credit/Debit Card</div>
                  <p className="text-sm text-muted-foreground">Pay securely via Stripe.</p>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPin /> Shipping Address</CardTitle></CardHeader>
          <CardContent>
            {isLoadingAddresses ? (
              <div className="animate-pulse space-y-2"><div className="h-20 bg-gray-200 rounded"></div></div>
            ) : (
              <OrderAddressSelector addresses={addresses} selectedAddress={selectedAddress} onAddressSelect={setSelectedAddress} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Order Items ({cart.length})</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {cart.map((item) => (
              <div key={item.product._id} className="flex gap-3 p-3 border rounded-lg">
                <Image src={item.product.images?.[0] ? urlFor(item.product.images[0]).url() : "/placeholder.jpg"} alt="image not found" width={64} height={64} className="rounded object-cover" />
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

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span>Subtotal</span><PriceFormatter amount={grossSubtotal} /></div>
            {totalDiscount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-<PriceFormatter amount={totalDiscount} /></span></div>}
            {businessDiscount > 0 && <div className="flex justify-between text-blue-600"><span>Business Discount (2%)</span><span>-<PriceFormatter amount={businessDiscount} /></span></div>}
            {packagingPrice > 0 && <div className="flex justify-between"><span>Packaging</span><PriceFormatter amount={packagingPrice} /></div>}
            <div className="flex justify-between"><span>Shipping</span>{shipping === 0 ? <span className="text-green-600">Free</span> : <PriceFormatter amount={shipping} />}</div>
            <Separator />
            <div className="flex justify-between text-lg font-bold"><span>Total</span><PriceFormatter amount={total} /></div>
          </CardContent>
        </Card>
        
        <div className="space-y-3">
          <Button onClick={handlePayNowClick} disabled={isPlacingOrder || !selectedAddress || cart.length === 0} className="w-full h-12 text-lg">
            {isPlacingOrder && actionType === "pay" ? <Loader2 className="animate-spin" /> : "Pay Now"}
          </Button>
          <Button onClick={() => handlePlaceOrder("order")} variant="outline" disabled={isPlacingOrder || !selectedAddress || cart.length === 0} className="w-full h-12 text-lg">
            {isPlacingOrder && actionType === "order" ? <Loader2 className="animate-spin" /> : "Place Order (Pay Later)"}
          </Button>
        </div>
      </div>

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-black/50" />
          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md bg-background p-6 rounded-lg shadow-xl z-50">
            <VisuallyHidden.Root><DialogTitle>Choose Payment</DialogTitle></VisuallyHidden.Root>
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold">Select Payment Gateway</h3>
              <Button onClick={() => handlePaymentMethodSelect("stripe")} className="w-full h-12 bg-blue-600 hover:bg-blue-700">
                <CreditCard className="mr-2" /> Pay with Stripe
              </Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
      {isPlacingOrder && <OrderPlacementOverlay step={orderStep} isCheckoutRedirect={actionType === "pay"} />}
    </div>
  );
}