"use client";

import React, { useEffect, useState } from "react";
import useCartStore from "@/store";
import type { PackagingOption } from "@/store";
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
import { Trash2, AlertTriangle, Package, Coffee, Scale } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { WeightGrindSelector } from "../WeightGrindSelector";

interface WeightOption {
  weight: string;
  price: number;
  isDefault: boolean;
  stock: number;
}

interface GrindOption {
  grindType: string;
  isDefault: boolean;
  available: boolean;
}

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
  status: string;
  orderDate: string;
}

interface ServerCartContentProps {
  userEmail: string;
  userId: string;
  userAddresses: Address[];
  userOrders?: UserOrder[];
  onAddressesRefresh?: () => Promise<void>;
}

// ========== HELPER FUNCTIONS (defined first) ==========

const getWeightOptions = (product: any): WeightOption[] => {
  return product.weightOptions || [];
};

const getGrindOptions = (product: any): GrindOption[] => {
  return product.grindOptions || [];
};

const getPackagingOptions = (product: any): PackagingOption[] => {
  console.log("🔍 Debug - Full product object:", product);
  console.log("🔍 Debug - product.packagingOptions:", product.packagingOptions);
  
  if (!product.packagingOptions || !Array.isArray(product.packagingOptions)) {
    console.log("❌ No packagingOptions found on product");
    return [];
  }
  
  const packagingList = product.packagingOptions
    .filter((ref: any) => {
      console.log("🔍 Debug - Processing ref:", ref);
      if (!ref.packaging) {
        console.log("❌ No packaging in ref:", ref);
        return false;
      }
      if (ref.available === false) {
        console.log("❌ Packaging not available:", ref.packaging);
        return false;
      }
      return true;
    })
    .map((ref: any) => {
      const pkg = ref.packaging;
      console.log("✅ Processing packaging:", pkg);
      
      let imageUrl = "";
      if (pkg.imageUrl) {
        imageUrl = pkg.imageUrl;
      } else if (pkg.image && pkg.image.asset && pkg.image.asset.url) {
        imageUrl = pkg.image.asset.url;
      } else if (pkg.image && typeof pkg.image === 'string') {
        imageUrl = pkg.image;
      }
      
      return {
        _id: pkg._id,
        title: pkg.title,
        slug: pkg.slug || { current: "" },
        description: pkg.description,
        price: pkg.price || 0,
        default: ref.isDefault || pkg.default || false,
        image: pkg.image,
        imageUrl: imageUrl,
      } as PackagingOption;
    });
  
  console.log("📦 Final packaging options:", packagingList);
  return packagingList;
};

// ========== MAIN COMPONENT ==========

export function ServerCartContent({
  userEmail,
  userId,
  userAddresses,
  userOrders = [],
  onAddressesRefresh,
}: ServerCartContentProps) {
  const {
    items: cart,
    getTotalDiscount,
    resetCart,
    setOrderPlacementState,
    updateCartItemPackaging,
    updateCartItemWeight,
    updateCartItemGrind,
  } = useCartStore();

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);

  // Initialize Default Address
  useEffect(() => {
    const defaultAddress = userAddresses.find((addr) => addr.default);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
    } else if (userAddresses.length > 0) {
      setSelectedAddress(userAddresses[0]);
    }
  }, [userAddresses]);

  useEffect(() => {
    setOrderPlacementState(false, "validating");
  }, [setOrderPlacementState]);

  // Debug useEffect - now getPackagingOptions is defined above
  useEffect(() => {
    console.log("🛒 Full cart data:", JSON.stringify(cart, null, 2));
    cart.forEach((item, idx) => {
      console.log(`📦 Item ${idx}:`, {
        name: item.product.name,
        packagingOptionsRaw: (item.product as any).packagingOptions,
        packagingOptionsProcessed: getPackagingOptions(item.product),
      });
    });
  }, [cart]);

  const handleResetCart = () => setShowClearModal(true);

  const confirmResetCart = () => {
    resetCart();
    setShowClearModal(false);
    toast.success("Cart cleared successfully");
  };

  const getItemCurrentPrice = (item: any) => {
    if (item.selectedWeight && item.selectedWeight.price) {
      return item.selectedWeight.price;
    }
    const weightOptions = getWeightOptions(item.product);
    const defaultWeight = weightOptions.find((w: WeightOption) => w.isDefault);
    return defaultWeight?.price || item.product.price || 0;
  };

  const totalPackagingFee = cart.reduce((total, item) => {
    const itemPkgPrice = item.selectedPackaging?.price || 0;
    return total + (itemPkgPrice * item.quantity);
  }, 0);

  const grossSubtotal = cart.reduce((sum, item) => {
    const itemPrice = getItemCurrentPrice(item);
    return sum + (itemPrice * item.quantity);
  }, 0);
  
  const totalDiscount = getTotalDiscount();
  const currentSubtotal = grossSubtotal - totalDiscount + totalPackagingFee;
  
  const shipping = currentSubtotal > 100 ? 0 : 10;
  const tax = currentSubtotal * (parseFloat(process.env.NEXT_PUBLIC_TAX_AMOUNT || "0") || 0);
  const finalTotal = currentSubtotal + shipping + tax;

  if (!cart || cart.length === 0) {
    return <EmptyCart />;
  }

  return (
    <>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const weightOptions = getWeightOptions(item.product);
            const grindOptions = getGrindOptions(item.product);
            const packagingOptions = getPackagingOptions(item.product);
            
            console.log(`🎯 Rendering ${item.product.name} with:`, {
              weightOptionsCount: weightOptions.length,
              grindOptionsCount: grindOptions.length,
              packagingOptionsCount: packagingOptions.length,
              packagingOptions: packagingOptions,
            });
            
            return (
              <div 
                key={`${item.product._id}-${item.selectedWeight?.weight || 'default'}-${item.selectedGrind?.grindType || 'default'}-${item.selectedPackaging?._id || 'default'}`} 
                className="border rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={item.product.images?.[0] ? urlFor(item.product.images[0]).url() : "/placeholder.jpg"}
                      alt='Product image'
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{item.product.name}</h3>
                      <PriceFormatter amount={getItemCurrentPrice(item)} />
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <CartItemControls product={item.product} />
                      <PriceFormatter 
                        amount={(getItemCurrentPrice(item) + (item.selectedPackaging?.price || 0)) * item.quantity} 
                        className="font-bold" 
                      />
                    </div>

                    {/* Display selected options */}
                    <div className="mt-2 text-sm text-gray-500 space-x-3">
                      {item.selectedWeight && (
                        <span className="inline-flex items-center gap-1">
                          <Scale className="w-3 h-3" />
                          Weight: {item.selectedWeight.weight}
                        </span>
                      )}
                      {item.selectedGrind && (
                        <span className="inline-flex items-center gap-1">
                          <Coffee className="w-3 h-3" />
                          Grind: {item.selectedGrind.grindType.replace('-', ' ').toUpperCase()}
                        </span>
                      )}
                      {item.selectedPackaging && (
                        <span className="inline-flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          Packaging: {item.selectedPackaging.title}
                        </span>
                      )}
                    </div>

                    {/* Combined Weight, Grind, and Packaging Selector */}
                    <div className="mt-4 pt-4 border-t border-dashed">
                      <WeightGrindSelector 
                        productId={item.product._id}
                        weightOptions={weightOptions}
                        grindOptions={grindOptions}
                        packagingOptions={packagingOptions}
                        selectedWeight={item.selectedWeight}
                        selectedGrind={item.selectedGrind}
                        selectedPackaging={item.selectedPackaging}
                        onWeightChange={(weight) => {
                          console.log("Weight changed:", weight);
                          updateCartItemWeight(item.product._id, weight);
                        }}
                        onGrindChange={(grind) => {
                          console.log("Grind changed:", grind);
                          updateCartItemGrind(item.product._id, grind);
                        }}
                        onPackagingChange={(packaging) => {
                          console.log("Packaging changed:", packaging);
                          updateCartItemPackaging(item.product._id, packaging);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          <div className="flex justify-between items-center pt-4">
            <Button asChild variant="outline">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
            <Button variant="destructive" onClick={handleResetCart} className="gap-2">
              <Trash2 className="w-4 h-4" />
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
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
            <div className="space-y-3">
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
              
              {totalPackagingFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Package className="w-3 h-3" /> Packaging Fee
                  </span>
                  <PriceFormatter amount={totalPackagingFee} />
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                {shipping === 0 ? (
                  <span className="text-green-600 font-medium">Free</span>
                ) : (
                  <PriceFormatter amount={shipping} />
                )}
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
              />
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      <Dialog open={showClearModal} onOpenChange={setShowClearModal}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content 
            className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg"
          >
            <VisuallyHidden.Root>
              <DialogTitle>Clear Cart</DialogTitle>
            </VisuallyHidden.Root>
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Clear Cart?</h3>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone. All items will be removed from your cart.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={confirmResetCart} variant="destructive" className="w-full">
                Yes, Clear Cart
              </Button>
              <Button onClick={() => setShowClearModal(false)} variant="outline" className="w-full">
                Cancel
              </Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
}