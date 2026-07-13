"use client";

import { useState } from "react";
import Container from "@/components/Container";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import PriceFormatter from "@/components/PriceFormatter";
import { format } from "date-fns";
import { Loader2, Package, Search } from "lucide-react";

interface GuestOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  totalPrice?: number;
  orderDate?: string;
  products?: Array<{
    quantity: number;
    product?: { name?: string };
  }>;
  address?: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

export default function TrackOrderClient({ dictionary }: { dictionary: any }) {
  const t = dictionary?.ordersTrack ?? {};
  const statusLabels = (t.statusLabels ?? {}) as Record<string, string>;

  const formatOrderStatus = (status?: string) => {
    if (!status) {
      return statusLabels.pending ?? "Pending";
    }
    return (
      statusLabels[status] ??
      status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    );
  };

  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<GuestOrder | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState("");

  // A guest can still owe money on a card order if their checkout failed or was
  // abandoned. Offer a retry that re-opens Stripe for that specific order.
  const canPayOnline =
    !!order &&
    order.paymentStatus !== "paid" &&
    order.status !== "cancelled" &&
    order.paymentMethod !== "cash_on_delivery";

  const handlePayNow = async () => {
    if (!order) return;
    setPayError("");
    setIsPaying(true);

    try {
      const response = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order._id,
          orderNumber: order.orderNumber,
          email: order.email,
          isGuest: true,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.url) {
        setPayError(
          data.error || t.paymentFailed || "Could not start payment. Please try again.",
        );
        return;
      }

      window.location.href = data.url;
    } catch {
      setPayError(t.paymentFailed || "Could not start payment. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  const handleLookup = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setOrder(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t.orderNotFound || "Order not found");
        return;
      }

      setOrder(data.order);
    } catch {
      setError(t.lookupFailed || "Failed to look up order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-8">
      <DynamicBreadcrumb
        customItems={[
          { label: t.breadcrumbHome ?? "Home", href: "/" },
          { label: t.breadcrumbTrack ?? "Track Order" },
        ]}
        className="mb-6"
      />

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{t.title ?? "Track your order"}</h1>
          <p className="text-muted-foreground">
            {t.subtitle ?? "Enter your order number and email to view your order status."}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              {t.lookupTitle ?? "Order lookup"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLookup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="order-number">{t.orderNumber ?? "Order number"}</Label>
                <Input
                  id="order-number"
                  value={orderNumber}
                  onChange={(event) => setOrderNumber(event.target.value)}
                  placeholder={t.orderNumberPlaceholder ?? "ORDER-..."}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-email">{t.email ?? "Email address"}</Label>
                <Input
                  id="order-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 me-2 animate-spin" />
                    {t.lookingUp ?? "Looking up order..."}
                  </>
                ) : (
                  t.findOrder ?? "Find order"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {order && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {order.orderNumber}
                </span>
                <Badge className="capitalize">
                  {formatOrderStatus(order.status)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm">
                <p>
                  <span className="font-medium">{t.customer ?? "Customer"}:</span>{" "}
                  {order.customerName}
                </p>
                <p>
                  <span className="font-medium">{t.placed ?? "Placed"}:</span>{" "}
                  {order.orderDate
                    ? format(new Date(order.orderDate), "MMM dd, yyyy")
                    : t.notAvailable ?? "N/A"}
                </p>
                <p>
                  <span className="font-medium">{t.total ?? "Total"}:</span>{" "}
                  <PriceFormatter amount={order.totalPrice || 0} />
                </p>
                {order.address && (
                  <p>
                    <span className="font-medium">{t.shipTo ?? "Ship to"}:</span>{" "}
                    {order.address.address}, {order.address.city},{" "}
                    {order.address.state} {order.address.zip}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">{t.items ?? "Items"}</h3>
                {order.products?.map((line, index) => (
                  <div
                    key={`${line.product?.name}-${index}`}
                    className="flex justify-between text-sm border rounded-lg p-3"
                  >
                    <span>
                      {line.product?.name || t.product || "Product"} x {line.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {canPayOnline && (
                <div className="space-y-2 border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    {t.paymentPending ??
                      "This order hasn't been paid yet. You can complete your payment securely below."}
                  </p>
                  {payError && (
                    <p className="text-sm text-red-600">{payError}</p>
                  )}
                  <Button
                    onClick={handlePayNow}
                    disabled={isPaying}
                    className="w-full"
                  >
                    {isPaying ? (
                      <>
                        <Loader2 className="w-4 h-4 me-2 animate-spin" />
                        {t.redirectingToPayment ?? "Redirecting to payment..."}
                      </>
                    ) : (
                      t.payNow ?? "Pay Now"
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
}
