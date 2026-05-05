"use client";

import React, { useEffect, useState } from "react";
import useCartStore from "@/store";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import EmptyCart from "@/components/EmptyCart";
import PriceFormatter from "@/components/PriceFormatter";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { CartItemControls } from "./CartItemControls";
import { AddressSelector } from "./AddressSelector";
import { CheckoutButton } from "./CheckoutButton";
import { Trash2, AlertTriangle, X, Package } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";

interface Address {
  _id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  default: boolean;
  createdAt: string;
}

interface UserOrder {
  _id: string;
  orderNumber: string;
  totalPrice: number;
  currency: string;
  status: string;
  orderDate: string;
  customerName: string;
  email: string;
}

// Fixed interface to match your provided Sanity Schema
interface PackagingOption {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  price: number;
  default: boolean;
  image?: any;
}

interface ServerCartContentProps {
  userEmail: string;
  userId: string;
  userAddresses: Address[];
  userOrders: UserOrder[];
  packagingOptions: PackagingOption[]; // Passed from ClientCartContent
  onAddressesRefresh?: () => Promise<void>;
}

export function ServerCartContent({
  userEmail,
  userId,
  userAddresses,
  userOrders,
  packagingOptions = [],
  onAddressesRefresh,
}: ServerCartContentProps) {
  const {
    items: cart,
    getSubTotalPrice,
    getTotalDiscount,
    resetCart,
    setOrderPlacementState,
  } = useCartStore();

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  
  // State for dynamic packaging selection
  const [selectedPackaging, setSelectedPackaging] = useState<PackagingOption | null>(null);

  // Initialize defaults (Address and Packaging)
  useEffect(() => {
    // Set default address
    const defaultAddress = userAddresses.find((addr) => addr.default);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
    } else if (userAddresses.length > 0) {
      setSelectedAddress(userAddresses[0]);
    }

    // Set default packaging based on Sanity "default" boolean
    if (packagingOptions.length > 0) {
      const defaultPkg = packagingOptions.find((p) => p.default) || packagingOptions[0];
      setSelectedPackaging(defaultPkg);
    }
  }, [userAddresses, packagingOptions]);

  useEffect(() => {
    setOrderPlacementState(false, "validating");
  }, [setOrderPlacementState]);

  const handleResetCart = () => setShowClearModal(true);

  const confirmResetCart = () => {
    resetCart();
    setShowClearModal(false);
    toast.success("Cart cleared successfully");
  };

  // Pricing Logic
  const grossSubtotal = getSubTotalPrice();
  const totalDiscount = getTotalDiscount();
  const currentSubtotal = grossSubtotal - totalDiscount;
  const shipping = currentSubtotal > 100 ? 0 : 10;
  const tax = currentSubtotal * (parseFloat(process.env.NEXT_PUBLIC_TAX_AMOUNT || "0") || 0);
  
  // Dynamic packaging fee from Sanity schema price field
  const packagingFee = selectedPackaging?.price || 0;
  const finalTotal = currentSubtotal + shipping + tax + packagingFee;

  if (!cart || cart.length === 0) {
    return (
      <div className="space-y-8">
        <EmptyCart />
        {userOrders.length > 0 && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
            <div className="space-y-3">
              {userOrders.slice(0, 3).map((order) => (
                <div key={order._id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">#{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">{new Date(order.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <PriceFormatter amount={order.totalPrice} />
                    <Badge variant={order.status === "delivered" ? "default" : "secondary"} className="ml-2">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Cart Items List */}
      <div className="lg:col-span-2 space-y-4">
        {cart.map((item) => (
          <div key={item.product._id} className="border rounded-lg p-4">
            <div className="flex gap-4">
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={item.product.images?.[0] ? urlFor(item.product.images[0]).url() : "/placeholder.jpg"}
                  alt={item.product.name || "Product"}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <Link href={`/product/${item.product.slug?.current}`}>
                    <h3 className="font-semibold hover:text-primary transition-colors">{item.product.name}</h3>
                  </Link>
                  <PriceFormatter amount={item.product.price} />
                </div>
                <div className="flex justify-between items-center mt-4">
                  <CartItemControls product={item.product} />
                  <div className="font-bold">
                    <PriceFormatter amount={(item.product.price || 0) * item.quantity} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-2 w-48">
          <Link href="/shop"><Button variant="outline" className="w-full">Continue Shopping</Button></Link>
          <Button variant="outline" onClick={handleResetCart} className="w-full border-red-200 text-red-600 hover:bg-red-50 font-semibold">
            <Trash2 className="w-4 h-4 mr-2" /> Clear Cart
          </Button>
        </div>
      </div>

      {/* Sidebar Summary */}
      <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
        <AddressSelector
          userEmail={userEmail}
          userId={userId}
          addresses={userAddresses}
          selectedAddress={selectedAddress}
          onAddressSelect={setSelectedAddress}
          onAddressesRefresh={onAddressesRefresh}
        />

        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>

          {/* Dynamic Packaging Selection UI */}
          {packagingOptions.length > 0 && (
            <div className="mb-6 space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Package className="w-4 h-4" /> Packaging Selection
              </Label>
              <RadioGroup 
                value={selectedPackaging?._id} 
                onValueChange={(id) => {
                  const option = packagingOptions.find(p => p._id === id);
                  if (option) setSelectedPackaging(option);
                }}
                className="grid gap-2"
              >
                {packagingOptions.map((option) => (
                  <div 
                    key={option._id}
                    className={cn(
                      "flex items-center justify-between p-3 border rounded-md cursor-pointer transition-all",
                      selectedPackaging?._id === option._id ? "border-primary bg-primary/5" : "hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedPackaging(option)}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={option._id} id={option._id} />
                      <Label htmlFor={option._id} className="cursor-pointer">
                        <span className="block font-medium">{option.title}</span>
                        {option.description && (
                          <span className="block text-xs text-muted-foreground">{option.description}</span>
                        )}
                      </Label>
                    </div>
                    <span className="text-sm font-bold">
                      {option.price === 0 ? <span className="text-green-600">FREE</span> : <PriceFormatter amount={option.price} />}
                    </span>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal ({cart.length} items)</span>
              <PriceFormatter amount={grossSubtotal} />
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-<PriceFormatter amount={totalDiscount} /></span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                Packaging <span className="text-[10px] text-muted-foreground">({selectedPackaging?.title || "Standard"})</span>
              </span>
              <PriceFormatter amount={packagingFee} />
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              {shipping === 0 ? <span className="text-green-600 font-medium">Free</span> : <PriceFormatter amount={shipping} />}
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <PriceFormatter amount={tax} />
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <PriceFormatter amount={finalTotal} />
            </div>
          </div>

          <div className="mt-6">
            <CheckoutButton 
              cart={cart} 
              selectedAddress={selectedAddress} 
              packagingId={selectedPackaging?._id}
              packagingPrice={packagingFee}
            />
          </div>
        </div>
      </div>

      {/* Reset Modal */}
      <Dialog open={showClearModal} onOpenChange={setShowClearModal}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg">
            <VisuallyHidden.Root><DialogTitle>Clear Cart</DialogTitle></VisuallyHidden.Root>
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border-4 border-red-100">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-gray-600">Remove all items from your cart?</p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowClearModal(false)} className="flex-1">Keep</Button>
              <Button variant="destructive" onClick={confirmResetCart} className="flex-1 font-semibold">Clear</Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </div>
  );
}