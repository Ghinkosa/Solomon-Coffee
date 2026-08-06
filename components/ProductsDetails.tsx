"use client";

import { Product } from "@/sanity.types";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";
import { useLocale } from "@/hooks/useLocale";
import { getProductDescription } from "@/lib/product-locale";

interface ProductsDetailsProps {
  product?: Product;
}

const ProductsDetails = ({ product }: ProductsDetailsProps) => {
  const dictionary = useDictionary();
  const lang = useLocale();
  const descriptionText = getProductDescription(product, lang);

  if (!descriptionText) {
    return null;
  }

  return (
    <div className="w-full space-y-8 mb-10">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-shop_dark_green mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-shop_orange rounded-full"></span>
          {t(dictionary, "product.details.description", "Description")}
        </h2>
        <div className="prose prose-sm max-w-none text-gray-600">
          <p className="whitespace-pre-line">{descriptionText}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductsDetails;
