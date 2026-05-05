"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  CalendarDays,
  MapPin,
  Package,
  Truck,
  ShoppingCart,
  XCircle,
  PackageCheck,
  ExternalLink,
  ChevronRight,
  Info,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { urlFor } from "@/sanity/lib/image";
import PriceFormatter from "./PriceFormatter";
import { format } from "date-fns";
import { toast } from "sonner";
import useCartStore from "@/store";
import OrderTimeline from "./OrderTimeline";
import { requestOrderCancellation } from "@/actions/orderCancellationActions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "./ui/textarea";

interface OrderDetailsPageProps {
  order: any; // Using any for brevity, replace with your full interface
}

const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({ order }) => {
  const [currentOrder, setCurrentOrder] = useState(order);
  const [isReordering, setIsReordering] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const { addMultipleItems } = useCartStore();
  const router = useRouter();

  // Logic to separate the Default Package from Specific Shipments
  const { defaultPackage, trackedPackages } = useMemo(() => {
    const tracked: Record<string, any[]> = {};
    const unassigned: any[] = [];

    order.products.forEach((item: any) => {
      if (item.trackingId) {
        if (!tracked[item.trackingId]) tracked[item.trackingId] = [];
        tracked[item.trackingId].push(item);
      } else {
        unassigned.push(item);
      }
    });

    return { defaultPackage: unassigned, trackedPackages: tracked };
  }, [order.products]);

  const handleCancelOrder = async () => {
    if (!cancellationReason.trim()) {
      toast.error("Please provide a reason for cancellation.");
      return;
    }
    setIsCancelling(true);
    try {
      const result = await requestOrderCancellation(order._id, cancellationReason);
      if (result.success) {
        toast.success("Cancellation request submitted.");
        setShowCancelDialog(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to cancel order.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
        
        {/* Top Navigation & Status Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link href="/user/orders" className="text-sm text-gray-500 hover:text-shop_orange flex items-center gap-1 mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to My Orders
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Order <span className="text-shop_orange">#{order.orderNumber.slice(-8)}</span>
            </h1>
            <p className="text-gray-500 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> 
              Placed on {format(new Date(order.orderDate), "PPP")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
             <Button onClick={() => setIsReordering(true)} variant="outline" className="rounded-full shadow-sm">
                <ShoppingCart className="w-4 h-4 mr-2" /> Buy Again
             </Button>
             {order.status === "pending" && (
                <Button onClick={() => setShowCancelDialog(true)} variant="destructive" className="rounded-full shadow-sm">
                  <XCircle className="w-4 h-4 mr-2" /> Cancel Order
                </Button>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            
            {/* 1. DEFAULT PACKAGE SECTION */}
            {defaultPackage.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-shop_orange/10 rounded-lg">
                      <Package className="w-5 h-5 text-shop_orange" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Default Package</h2>
                  </div>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    Preparing for Shipment
                  </Badge>
                </div>

                <Card className="border-2 border-dashed border-gray-200 bg-white/50 overflow-hidden">
                  <CardContent className="p-6 space-y-8">
                    {/* Full Timeline for Default Package[cite: 1] */}
                    <OrderTimeline order={currentOrder} />
                    
                    <div className="divide-y divide-gray-100 border-t pt-6">
                      {defaultPackage.map((item, idx) => (
                        <div key={idx} className="py-4 flex items-center gap-4 group">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden border bg-gray-50 transition-transform group-hover:scale-105">
                            <Image src={urlFor(item.product.image!).url()} alt={item.product.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 truncate">{item.product.name}</h4>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            {order.packedAt && (
                               <Badge className="mt-2 bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100">
                                 <PackageCheck className="w-3 h-3 mr-1" /> Packed
                               </Badge>
                            )}
                          </div>
                          <PriceFormatter amount={item.product.price * item.quantity} className="font-bold text-lg" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 2. OTHER SHIPPING OPTIONS (Tracked Packages) */}
            {Object.keys(trackedPackages).length > 0 && (
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Other Shipping Options</h2>
                </div>

                {Object.entries(trackedPackages).map(([trackingId, items], idx) => (
                  <Card key={trackingId} className="border-blue-100 shadow-md overflow-hidden bg-white">
                    <div className="bg-blue-600 px-6 py-3 flex items-center justify-between">
                       <span className="text-white text-xs font-bold uppercase tracking-widest">Shipment #{idx + 1}</span>
                       <span className="text-blue-100 text-xs font-mono">{trackingId}</span>
                    </div>
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-500 uppercase">Carrier</p>
                          <p className="text-lg font-bold text-blue-700">{items[0].carrier || "Standard Shipping"}</p>
                        </div>
                        <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50" asChild>
                          <a href={`https://track.com/?id=${trackingId}`} target="_blank">
                             Track Order <ExternalLink className="ml-2 w-3 h-3" />
                          </a>
                        </Button>
                      </div>

                      <Separator className="bg-blue-50" />

                      {/* Display sub-timeline for this specific package if available[cite: 1] */}
                      <OrderTimeline order={{ ...currentOrder, status: items[0].status || "shipped" }} />

                      <div className="space-y-4 pt-4 border-t border-gray-50">
                        {items.map((item, i) => (
                          <div key={i} className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-lg border bg-gray-50 overflow-hidden relative">
                                <Image src={urlFor(item.product.image!).url()} alt="" fill className="object-cover" />
                             </div>
                             <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.product.name}</p>
                                <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                             </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Address & Summary */}
          <div className="space-y-6">
             <Card className="border-none shadow-xl shadow-gray-200/50 overflow-hidden">
                <div className="h-2 bg-shop_orange" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-shop_orange" /> Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <PriceFormatter amount={order.subtotal} />
                   </div>
                   <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="text-green-600 font-medium">FREE</span>
                   </div>
                   <Separator />
                   <div className="flex justify-between items-baseline pt-2">
                      <span className="text-lg font-bold">Total</span>
                      <PriceFormatter amount={order.totalPrice} className="text-2xl font-black text-shop_orange" />
                   </div>
                </CardContent>
             </Card>

             <Card className="border-none shadow-lg">
                <CardHeader>
                   <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" /> Delivery Address
                   </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 leading-relaxed">
                   <p className="font-bold text-gray-900 text-base mb-1">{order.address.name}</p>
                   <p>{order.address.address}</p>
                   <p>{order.address.city}, {order.address.state} {order.address.zip}</p>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>

      {/* Cancellation Dialog[cite: 3] */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Please tell us why you want to cancel. This action cannot be undone once approved.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for cancellation..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCancelDialog(false)}>Close</Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelOrder} 
              disabled={isCancelling}
            >
              {isCancelling ? "Processing..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetailsPage;