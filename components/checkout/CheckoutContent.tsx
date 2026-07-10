"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Box,
  Scale,
  Coffee,
} from "lucide-react";
import useCartStore, { CartItem, WeightOption, GrindOption, PackagingOption } from "@/store";
import { useLocalizedPath } from "@/hooks/useLocale";
import PriceFormatter from "@/components/PriceFormatter";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { toast } from "sonner";
import { PAYMENT_METHODS, PaymentMethod } from "@/lib/orderStatus";
import { OrderAddressSelector } from "@/components/checkout/OrderAddressSelector";
import {
  GuestCheckoutForm,
  getGuestCheckoutValidationMessage,
  guestDetailsToAddress,
  isGuestCheckoutComplete,
  type GuestCheckoutDetails,
} from "@/components/checkout/GuestCheckoutForm";
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
import Link from "next/link";
import {
  buildCheckoutPricingItems,
  calculateCheckoutTotals,
} from "@/lib/checkout-pricing";

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

// Helper to get current price based on selected weight
const getItemCurrentPrice = (item: CartItem): number => {
  if (item.selectedWeight && item.selectedWeight.price) {
    return item.selectedWeight.price;
  }
  const defaultWeight = (item.product as any).weightOptions?.find((w: WeightOption) => w.isDefault);
  return defaultWeight?.price || item.product.price || 0;
};

type CheckoutSelection = {
  productId: string;
  weight: WeightOption | null;
  grind: GrindOption | null;
  packaging: PackagingOption | null;
};

function resolveCheckoutLine(
  item: CartItem,
  selectionsData: CheckoutSelection[],
) {
  const selection = selectionsData.find(
    (entry) => entry.productId === item.product._id,
  );
  const weight = item.selectedWeight || selection?.weight;
  const packaging = item.selectedPackaging || selection?.packaging;

  return {
    product: item.product,
    quantity: item.quantity,
    unitPrice: weight?.price ?? getItemCurrentPrice(item),
    packagingPrice: packaging?.price ?? 0,
  };
}

export function CheckoutContent() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const {
    items: cart,
    openAuthSidebar,
  } = useCartStore();
  const toLocalizedPath = useLocalizedPath();
  const { placeOrder, isPlacingOrder, orderStep } = useOrderPlacement({
    user: user
      ? {
          id: user.id,
          emailAddresses: user.emailAddresses,
        }
      : null,
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
    businessStatus?: string;
  } | null>(null);
  const [guestDetails, setGuestDetails] = useState<GuestCheckoutDetails>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [showGuestFormErrors, setShowGuestFormErrors] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectionsData, setSelectionsData] = useState<Array<{
    productId: string;
    weight: WeightOption | null;
    grind: GrindOption | null;
    packaging: PackagingOption | null;
  }>>([]);

  // Parse selections from URL params
  useEffect(() => {
    const selectionsParam = searchParams.get("selections");
    console.log("📍 CheckoutContent - Raw selections param:", selectionsParam);
    
    if (selectionsParam) {
      try {
        const decodedSelections = JSON.parse(decodeURIComponent(selectionsParam));
        console.log("📍 CheckoutContent - Parsed selections:", decodedSelections);
        setSelectionsData(decodedSelections);
      } catch (error) {
        console.error("Error parsing selections from URL:", error);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("intent") === "cod") {
      setSelectedPaymentMethod(PAYMENT_METHODS.CASH_ON_DELIVERY);
    }
  }, [searchParams]);

  const checkoutTotals = useMemo(() => {
    const lines = cart.map((item) => resolveCheckoutLine(item, selectionsData));

    const businessDiscountRate =
      userProfile?.isBusiness && userProfile.businessStatus === "active"
        ? 0.02
        : 0;

    return calculateCheckoutTotals({
      items: buildCheckoutPricingItems(lines),
      businessDiscountRate,
    });
  }, [cart, selectionsData, userProfile]);

  const grossSubtotal = checkoutTotals.subtotal;
  const totalDiscount = checkoutTotals.productDiscount;
  const currentSubtotal = grossSubtotal - totalDiscount;
  const businessDiscount = checkoutTotals.businessDiscount;
  const totalPackagingFee = checkoutTotals.packagingFee;
  const subtotalWithPackaging =
    currentSubtotal - businessDiscount + totalPackagingFee;
  const shipping = checkoutTotals.shipping;
  const tax = checkoutTotals.tax;
  const total = checkoutTotals.total;

  console.log("📍 CheckoutContent - Calculations:", {
    grossSubtotal,
    totalDiscount,
    currentSubtotal,
    totalPackagingFee,
    businessDiscount,
    subtotalWithPackaging,
    shipping,
    tax,
    total
  });

  // Fetch user profile for business account status
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress) return;

      try {
        const response = await fetch("/api/user/status");
        if (response.ok) {
          const data = await response.json();
          if (data.userProfile) {
            setUserProfile({
              isBusiness: data.userProfile.isBusiness || false,
              isActive: data.userProfile.isActive || false,
              businessStatus: data.userProfile.businessStatus || "none",
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

  // Fetch user addresses from previous orders
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
    } else if (isLoaded && !user) {
      setIsLoadingAddresses(false);
    }
  }, [isLoaded, user]);

  // Read address from URL parameters
  useEffect(() => {
    const addressParam = searchParams.get("address");
    if (addressParam) {
      try {
        const decodedAddress = JSON.parse(decodeURIComponent(addressParam));
        const orderAddress: OrderAddress = {
          _id: decodedAddress._id,
          name: decodedAddress.name,
          email: decodedAddress.email,
          address: decodedAddress.address,
          city: decodedAddress.city,
          state: decodedAddress.state,
          zip: decodedAddress.zip,
          default: decodedAddress.default,
          createdAt: decodedAddress.createdAt,
          lastUsed: new Date().toISOString(),
          orderNumber: "cart-selected",
          source: "order" as const,
        };
        setSelectedAddress(orderAddress);

        toast.success("Ready for Checkout! 🛒", {
          description: "Complete your order by selecting a payment method below",
          duration: 4000,
        });
      } catch (error) {
        console.error("Error parsing address from URL:", error);
        toast.error("Error loading address from cart");
      }
    }
  }, [searchParams]);

  // Track initial cart state and redirect if empty
  useEffect(() => {
    if (hasInitialCart === null && isLoaded && cart !== undefined) {
      setHasInitialCart(cart.length > 0);
      if (cart.length === 0) {
        window.location.href = "/cart";
        return;
      }
    }
  }, [cart, hasInitialCart, isLoaded]);

  const getCheckoutAddress = () => {
    if (user) {
      return selectedAddress;
    }

    if (!isGuestCheckoutComplete(guestDetails)) {
      return null;
    }

    return guestDetailsToAddress(guestDetails);
  };

  const ensureGuestCheckoutIsValid = () => {
    if (user) return true;

    setShowGuestFormErrors(true);
    const validationMessage = getGuestCheckoutValidationMessage(guestDetails);
    if (validationMessage) {
      toast.error("Please fix your shipping details", {
        description: validationMessage,
      });
      return false;
    }

    return true;
  };

  const handlePayNowClick = () => {
    if (!ensureGuestCheckoutIsValid()) return;

    const checkoutAddress = getCheckoutAddress();
    if (!checkoutAddress) {
      toast.error(
        user
          ? "Please select a shipping address"
          : "Please complete your guest checkout details",
      );
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
    if (!ensureGuestCheckoutIsValid()) return;

    const checkoutAddress = getCheckoutAddress();
    if (!checkoutAddress) {
      toast.error(
        user
          ? "Please select a shipping address"
          : "Please complete your guest checkout details",
      );
      return;
    }

    setActionType(action);

    let paymentMethodToUse = selectedPaymentMethod;
    if (action === "pay" && paymentGateway === "stripe") {
      paymentMethodToUse = PAYMENT_METHODS.STRIPE;
    }

    // Prepare selections data with current selections
    const currentSelectionsData = cart.map(item => ({
      productId: item.product._id,
      weight: item.selectedWeight || null,
      grind: item.selectedGrind || null,
      packaging: item.selectedPackaging || selectionsData.find(s => s.productId === item.product._id)?.packaging || null,
    }));

    const result = await placeOrder(
      checkoutAddress,
      paymentMethodToUse,
      currentSubtotal,           // subtotal (without packaging)
      totalPackagingFee,         // packagingFee
      shipping,                  // shipping
      tax,                       // tax
      total,                     // total
      false,                     // redirectToCheckout
      currentSelectionsData      // selectionsData
    );

    if (result?.success && result.redirectTo) {
      setIsRedirecting(true);
      if (result.orderNumber) {
        sessionStorage.setItem(
          action === "pay" && result.isStripeRedirect
            ? "pendingCheckoutOrder"
            : "completedOrder",
          result.orderNumber,
        );
        if (!user && checkoutAddress.email) {
          sessionStorage.setItem("guestOrderEmail", checkoutAddress.email);
        }
      }

      if (action === "pay" && result.isStripeRedirect) {
        window.location.href = result.redirectTo;
      } else {
        setTimeout(
          () => {
            window.location.href = result.redirectTo;
          },
          action === "order" ? 1500 : 500,
        );
      }
    }

    setActionType(null);
  };

  const checkoutAddressReady = Boolean(getCheckoutAddress());

  if (!isLoaded) {
    return <CheckoutSkeleton />;
  }

  if (isRedirecting) {
    return (
      <div className="text-center py-10">
        <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-shop_light_green" />
        <h2 className="text-xl font-semibold mb-2 text-shop_dark_green">Processing your order...</h2>
        <p className="text-muted-foreground">
          Please wait while we redirect you to complete your payment.
        </p>
      </div>
    );
  }

  if ((!cart || cart.length === 0) && hasInitialCart) {
    return <CheckoutSkeleton />;
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="text-center py-10 animate-in fade-in-0 duration-500">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-4">
          Add some products to continue with checkout
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <a href={toLocalizedPath("/shop")}>Continue Shopping</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {!user && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Already have an account? Sign in for faster checkout and order history.
                </p>
                <Button variant="outline" onClick={() => openAuthSidebar("signIn")}>
                  Sign in
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedPaymentMethod}
              onValueChange={(value) =>
                setSelectedPaymentMethod(value as PaymentMethod)
              }
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <RadioGroupItem
                  value={PAYMENT_METHODS.CASH_ON_DELIVERY}
                  id="cod"
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="cod" className="cursor-pointer">
                    <div className="flex items-center gap-2 font-medium">
                      <Truck className="w-4 h-4" />
                      Cash on Delivery
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pay when your order is delivered to your doorstep
                    </p>
                  </Label>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <RadioGroupItem
                  value={PAYMENT_METHODS.STRIPE}
                  id="stripe"
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="stripe" className="cursor-pointer">
                    <div className="flex items-center gap-2 font-medium">
                      <CreditCard className="w-4 h-4" />
                      Credit/Debit Card
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pay securely with your credit or debit card via Stripe
                    </p>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!user ? (
              <GuestCheckoutForm
                value={guestDetails}
                onChange={setGuestDetails}
                showErrors={showGuestFormErrors}
              />
            ) : isLoadingAddresses ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse mt-1"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-48"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-40"></div>
                  </div>
                </div>
              </div>
            ) : searchParams.get("address") ? (
              selectedAddress && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{selectedAddress.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedAddress.address}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedAddress.city}, {selectedAddress.state}{" "}
                        {selectedAddress.zip}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                      ✓ Selected
                    </div>
                  </div>
                </div>
              )
            ) : (
              <OrderAddressSelector
                addresses={addresses}
                selectedAddress={selectedAddress}
                onAddressSelect={setSelectedAddress}
                isLoading={isLoadingAddresses}
              />
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items ({cart.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.map((item: CartItem) => {
              const itemPrice = getItemCurrentPrice(item);
              const urlPackaging = selectionsData.find(s => s.productId === item.product._id)?.packaging;
              const packagingPrice = urlPackaging?.price || item.selectedPackaging?.price || 0;
              const totalItemPrice = (itemPrice + packagingPrice) * item.quantity;
              
              return (
                <div
                  key={item.product._id}
                  className="flex gap-3 p-3 border rounded-lg"
                >
                  <div className="w-16 h-16 shrink-0">
                    <Image
                      src={
                        item.product.images?.[0]
                          ? urlFor(item.product.images[0]).url()
                          : "/placeholder.jpg"
                      }
                      alt={item.product.name || "Product"}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                    {/* Display selected options */}
                    <div className="mt-1 text-xs text-gray-500 space-x-2">
                      {item.selectedWeight && (
                        <span className="inline-flex items-center gap-1">
                          <Scale className="w-3 h-3" />
                          {item.selectedWeight.weight}
                        </span>
                      )}
                      {item.selectedGrind && (
                        <span className="inline-flex items-center gap-1">
                          <Coffee className="w-3 h-3" />
                          {item.selectedGrind.grindType.replace('-', ' ').toUpperCase()}
                        </span>
                      )}
                      {(urlPackaging || item.selectedPackaging) && (
                        <span className="inline-flex items-center gap-1">
                          <Box className="w-3 h-3" />
                          {urlPackaging?.title || item.selectedPackaging?.title}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      <PriceFormatter amount={totalItemPrice} />
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <PriceFormatter amount={itemPrice} /> each
                      {packagingPrice > 0 && ` + $${packagingPrice} packaging`}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal ({cart.length} items)</span>
              <PriceFormatter amount={grossSubtotal} />
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>
                  -<PriceFormatter amount={totalDiscount} />
                </span>
              </div>
            )}
            {businessDiscount > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>Business Account Discount (2%)</span>
                <span>
                  -<PriceFormatter amount={businessDiscount} />
                </span>
              </div>
            )}
            
            {/* Packaging Price Display */}
            {totalPackagingFee > 0 && (
              <div className="flex justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-muted-foreground" />
                  <span>Packaging</span>
                </div>
                <PriceFormatter amount={totalPackagingFee} />
              </div>
            )}
            
            <div className="flex justify-between">
              <span>Shipping</span>
              {shipping === 0 ? (
                <span className="text-green-600 font-medium">Free</span>
              ) : (
                <PriceFormatter amount={shipping} />
              )}
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
          <Button
            onClick={handlePayNowClick}
            disabled={isPlacingOrder || !checkoutAddressReady || cart.length === 0}
            className="w-full h-12 text-lg font-semibold bg-shop_dark_green hover:bg-shop_light_green text-white shadow-md hover:shadow-shop_orange/20"
            size="lg"
          >
            {isPlacingOrder && actionType === "pay" ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Pay Now
                {totalPackagingFee > 0 && ` (+$${totalPackagingFee.toFixed(2)})`}
              </div>
            )}
          </Button>

          <Button
            onClick={() => handlePlaceOrder("order")}
            disabled={isPlacingOrder || !checkoutAddressReady || cart.length === 0}
            variant="outline"
            className="w-full h-12 text-lg font-semibold border-shop_dark_green text-shop_dark_green hover:bg-shop_light_bg"
            size="lg"
          >
            {isPlacingOrder && actionType === "order" ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
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
          {selectedPaymentMethod === PAYMENT_METHODS.STRIPE ? (
            <>
              <p>🔒 Secure checkout powered by Stripe</p>
              <p>Your payment information is encrypted and secure</p>
            </>
          ) : (
            <>
              <p>💵 Pay when your order arrives</p>
              <p>Cash payment to delivery agent</p>
            </>
          )}
        </div>
      </div>

      {/* Order Placement Overlay */}
      {isPlacingOrder && (
        <OrderPlacementOverlay
          step={orderStep}
          isCheckoutRedirect={actionType === "pay"}
        />
      )}

      {/* Payment Method Selection Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            className={cn(
              "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg"
            )}
          >
            <VisuallyHidden.Root>
              <DialogTitle>Select Payment Method</DialogTitle>
            </VisuallyHidden.Root>
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-shop_light_bg border-4 border-shop_orange/30">
                <CreditCard className="h-8 w-8 text-shop_light_green" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-shop_dark_green">
                  Choose Payment Method
                </h3>
                <p className="text-light-color leading-relaxed">
                  Select your preferred payment gateway to complete your order
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-6">
              <Button
                onClick={() => handlePaymentMethodSelect("stripe")}
                className="w-full h-12 bg-shop_dark_green hover:bg-shop_light_green text-white font-semibold shadow-md hover:shadow-shop_orange/20 transition-colors"
                disabled={isPlacingOrder}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Pay with Stripe
              </Button>
            </div>
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </div>
  );
}