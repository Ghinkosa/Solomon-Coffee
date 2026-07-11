"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  CalendarDays,
  MapPin,
  Package,
  CreditCard,
  Download,
  Truck,
  Clock,
  XCircle,
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  X,
  Scale,
  Coffee,
  Box,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { urlFor } from "@/sanity/lib/image";
import PriceFormatter from "./PriceFormatter";
import { format } from "date-fns";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/orderStatus";
import { toast } from "sonner";
import useCartStore from "@/store";
import { useLocalizedPath } from "@/hooks/useLocale";
import OrderTimeline from "./OrderTimeline";
import { requestOrderCancellation } from "@/actions/orderCancellationActions";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";
import { getGrindLabel } from "@/lib/i18n-nav";

interface OrderDetailsPageProps {
  order: {
    _id: string;
    orderNumber: string;
    clerkUserId: string;
    customerName: string;
    email: string;
    products: Array<{
      product: {
        _id: string;
        name: string;
        slug?: { current: string };
        image?: { asset: { url: string } };
        price: number;
        currency: string;
        categories?: Array<{ title: string }>;
      };
      quantity: number;
      weight?: {
        value: string;
        price: number;
      };
      grind?: {
        type: string;
        label: string;
      };
      packaging?: {
        id: string;
        title: string;
        price: number;
      };
    }>;
    subtotal: number;
    tax: number;
    shipping: number;
    totalPrice: number;
    currency: string;
    amountDiscount: number;
    address: {
      name: string;
      address: string;
      city: string;
      state: string;
      zip: string;
    };
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    orderDate: string;
    invoice?: {
      id: string;
      number: string;
      hosted_invoice_url: string;
    };
    stripeCheckoutSessionId?: string;
    stripePaymentIntentId?: string;
    paymentCompletedAt?: string;
    addressConfirmedAt?: string;
    addressConfirmedBy?: string;
    orderConfirmedAt?: string;
    orderConfirmedBy?: string;
    packedAt?: string;
    packedBy?: string;
    cashCollectedAt?: string;
    deliveredAt?: string;
    deliveredBy?: string;
    assignedDeliverymanName?: string;
    dispatchedAt?: string;
  };
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case ORDER_STATUSES.PAID:
    case ORDER_STATUSES.DELIVERED:
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case ORDER_STATUSES.CANCELLED:
      return <XCircle className="w-5 h-5 text-red-500" />;
    case ORDER_STATUSES.SHIPPED:
    case ORDER_STATUSES.OUT_FOR_DELIVERY:
      return <Truck className="w-5 h-5 text-blue-500" />;
    default:
      return <Clock className="w-5 h-5 text-yellow-500" />;
  }
};

const getPaymentStatusIcon = (status: string) => {
  switch (status) {
    case PAYMENT_STATUSES.PAID:
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case PAYMENT_STATUSES.FAILED:
    case PAYMENT_STATUSES.CANCELLED:
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-yellow-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case ORDER_STATUSES.PAID:
    case ORDER_STATUSES.DELIVERED:
      return "bg-green-100 text-green-800";
    case ORDER_STATUSES.CANCELLED:
      return "bg-red-100 text-red-800";
    case ORDER_STATUSES.SHIPPED:
    case ORDER_STATUSES.OUT_FOR_DELIVERY:
      return "bg-blue-100 text-blue-800";
    case ORDER_STATUSES.PROCESSING:
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case PAYMENT_STATUSES.PAID:
      return "bg-green-100 text-green-800";
    case PAYMENT_STATUSES.FAILED:
    case PAYMENT_STATUSES.CANCELLED:
      return "bg-red-100 text-red-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};

const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({ order }) => {
  const dictionary = useDictionary();
  const toLocalizedPath = useLocalizedPath();
  const d = (path: string, fallback: string) =>
    t(dictionary, `userDashboard.orders.detail.${path}`, fallback);
  const l = (path: string, fallback: string) =>
    t(dictionary, `userDashboard.orders.list.${path}`, fallback);

  const getStatusLabel = (status?: string | null) => {
    if (!status) return l("status.pending", "Pending");
    const key = status.toLowerCase().replace(/\s+/g, "_");
    if (key === "address_confirmed") {
      return d("address_confirmed", "Address confirmed");
    }
    return l(`status.${key}`, status.charAt(0).toUpperCase() + status.slice(1));
  };

  const getPaymentStatusLabel = (status?: string | null) => {
    if (!status) return d("paymentStatus.pending", "Pending");
    const key = status.toLowerCase();
    return d(`paymentStatus.${key}`, status);
  };

  const getPaymentMethodLabel = (method: string) => {
    const key = method.toLowerCase();
    return d(`paymentMethods.${key}`, method.replace(/_/g, " "));
  };

  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(order);
  const [isReordering, setIsReordering] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const { addMultipleItems } = useCartStore();
  const router = useRouter();

  const handleReorder = async () => {
    setIsReordering(true);
    try {
      // Transform order products to cart format with options
      const cartItems = order.products.map(({ product, quantity, weight, grind, packaging }) => ({
        product: product as any,
        quantity,
        selectedWeight: weight ? {
          weight: weight.value,
          price: weight.price,
          isDefault: false,
          stock: 0,
        } : undefined,
        selectedGrind: grind ? {
          grindType: grind.type,
          isDefault: false,
          available: true,
        } : undefined,
        selectedPackaging: packaging ? {
          _id: packaging.id,
          title: packaging.title,
          price: packaging.price,
          slug: { current: packaging.title.toLowerCase() },
          default: false,
        } : undefined,
      }));

      // Add all items to cart at once
      addMultipleItems(cartItems);

      toast.success(
        d("toasts.reorderSuccess", "{count} items added to cart!").replace(
          "{count}",
          String(order.products.length)
        ),
        {
          description: d("toasts.reorderRedirect", "Redirecting to cart..."),
        }
      );

      // Redirect to cart after a short delay
      setTimeout(() => {
        router.push(toLocalizedPath("/cart"));
      }, 1000);
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error(d("toasts.reorderFailed", "Failed to reorder items. Please try again."));
    } finally {
      setIsReordering(false);
    }
  };

  const handleGenerateInvoice = async () => {
    setGeneratingInvoice(true);
    try {
      const response = await fetch(
        `/api/orders/${order._id}/generate-invoice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(
          data.message ||
            d("toasts.invoiceGenerated", "Invoice generated successfully!")
        );
        setCurrentOrder((prev) => ({
          ...prev,
          invoice: data.invoice,
        }));
      } else {
        console.error("Invoice generation failed:", data);
        const errorMessage =
          data.error || d("toasts.invoiceFailed", "Failed to generate invoice");
        const details = data.details ? ` Details: ${data.details}` : "";
        toast.error(errorMessage + details);
      }
    } catch (error) {
      console.error("Invoice generation error:", error);
      toast.error(
        d(
          "toasts.invoiceNetworkError",
          "Network error: Failed to generate invoice. Please try again."
        )
      );
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    try {
      const defaultReason = d("cancelledByCustomer", "Cancelled by customer");
      const result = await requestOrderCancellation(
        order._id,
        cancellationReason || defaultReason
      );

      if (result.success) {
        toast.success(result.message);
        setCurrentOrder(
          (prev) =>
            ({
              ...prev,
              cancellationRequested: true,
              cancellationRequestedAt: new Date().toISOString(),
              cancellationRequestReason:
                cancellationReason || defaultReason,
            } as any)
        );
        setShowCancelDialog(false);
        setCancellationReason("");
        router.refresh();
      } else {
        toast.error(
          result.message ||
            d("toasts.cancelFailed", "Failed to submit cancellation request")
        );
      }
    } catch (error) {
      console.error("Error requesting cancellation:", error);
      toast.error(
        d(
          "toasts.cancelError",
          "An error occurred while submitting the cancellation request"
        )
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const canCancelOrder = () => {
    const cancellableStatuses = ["pending", "address_confirmed"];
    return (
      cancellableStatuses.includes(currentOrder.status) &&
      currentOrder.status !== "cancelled" &&
      !(currentOrder as any).cancellationRequested
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {d("title", "Order Details")}
          </h1>
          <p className="text-gray-600 mt-1">
            {d("orderNumber", "Order #{number}").replace(
              "{number}",
              currentOrder.orderNumber
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {currentOrder.invoice?.hosted_invoice_url ? (
            <Button asChild variant="outline">
              <Link
                href={currentOrder.invoice.hosted_invoice_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="w-4 h-4 mr-2" />
                {d("downloadInvoice", "Download Invoice")}
              </Link>
            </Button>
          ) : currentOrder.paymentStatus === "paid" ||
            currentOrder.status === "paid" ? (
            <Button
              onClick={handleGenerateInvoice}
              disabled={generatingInvoice}
              variant="outline"
            >
              {generatingInvoice ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  {d("generatingInvoice", "Generating...")}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  {d("generateInvoice", "Generate Invoice")}
                </>
              )}
            </Button>
          ) : null}
          <Button
            onClick={handleReorder}
            disabled={isReordering}
            variant="outline"
            className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
          >
            {isReordering ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                {d("addingToCart", "Adding to Cart...")}
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                {d("reorder", "Reorder")}
              </>
            )}
          </Button>
          {canCancelOrder() && (
            <Button
              onClick={() => setShowCancelDialog(true)}
              disabled={isCancelling}
              variant="outline"
              className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
            >
              {isCancelling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                  {d("cancelling", "Cancelling...")}
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  {d("cancelOrder", "Cancel Order")}
                </>
              )}
            </Button>
          )}
          <Button asChild>
            <Link href={toLocalizedPath("/user/orders")}>
              {d("backToOrders", "← Back to Orders")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cancellation Request Notice */}
          {(currentOrder as any).cancellationRequested && (
            <Card className="border-orange-300 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {d("cancellationPendingTitle", "Cancellation Request Pending")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700">
                  {d(
                    "cancellationPendingDescription",
                    "Your cancellation request has been submitted and is awaiting admin review. You will be notified once it has been processed."
                  )}
                </p>
                {(currentOrder as any).cancellationRequestedAt && (
                  <p className="text-xs text-orange-600 mt-2">
                    {d("requestedOn", "Requested on: {date}").replace(
                      "{date}",
                      format(
                        new Date((currentOrder as any).cancellationRequestedAt),
                        "MMM dd, yyyy 'at' h:mm a"
                      )
                    )}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(currentOrder.status)}
                {d("orderStatusTitle", "Order Status")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    {d("orderStatusLabel", "Order Status")}
                  </p>
                  <Badge
                    className={`${getStatusColor(currentOrder.status)} mt-1`}
                  >
                    {getStatusLabel(currentOrder.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {d("paymentStatusLabel", "Payment Status")}
                  </p>
                  <Badge
                    className={`${getPaymentStatusColor(
                      currentOrder.paymentStatus
                    )} mt-1 flex items-center gap-1 w-fit`}
                  >
                    {getPaymentStatusIcon(currentOrder.paymentStatus)}
                    {getPaymentStatusLabel(currentOrder.paymentStatus)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {d("paymentMethodLabel", "Payment Method")}
                  </p>
                  <p className="font-medium flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    {getPaymentMethodLabel(currentOrder.paymentMethod)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {d("orderDateLabel", "Order Date")}
                  </p>
                  <p className="font-medium flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    {format(new Date(currentOrder.orderDate), "PPP")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <OrderTimeline order={currentOrder} />

          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {d("orderItems", "Order Items ({count})").replace(
                  "{count}",
                  String(order.products.length)
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.products?.map(
                  (
                    item: {
                      product: {
                        _id: string;
                        name: string;
                        slug?: { current: string };
                        image?: { asset: { url: string } };
                        price: number;
                        currency: string;
                        categories?: Array<{ title: string }>;
                      };
                      quantity: number;
                      weight?: {
                        value: string;
                        price: number;
                      };
                      grind?: {
                        type: string;
                        label: string;
                      };
                      packaging?: {
                        id: string;
                        title: string;
                        price: number;
                      };
                    },
                    index: number
                  ) => {
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 border rounded-lg"
                      >
                        {item.product.image && (
                          <div className="relative w-16 h-16 shrink-0">
                            <Image
                              src={urlFor(item.product.image).url()}
                              alt={item.product.name}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {item.product.slug ? (
                              <Link
                                href={toLocalizedPath(`/product/${item.product.slug.current}`)}
                                className="hover:text-shop_dark_green transition-colors"
                              >
                                {item.product.name}
                              </Link>
                            ) : (
                              item.product.name
                            )}
                          </h3>
                          
                          {/* Weight Option Display */}
                          {item.weight && item.weight.value && (
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                              <Scale className="w-3 h-3" />
                              <span>
                                {d("weight", "Weight: {value}").replace(
                                  "{value}",
                                  item.weight.value
                                )}
                              </span>
                              {item.weight.price > 0 && (
                                <>
                                  <span className="text-gray-400">|</span>
                                  <PriceFormatter amount={item.weight.price} />
                                </>
                              )}
                            </div>
                          )}
                          
                          {/* Grind Option Display */}
                          {item.grind && item.grind.type && (
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                              <Coffee className="w-3 h-3" />
                              <span>
                                {d("grind", "Grind: {value}").replace(
                                  "{value}",
                                  item.grind.label ||
                                    getGrindLabel(
                                      dictionary,
                                      item.grind.type
                                    )
                                )}
                              </span>
                            </div>
                          )}
                          
                          {/* Packaging Option Display */}
                          {item.packaging && item.packaging.title && (
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                              <Box className="w-3 h-3" />
                              <span>
                                {d("packaging", "Packaging: {value}").replace(
                                  "{value}",
                                  item.packaging.title
                                )}
                              </span>
                              {item.packaging.price > 0 && (
                                <span className="text-gray-400">(+${item.packaging.price})</span>
                              )}
                            </div>
                          )}
                          
                          {item.product.categories && item.product.categories.length > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                              {item.product.categories
                                .map((cat) => cat.title)
                                .join(", ")}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-gray-600">
                              {d("qty", "Qty: {count}").replace(
                                "{count}",
                                String(item.quantity)
                              )}
                            </span>
                            <PriceFormatter
                              amount={item.product.price}
                              className="font-medium"
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <PriceFormatter
                            amount={item.product.price * item.quantity}
                            className="font-medium text-lg"
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary & Address */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{d("orderSummary", "Order Summary")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{d("subtotal", "Subtotal")}</span>
                  <PriceFormatter amount={currentOrder.subtotal} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{d("tax", "Tax")}</span>
                  <PriceFormatter amount={currentOrder.tax} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{d("shipping", "Shipping")}</span>
                  <PriceFormatter amount={currentOrder.shipping} />
                </div>
                {currentOrder.amountDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{d("discount", "Discount")}</span>
                    <span>
                      -<PriceFormatter amount={currentOrder.amountDiscount} />
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>{d("total", "Total")}</span>
                  <PriceFormatter amount={currentOrder.totalPrice} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {d("shippingAddress", "Shipping Address")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-medium">{currentOrder.address.name}</p>
                <p className="text-gray-600">{currentOrder.address.address}</p>
                <p className="text-gray-600">
                  {currentOrder.address.city}, {currentOrder.address.state}{" "}
                  {currentOrder.address.zip}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>{d("customerInformation", "Customer Information")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <div>
                  <p className="font-medium">{currentOrder.customerName}</p>
                  <p className="text-gray-600">{currentOrder.email}</p>
                </div>
                {currentOrder.paymentCompletedAt && (
                  <div className="pt-2 border-t">
                    <p className="text-gray-600">
                      {d("paymentCompleted", "Payment Completed")}
                    </p>
                    <p className="font-medium">
                      {format(new Date(currentOrder.paymentCompletedAt), "PPp")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Order Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            className={cn(
              "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg"
            )}
          >
            <VisuallyHidden.Root>
              <DialogTitle>{d("cancelDialogTitle", "Request Order Cancellation")}</DialogTitle>
            </VisuallyHidden.Root>
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-shop_orange/10 border-4 border-shop_orange/25">
                <AlertTriangle className="h-8 w-8 text-shop_orange animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-shop_dark_green">
                  {d("cancelDialogTitle", "Request Order Cancellation")}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {d(
                    "cancelDialogDescription",
                    "Your cancellation request will be submitted to our team for review."
                  )}
                </p>

                {/* Cancellation Reason Input */}
                <div className="mt-4 text-left">
                  <label
                    htmlFor="cancellationReason"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {d("cancelReasonLabel", "Reason for cancellation (optional)")}
                  </label>
                  <textarea
                    id="cancellationReason"
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder={d(
                      "cancelReasonPlaceholder",
                      "e.g., Changed my mind, found a better deal..."
                    )}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-shop_light_green resize-none"
                    rows={3}
                  />
                </div>

                {currentOrder.paymentStatus === "paid" && (
                  <div className="mt-4 p-4 bg-shop_light_bg border border-shop_light_green/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0">
                        <CreditCard className="h-5 w-5 text-shop_light_green mt-0.5" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-shop_dark_green">
                          {d("refundTitle", "Refund Information")}
                        </p>
                        <p className="text-sm text-shop_btn_dark_green mt-1">
                          {d(
                            "refundDescription",
                            "If approved, your payment of {amount} will be refunded to your original payment method."
                          )
                            .split("{amount}")
                            .map((part, i, arr) =>
                              i < arr.length - 1 ? (
                                <React.Fragment key={i}>
                                  {part}
                                  <span className="font-bold">
                                    <PriceFormatter
                                      amount={currentOrder.totalPrice}
                                    />
                                  </span>
                                </React.Fragment>
                              ) : (
                                part
                              )
                            )}
                        </p>
                        <ul className="text-sm text-shop_btn_dark_green mt-2 space-y-1 list-disc list-inside">
                          <li>{d("refundTimeline", "Refunds typically take 5–10 business days")}</li>
                          <li>
                            {d("refundContact", "Contact support if you do not see the refund")}
                          </li>
                          <li>
                            {d("refundReview", "Our team reviews each cancellation request")}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelDialog(false);
                  setCancellationReason("");
                }}
                disabled={isCancelling}
                className="flex-1 border-gray-300 hover:bg-gray-50 font-medium"
              >
                {d("keepOrder", "Keep Order")}
              </Button>
              <Button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex-1 bg-shop_light_green hover:bg-shop_dark_green text-white focus:ring-shop_light_green font-semibold shadow-lg hover:shadow-shop_light_green/30"
              >
                {isCancelling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {d("submitting", "Submitting...")}
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    {d("submitRequest", "Submit Request")}
                  </>
                )}
              </Button>
            </div>
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">{d("close", "Close")}</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </div>
  );
};

export default OrderDetailsPage;