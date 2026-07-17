import { Button } from "./ui/button";
import { HiMinus, HiPlus } from "react-icons/hi2";
import { toast } from "sonner";
import useCartStore, { GrindOption, PackagingOption, WeightOption } from "@/store";
import { Product } from "@/sanity.types";
import { twMerge } from "tailwind-merge";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";

interface Props {
  product: Product;
  className?: string;
  borderStyle?: string;
  countClassName?: string;
  buttonClassName?: string;
  selectedWeight?: WeightOption;
  selectedGrind?: GrindOption;
  selectedPackaging?: PackagingOption;
}

const QuantityButtons = ({
  product,
  className,
  borderStyle,
  countClassName,
  buttonClassName,
  selectedWeight,
  selectedGrind,
  selectedPackaging,
}: Props) => {
  const { addItem, removeItem, getItemCount } = useCartStore();
  const dictionary = useDictionary();
  const itemCount = getItemCount(
    product?._id,
    selectedWeight,
    selectedGrind,
    selectedPackaging,
  );
  const isOutOfStock = product?.stock === 0;

  const handleRemoveProduct = () => {
    removeItem(product?._id, selectedWeight, selectedGrind, selectedPackaging);
    if (itemCount > 1) {
      toast.success(
        t(dictionary, "cartToasts.quantityDecreased", "Quantity decreased successfully!"),
      );
    } else {
      toast.success(
        t(dictionary, "cartToasts.itemRemovedNamed", "{name} removed successfully!").replace(
          "{name}",
          product?.name?.substring(0, 12) || "",
        ),
      );
    }
  };

  const handleAddToCart = () => {
    if ((product?.stock as number) > itemCount) {
      addItem(product, selectedWeight, selectedGrind, selectedPackaging);
      toast.success(
        t(dictionary, "cartToasts.quantityIncreased", "Quantity increased successfully!"),
      );
    } else {
      toast.error(
        t(dictionary, "cartToasts.stockLimit", "Cannot add more than available stock"),
      );
    }
  };
  return (
    <div
      className={twMerge(
        "flex items-center gap-1 pb-1 text-base",
        borderStyle,
        className
      )}
    >
      <Button
        variant="outline"
        size="icon"
        className={twMerge(
          "w-6 h-6 border-0 hover:bg-shop_dark_green/20",
          buttonClassName,
        )}
        onClick={handleRemoveProduct}
        disabled={itemCount === 0 || isOutOfStock}
      >
        <HiMinus />
      </Button>
      <span
        className={twMerge(
          "font-semibold text-sm w-6 text-center text-dark-color",
          countClassName,
        )}
      >
        {itemCount}
      </span>
      <Button
        variant="outline"
        size="icon"
        className={twMerge(
          "w-6 h-6 border-0 hover:bg-shop_dark_green/20",
          buttonClassName,
        )}
        onClick={handleAddToCart}
        disabled={isOutOfStock}
      >
        <HiPlus />
      </Button>
    </div>
  );
};

export default QuantityButtons;
