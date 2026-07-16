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
  Check,
  Lock,
  Banknote,
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
  getAccountDiscount,
} from "@/lib/checkout-pricing";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";
import { getGrindLabel } from "@/lib/i18n-nav";

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
  const dictionary = useDictionary();
  const checkoutCopy = (dictionary?.checkout ?? {}) as Record<string, unknown>;
  const toasts = checkoutCopy.toasts as Record<string, string> | undefined;
  const paymentModal = checkoutCopy.paymentModal as Record<string, string> | undefined;
  const redirectingCopy = checkoutCopy.redirecting as Record<string, string> | undefined;
  const summary = (dictionary?.cart as Record<string, unknown>)?.summary as
    | Record<string, string>
    | undefined;
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const {
    items: cart,
    openAuthSidebar,
    resetCart,
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
    premiumStatus?: string;
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
  const [destinationTax, setDestinationTax] = useState<{
    stateCode: string;
    taxRate: number;
    taxShipping: boolean;
    flatShippingFee: number;
    freeShippingThreshold: number;
    businessDiscountRate: number;
    premiumDiscountRate: number;
    businessDiscountPercent: number;
    premiumDiscountPercent: number;
  } | null>(null);
  const [taxLoading, setTaxLoading] = useState(false);
  const [selectionsData, setSelectionsData] = useState<Array<{
    productId: string;
    weight: WeightOption | null;
    grind: GrindOption | null;
    packaging: PackagingOption | null;
  }>>([]);

  // Parse selections from URL params
  useEffect(() => {
    const selectionsParam = searchParams.get("selections");

    if (selectionsParam) {
      try {
        const decodedSelections = JSON.parse(decodeURIComponent(selectionsParam));
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

  const destinationState = useMemo(() => {
    if (!user) {
      return guestDetails.state?.trim().toUpperCase() || "";
    }
    return selectedAddress?.state?.trim().toUpperCase() || "";
  }, [user, guestDetails.state, selectedAddress?.state]);

  useEffect(() => {
    let cancelled = false;
    setTaxLoading(true);

    const query =
      destinationState.length === 2
        ? `?state=${encodeURIComponent(destinationState)}`
        : "";

    fetch(`/api/checkout/tax${query}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load tax");
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        setDestinationTax({
          stateCode: data.stateCode,
          taxRate: typeof data.taxRate === "number" ? data.taxRate : 0,
          taxShipping: Boolean(data.taxShipping),
          flatShippingFee:
            typeof data.flatShippingFee === "number"
              ? data.flatShippingFee
              : 10,
          freeShippingThreshold:
            typeof data.freeShippingThreshold === "number"
              ? data.freeShippingThreshold
              : 100,
          businessDiscountRate:
            typeof data.businessDiscountRate === "number"
              ? data.businessDiscountRate
              : 0.02,
          premiumDiscountRate:
            typeof data.premiumDiscountRate === "number"
              ? data.premiumDiscountRate
              : 0.05,
          businessDiscountPercent:
            typeof data.businessDiscountPercent === "number"
              ? data.businessDiscountPercent
              : 2,
          premiumDiscountPercent:
            typeof data.premiumDiscountPercent === "number"
              ? data.premiumDiscountPercent
              : 5,
        });
      })
      .catch((error) => {
        console.error("Destination tax lookup failed:", error);
        if (!cancelled) {
          setDestinationTax(null);
        }
      })
      .finally(() => {
        if (!cancelled) setTaxLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [destinationState]);

  const checkoutTotals = useMemo(() => {
    const lines = cart.map((item) => resolveCheckoutLine(item, selectionsData));

    const accountDiscount = getAccountDiscount(userProfile, {
      businessRate: destinationTax?.businessDiscountRate,
      premiumRate: destinationTax?.premiumDiscountRate,
    });

    return {
      ...calculateCheckoutTotals({
        items: buildCheckoutPricingItems(lines),
        businessDiscountRate: accountDiscount.rate,
        taxRate: destinationTax?.taxRate ?? 0,
        taxShipping: destinationTax?.taxShipping ?? false,
        flatShippingFee: destinationTax?.flatShippingFee ?? 10,
        freeShippingThreshold:
          destinationTax?.freeShippingThreshold ?? 100,
      }),
      accountDiscountType: accountDiscount.type,
    };
  }, [cart, selectionsData, userProfile, destinationTax]);

  const grossSubtotal = checkoutTotals.subtotal;
  const totalDiscount = checkoutTotals.productDiscount;
  const currentSubtotal = grossSubtotal - totalDiscount;
  const businessDiscount = checkoutTotals.businessDiscount;
  const accountDiscountType = checkoutTotals.accountDiscountType;
  const totalPackagingFee = checkoutTotals.packagingFee;
  const subtotalWithPackaging =
    currentSubtotal - businessDiscount + totalPackagingFee;
  const shipping = checkoutTotals.shipping;
  const tax = checkoutTotals.tax;
  const total = checkoutTotals.total;
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
              premiumStatus: data.userProfile.premiumStatus || "none",
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

        toast.success(
          toasts?.readyTitle ?? t(dictionary, "checkout.toasts.readyTitle", "Ready for Checkout!"),
          {
            description:
              toasts?.readyDescription ??
              t(
                dictionary,
                "checkout.toasts.readyDescription",
                "Complete your order by selecting a payment method below",
              ),
            duration: 4000,
          },
        );
      } catch (error) {
        console.error("Error parsing address from URL:", error);
        toast.error(
          toasts?.addressLoadError ??
            t(dictionary, "checkout.toasts.addressLoadError", "Error loading address from cart"),
        );
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
    const validationMessage = getGuestCheckoutValidationMessage(
      guestDetails,
      dictionary,
    );
    if (validationMessage) {
      toast.error(
        toasts?.fixShipping ??
          t(dictionary, "checkout.toasts.fixShipping", "Please fix your shipping details"),
        {
          description: validationMessage,
        },
      );
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
          ? (toasts?.selectAddress ??
              t(dictionary, "checkout.toasts.selectAddress", "Please select a shipping address"))
          : (toasts?.completeGuest ??
              t(
                dictionary,
                "checkout.toasts.completeGuest",
                "Please complete your guest checkout details",
              )),
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
          ? (toasts?.selectAddress ??
              t(dictionary, "checkout.toasts.selectAddress", "Please select a shipping address"))
          : (toasts?.completeGuest ??
              t(
                dictionary,
                "checkout.toasts.completeGuest",
                "Please complete your guest checkout details",
              )),
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
      // Only clear the cart once payment is actually committed (COD) or we have
      // a real Stripe redirect URL. Failed Stripe sessions keep the cart intact
      // so the customer can retry — useOrderPlacement already resets on success.
      if (result.isStripeRedirect || result.isCOD) {
        resetCart();
      }
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
  const taxQuoteReady =
    !destinationState || (!taxLoading && destinationTax !== null);
  const canSubmitCheckout =
    checkoutAddressReady && taxQuoteReady && cart.length > 0 && !isPlacingOrder;

  if (!isLoaded) {
    return <CheckoutSkeleton />;
  }

  if (isRedirecting) {
    return (
      <div className="text-center py-10">
        <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-shop_light_green" />
        <h2 className="text-xl font-semibold mb-2 text-shop_dark_green">
          {redirectingCopy?.title ??
            t(dictionary, "checkout.redirecting.title", "Processing your order...")}
        </h2>
        <p className="text-muted-foreground">
          {redirectingCopy?.description ??
            t(
              dictionary,
              "checkout.redirecting.description",
              "Please wait while we redirect you to complete your payment.",
            )}
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
        <h2 className="text-2xl font-semibold mb-2">{String((checkoutCopy.empty as Record<string,string>)?.title ?? t(dictionary, "checkout.empty.title", "Your cart is empty"))}</h2>
        <p className="text-muted-foreground mb-4">
          {String(
            (checkoutCopy.empty as Record<string, string>)?.description ??
              t(dictionary, "checkout.emptyCartHint", "Add some products to continue with checkout"),
          )}
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <a href={toLocalizedPath("/shop")}>{String((checkoutCopy.empty as Record<string,string>)?.cta ?? t(dictionary, "checkout.empty.cta", "Continue Shopping"))}</a>
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
                  {String(checkoutCopy.signInPrompt ?? t(dictionary, "checkout.signInPrompt", "Already have an account? Sign in for faster checkout and order history."))}
                </p>
                <Button variant="outline" onClick={() => openAuthSidebar("signIn")}>
                  {String(checkoutCopy.signIn ?? t(dictionary, "checkout.signIn", "Sign in"))}
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
              {String(checkoutCopy.paymentMethod ?? t(dictionary, "checkout.paymentMethod", "Payment Method"))}
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
                      {String(checkoutCopy.cod ?? t(dictionary, "checkout.cod", "Cash on Delivery (Pay Later)"))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {String(
                        checkoutCopy.codDescription ??
                          t(
                            dictionary,
                            "checkout.codDescription",
                            "Pay when your order is delivered to your doorstep",
                          ),
                      )}
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
                      {String(checkoutCopy.card ?? t(dictionary, "checkout.card", "Credit / Debit Card"))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {String(
                        checkoutCopy.cardDescription ??
                          t(
                            dictionary,
                            "checkout.cardDescription",
                            "Pay securely with your credit or debit card via Stripe",
                          ),
                      )}
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
              {String(checkoutCopy.shippingAddress ?? t(dictionary, "checkout.shippingAddress", "Shipping Address"))}
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
                    <div className="flex items-center gap-1 text-xs text-shop_light_green font-medium bg-shop_light_green/10 px-2 py-1 rounded">
                      <Check className="h-3.5 w-3.5" />
                      {String(checkoutCopy.addressSelected ?? t(dictionary, "checkout.addressSelected", "Selected"))}
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
            <CardTitle>{String(checkoutCopy.orderItems ?? t(dictionary, "checkout.orderItems", "Order Items"))} ({cart.length})</CardTitle>
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
                          : "/placeholder.png"
                      }
                      alt={item.product.name || t(dictionary, "ordersTrack.product", "Product")}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {String(checkoutCopy.qty ?? t(dictionary, "checkout.qty", "Qty"))}: {item.quantity}
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
                          {getGrindLabel(dictionary, item.selectedGrind.grindType)}
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
                      <PriceFormatter amount={itemPrice} />{" "}
                      {String(checkoutCopy.each ?? t(dictionary, "checkout.each", "each"))}
                      {packagingPrice > 0 &&
                        ` + $${packagingPrice} ${String(checkoutCopy.packagingExtra ?? t(dictionary, "checkout.packagingExtra", "packaging"))}`}
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
            <CardTitle>{t(dictionary, "cart.summary.title", "Order Summary")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>
                {(String(
                  checkoutCopy.subtotalWithCount ??
                    t(dictionary, "checkout.subtotalWithCount", "Subtotal ({count} items)"),
                )).replace("{count}", String(cart.length))}
              </span>
              <PriceFormatter amount={grossSubtotal} />
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>{summary?.discount ?? "Discount"}</span>
                <span>
                  -<PriceFormatter amount={totalDiscount} />
                </span>
              </div>
            )}
            {businessDiscount > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>
                  {accountDiscountType === "premium"
                    ? String(
                        checkoutCopy.premiumDiscount ??
                          t(
                            dictionary,
                            "checkout.premiumDiscount",
                            "Premium Member Discount ({percent}%)",
                          ),
                      ).replace(
                        "{percent}",
                        String(
                          destinationTax?.premiumDiscountPercent ?? 5,
                        ),
                      )
                    : String(
                        checkoutCopy.businessDiscount ??
                          t(
                            dictionary,
                            "checkout.businessDiscount",
                            "Business Account Discount ({percent}%)",
                          ),
                      ).replace(
                        "{percent}",
                        String(
                          destinationTax?.businessDiscountPercent ?? 2,
                        ),
                      )}
                </span>
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
                  <span>{String(checkoutCopy.packaging ?? t(dictionary, "checkout.packaging", "Packaging"))}</span>
                </div>
                <PriceFormatter amount={totalPackagingFee} />
              </div>
            )}
            
            <div className="flex justify-between">
              <span>{summary?.shipping ?? "Shipping"}</span>
              {shipping === 0 ? (
                <span className="text-green-600 font-medium">
                  {summary?.free ?? t(dictionary, "common.free", "Free")}
                </span>
              ) : (
                <PriceFormatter amount={shipping} />
              )}
            </div>
            <div className="flex justify-between">
              <span>{summary?.tax ?? "Tax"}</span>
              {!destinationState ? (
                <span className="text-sm text-muted-foreground">
                  {String(
                    checkoutCopy.taxAfterAddress ??
                      t(
                        dictionary,
                        "checkout.taxAfterAddress",
                        "Calculated after address",
                      ),
                  )}
                </span>
              ) : taxLoading ? (
                <span className="text-sm text-muted-foreground">
                  {String(
                    checkoutCopy.taxLoading ??
                      t(dictionary, "checkout.taxLoading", "Calculating..."),
                  )}
                </span>
              ) : (
                <PriceFormatter amount={tax} />
              )}
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>{summary?.total ?? "Total"}</span>
              <PriceFormatter amount={total} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            onClick={handlePayNowClick}
            disabled={!canSubmitCheckout}
            className="w-full h-12 text-lg font-semibold bg-shop_dark_green hover:bg-shop_light_green text-white shadow-md hover:shadow-shop_orange/20"
            size="lg"
          >
            {isPlacingOrder && actionType === "pay" ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {String(checkoutCopy.processing ?? t(dictionary, "checkout.processing", "Processing..."))}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {String(checkoutCopy.payNow ?? t(dictionary, "checkout.payNow", "Pay Now"))}
                {totalPackagingFee > 0 && ` (+$${totalPackagingFee.toFixed(2)})`}
              </div>
            )}
          </Button>

          <Button
            onClick={() => handlePlaceOrder("order")}
            disabled={!canSubmitCheckout}
            variant="outline"
            className="w-full h-12 text-lg font-semibold border-shop_dark_green text-shop_dark_green hover:bg-shop_light_bg hover:text-shop_dark_green"
            size="lg"
          >
            {isPlacingOrder && actionType === "order" ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {String(
                  checkoutCopy.placingOrder ??
                    t(dictionary, "checkout.placingOrder", "Placing Order..."),
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {String(checkoutCopy.placeOrder ?? t(dictionary, "checkout.placeOrder", "Place Order (Pay Later)"))}
                {totalPackagingFee > 0 && ` (+$${totalPackagingFee.toFixed(2)})`}
              </div>
            )}
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          {selectedPaymentMethod === PAYMENT_METHODS.STRIPE ? (
            <>
              <p className="inline-flex items-center justify-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-shop_dark_green" />
                {String(
                  checkoutCopy.stripeSecure ??
                    t(dictionary, "checkout.stripeSecure", "Secure checkout powered by Stripe"),
                )}
              </p>
              <p>
                {String(
                  checkoutCopy.stripeEncrypted ??
                    t(
                      dictionary,
                      "checkout.stripeEncrypted",
                      "Your payment information is encrypted and secure",
                    ),
                )}
              </p>
            </>
          ) : (
            <>
              <p className="inline-flex items-center justify-center gap-1.5">
                <Banknote className="h-3.5 w-3.5 text-shop_orange" />
                {String(
                  checkoutCopy.codPayOnArrival ??
                    t(dictionary, "checkout.codPayOnArrival", "Pay when your order arrives"),
                )}
              </p>
              <p>
                {String(
                  checkoutCopy.codCashToAgent ??
                    t(dictionary, "checkout.codCashToAgent", "Cash payment to delivery agent"),
                )}
              </p>
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
              <DialogTitle>
                {paymentModal?.title ??
                  t(dictionary, "checkout.paymentModal.title", "Select Payment Method")}
              </DialogTitle>
            </VisuallyHidden.Root>
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-shop_light_bg border-4 border-shop_orange/30">
                <CreditCard className="h-8 w-8 text-shop_light_green" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-shop_dark_green">
                  {paymentModal?.heading ??
                    t(dictionary, "checkout.paymentModal.heading", "Choose Payment Method")}
                </h3>
                <p className="text-light-color leading-relaxed">
                  {paymentModal?.description ??
                    t(
                      dictionary,
                      "checkout.paymentModal.description",
                      "Select your preferred payment gateway to complete your order",
                    )}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-6">
              <Button
                onClick={() => handlePaymentMethodSelect("stripe")}
                className="w-full h-12 bg-shop_dark_green hover:bg-shop_light_green text-white font-semibold shadow-md hover:shadow-shop_orange/20 transition-colors"
                disabled={isPlacingOrder}
              >
                <CreditCard className="w-5 h-5 me-2" />
                {paymentModal?.payWithStripe ??
                  t(dictionary, "checkout.paymentModal.payWithStripe", "Pay with Stripe")}
              </Button>
            </div>
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">{t(dictionary, "common.close", "Close")}</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </div>
  );
}