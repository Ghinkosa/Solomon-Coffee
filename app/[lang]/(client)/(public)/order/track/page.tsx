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

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<GuestOrder | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
        setError(data.error || "Order not found");
        return;
      }

      setOrder(data.order);
    } catch {
      setError("Failed to look up order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-8">
      <DynamicBreadcrumb
        customItems={[
          { label: "Home", href: "/" },
          { label: "Track Order" },
        ]}
        className="mb-6"
      />

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Track your order</h1>
          <p className="text-muted-foreground">
            Enter your order number and email to view your order status.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Order lookup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLookup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="order-number">Order number</Label>
                <Input
                  id="order-number"
                  value={orderNumber}
                  onChange={(event) => setOrderNumber(event.target.value)}
                  placeholder="ORDER-..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-email">Email</Label>
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
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Looking up order...
                  </>
                ) : (
                  "Find order"
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
                <Badge className="capitalize">{order.status || "pending"}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm">
                <p>
                  <span className="font-medium">Customer:</span>{" "}
                  {order.customerName}
                </p>
                <p>
                  <span className="font-medium">Placed:</span>{" "}
                  {order.orderDate
                    ? format(new Date(order.orderDate), "MMM dd, yyyy")
                    : "N/A"}
                </p>
                <p>
                  <span className="font-medium">Total:</span>{" "}
                  <PriceFormatter amount={order.totalPrice || 0} />
                </p>
                {order.address && (
                  <p>
                    <span className="font-medium">Ship to:</span>{" "}
                    {order.address.address}, {order.address.city},{" "}
                    {order.address.state} {order.address.zip}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Items</h3>
                {order.products?.map((line, index) => (
                  <div
                    key={`${line.product?.name}-${index}`}
                    className="flex justify-between text-sm border rounded-lg p-3"
                  >
                    <span>
                      {line.product?.name || "Product"} x {line.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
}
