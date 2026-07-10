"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AddressSelectorSkeleton } from "@/components/cart/CartSkeleton";
import { useDictionary } from "@/lib/dictionary-context";
import type { Dictionary } from "@/lib/dictionary-context";

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

interface OrderAddressSelectorProps {
  addresses: OrderAddress[];
  selectedAddress: OrderAddress | null;
  onAddressSelect: (address: OrderAddress) => void;
  isLoading?: boolean;
}

export function OrderAddressSelector({
  addresses,
  selectedAddress,
  onAddressSelect,
  isLoading = false,
}: OrderAddressSelectorProps) {
  const dictionary = useDictionary() as Dictionary;
  const selector = (dictionary.checkout as Record<string, unknown>)
    ?.addressSelector as Record<string, string> | undefined;

  if (isLoading) {
    return <AddressSelectorSkeleton />;
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground mb-2">
          {selector?.noAddresses ?? "No previous addresses found"}
        </p>
        <p className="text-sm text-muted-foreground">
          {selector?.enterNew ?? "You can enter a new address during payment"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RadioGroup
        value={selectedAddress?._id || ""}
        onValueChange={(value) => {
          const address = addresses.find((addr) => addr._id === value);
          if (address) onAddressSelect(address);
        }}
      >
        {addresses.map((address) => (
          <div key={address._id} className="flex items-start space-x-2">
            <RadioGroupItem
              value={address._id}
              id={address._id}
              className="mt-1"
            />
            <Label htmlFor={address._id} className="flex-1 cursor-pointer">
              <div className="space-y-1">
                <div className="font-medium flex items-center gap-2">
                  {address.name}
                  {address.default && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {selector?.mostRecent ?? "Most Recent"}
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {address.address}
                </div>
                <div className="text-sm text-muted-foreground">
                  {address.city}, {address.state} {address.zip}
                </div>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
