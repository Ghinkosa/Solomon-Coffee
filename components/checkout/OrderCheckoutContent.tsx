"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Truck,
  MapPin,
  Package,
  ArrowLeft,
  Loader2,
  Lock,
  Banknote,
} from "lucide-react";
import PriceFormatter from "@/components/PriceFormatter";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { toast } from "sonner";
import { PAYMENT_METHODS, PaymentMethod } from "@/lib/orderStatus";
import Link from "next/link";
import { useLocalizedPath } from "@/hooks/useLocale";
import { Badge } from "@/components/ui/badge";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";

interface OrderProduct {
  product: {
    _id: string;
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    images?: any[];
    price: number;
    currency: string;
  };
  quantity: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  products: OrderProduct[];
  subtotal: number;
  tax: number;
  shipping: number;
  totalPrice: number;
  currency: string;
  address: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  status: string;
  paymentStatus: string;
  orderDate: string;
}

interface OrderCheckoutContentProps {
  order: Order;
}

export function OrderCheckoutContent({ order }: OrderCheckoutContentProps) {
  const dictionary = useDictionary();
  const checkoutCopy = (dictionary?.checkout ?? {}) as Record<string, unknown>;
  const orderPayment = checkoutCopy.orderPayment as Record<string, unknown> | undefined;
  const orderToasts = orderPayment?.toasts as Record<string, string> | undefined;
  const summary = (dictionary?.cart as Record<string, unknown>)?.summary as
    | Record<string, string>
    | undefined;
  const toLocalizedPath = useLocalizedPath();
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>(PAYMENT_METHODS.STRIPE);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayNow = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch(`/api/orders/${order._id}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        toast.error(
          data.error ||
            (orderToasts?.paymentSessionFailed ??
              t(dictionary, "checkout.orderPayment.toasts.paymentSessionFailed", "Failed to create payment session")),
        );
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(
        orderToasts?.paymentInitFailed ??
          t(dictionary, "checkout.orderPayment.toasts.paymentInitFailed", "Failed to initiate payment"),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCODPayment = async () => {
    setIsProcessing(true);

    try {
      // Here you could implement COD logic if needed
      // For now, just show a message
      toast.success(
        orderToasts?.codConfirmed ??
          t(
            dictionary,
            "checkout.orderPayment.toasts.codConfirmed",
            "Order confirmed with Cash on Delivery payment method",
          ),
      );

      setTimeout(() => {
        window.location.href = `/user/orders/${order._id}`;
      }, 1500);
    } catch (error) {
      console.error("COD payment error:", error);
      toast.error(
        orderToasts?.codFailed ??
          t(dictionary, "checkout.orderPayment.toasts.codFailed", "Failed to process COD payment"),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Order Details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Order Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {String(orderPayment?.orderNumber ?? t(dictionary, "checkout.orderPayment.orderNumber", "Order"))} #{order.orderNumber?.slice(-8)}
              </CardTitle>
              <Badge variant="outline" className="capitalize">
                {order.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">
                  {String(orderPayment?.customer ?? t(dictionary, "checkout.orderPayment.customer", "Customer"))}
                </p>
                <p className="font-medium">{order.customerName}</p>
                <p className="text-muted-foreground">{order.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">
                  {String(orderPayment?.orderDate ?? t(dictionary, "checkout.orderPayment.orderDate", "Order Date"))}
                </p>
                <p className="font-medium">
                  {new Date(order.orderDate).toLocaleDateString()}
                </p>
              </div>
            </div>
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
            <div className="space-y-1">
              <p className="font-medium">{order.address.name}</p>
              <p className="text-muted-foreground">{order.address.address}</p>
              <p className="text-muted-foreground">
                {order.address.city}, {order.address.state} {order.address.zip}
              </p>
            </div>
          </CardContent>
        </Card>

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
                      {String(orderPayment?.codShort ?? t(dictionary, "checkout.orderPayment.codShort", "Cash on Delivery"))}
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
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>
              {String(checkoutCopy.orderItems ?? t(dictionary, "checkout.orderItems", "Order Items"))} ({order.products.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.products.map((item, index) => (
              <div key={index} className="flex gap-3 p-3 border rounded-lg">
                <div className="w-16 h-16 flex-shrink-0">
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
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    <PriceFormatter
                      amount={item.product.price * item.quantity}
                    />
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <PriceFormatter amount={item.product.price} />{" "}
                    {String(checkoutCopy.each ?? t(dictionary, "checkout.each", "each"))}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Order Summary & Actions */}
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
                )).replace("{count}", String(order.products.length))}
              </span>
              <PriceFormatter amount={order.subtotal} />
            </div>
            <div className="flex justify-between">
              <span>{summary?.shipping ?? "Shipping"}</span>
              {order.shipping === 0 ? (
                <span className="text-green-600 font-medium">
                  {summary?.free ?? t(dictionary, "common.free", "Free")}
                </span>
              ) : (
                <PriceFormatter amount={order.shipping} />
              )}
            </div>
            <div className="flex justify-between">
              <span>{summary?.tax ?? "Tax"}</span>
              <PriceFormatter amount={order.tax} />
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>{summary?.total ?? "Total"}</span>
              <PriceFormatter amount={order.totalPrice} />
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={
            selectedPaymentMethod === PAYMENT_METHODS.STRIPE
              ? handlePayNow
              : handleCODPayment
          }
          disabled={isProcessing}
          className="w-full h-12 text-lg font-semibold"
          size="lg"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {String(checkoutCopy.processing ?? t(dictionary, "checkout.processing", "Processing..."))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {selectedPaymentMethod === PAYMENT_METHODS.STRIPE ? (
                <>
                  <CreditCard className="w-5 h-5" />
                  {String(orderPayment?.pay ?? t(dictionary, "checkout.orderPayment.pay", "Pay"))}{" "}
                  <PriceFormatter amount={order.totalPrice} />
                </>
              ) : (
                <>
                  <Truck className="w-5 h-5" />
                  {String(
                    orderPayment?.confirmCod ??
                      t(dictionary, "checkout.orderPayment.confirmCod", "Confirm COD Order"),
                  )}
                </>
              )}
            </div>
          )}
        </Button>

        <Button asChild variant="outline" className="w-full">
          <Link href={toLocalizedPath("/user/orders")} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {String(
              orderPayment?.backToOrders ??
                t(dictionary, "checkout.orderPayment.backToOrders", "Back to Orders"),
            )}
          </Link>
        </Button>

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
    </div>
  );
}
