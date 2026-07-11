"use client";

import { Button } from "@/components/ui/button";
import QuantityButtons from "@/components/QuantityButtons";
import { Trash2 } from "lucide-react";
import useCartStore, { GrindOption, PackagingOption, WeightOption } from "@/store";
import { Product } from "@/sanity.types";
import { toast } from "sonner";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";

interface CartItemControlsProps {
  product: Product;
  selectedWeight?: WeightOption;
  selectedGrind?: GrindOption;
  selectedPackaging?: PackagingOption;
}

export function CartItemControls({
  product,
  selectedWeight,
  selectedGrind,
  selectedPackaging,
}: CartItemControlsProps) {
  const { deleteCartProduct } = useCartStore();
  const dictionary = useDictionary();

  const handleRemove = () => {
    deleteCartProduct(product._id, selectedWeight, selectedGrind, selectedPackaging);
    toast.success(
      t(dictionary, "cartToasts.itemRemoved", "Item removed from cart"),
    );
  };

  return (
    <div className="flex items-center gap-4">
      <QuantityButtons
        product={product}
        selectedWeight={selectedWeight}
        selectedGrind={selectedGrind}
        selectedPackaging={selectedPackaging}
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        className="text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
