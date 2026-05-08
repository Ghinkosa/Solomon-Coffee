"use client";

import React from "react";
import { Coffee, Scale, Package } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { PackagingOption } from "@/store";

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

interface WeightGrindSelectorProps {
  productId: string;
  weightOptions?: WeightOption[];
  grindOptions?: GrindOption[];
  packagingOptions?: PackagingOption[];
  selectedWeight?: WeightOption;
  selectedGrind?: GrindOption;
  selectedPackaging?: PackagingOption;
  onWeightChange: (weight: WeightOption) => void;
  onGrindChange: (grind: GrindOption) => void;
  onPackagingChange: (packaging: PackagingOption) => void;
}

const grindLabels: Record<string, string> = {
  "whole-bean": "Whole Bean",
  "cafetiere": "Cafetiere",
  "filter": "Filter",
  "espresso": "Espresso",
};

export function WeightGrindSelector({
  productId,
  weightOptions = [],
  grindOptions = [],
  packagingOptions = [],
  selectedWeight,
  selectedGrind,
  selectedPackaging,
  onWeightChange,
  onGrindChange,
  onPackagingChange,
}: WeightGrindSelectorProps) {
  const hasWeightOptions = weightOptions.length > 0;
  const hasGrindOptions = grindOptions.length > 0;
  const hasPackagingOptions = packagingOptions.length > 0;

  if (!hasWeightOptions && !hasGrindOptions && !hasPackagingOptions) {
    return (
      <div className="text-sm text-gray-400 italic p-2 text-center">
        No options available for this product
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Weight Selection */}
      {hasWeightOptions && (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Scale className="w-4 h-4" />
            Select Weight
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {weightOptions.map((option) => (
              <button
                key={option.weight}
                onClick={() => onWeightChange(option)}
                className={`
                  px-3 py-2 rounded-lg border text-center transition-all
                  ${selectedWeight?.weight === option.weight 
                    ? 'border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/20' 
                    : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                  }
                  ${option.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                disabled={option.stock === 0}
              >
                <div className="font-medium">{option.weight}</div>
                <div className="text-sm text-gray-600">${option.price}</div>
                {option.isDefault && !selectedWeight && (
                  <div className="text-xs text-primary mt-1">Default</div>
                )}
                {option.stock === 0 && (
                  <div className="text-xs text-red-500 mt-1">Out of stock</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grind Selection */}
      {hasGrindOptions && (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Coffee className="w-4 h-4" />
            Select Grind
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {grindOptions
              .filter(option => option.available)
              .map((option) => (
                <button
                  key={option.grindType}
                  onClick={() => onGrindChange(option)}
                  className={`
                    px-3 py-2 rounded-lg border text-center transition-all
                    ${selectedGrind?.grindType === option.grindType 
                      ? 'border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/20' 
                      : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="font-medium">
                    {grindLabels[option.grindType] || option.grindType.replace('-', ' ').toUpperCase()}
                  </div>
                  {option.isDefault && !selectedGrind && (
                    <div className="text-xs text-primary mt-1">Default</div>
                  )}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Packaging Selection */}
      {hasPackagingOptions && (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Package className="w-4 h-4" />
            Select Packaging
          </label>
          <div className="grid grid-cols-2 gap-3">
            {packagingOptions.map((pkg) => {
              const isSelected = selectedPackaging?._id === pkg._id;
              const imgUrl = (pkg as any).imageUrl || "/placeholder-pkg.png";

              return (
                <button
                  key={pkg._id}
                  type="button"
                  onClick={() => onPackagingChange(pkg)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all text-left bg-white relative",
                    isSelected 
                      ? "border-black ring-1 ring-black shadow-sm" 
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="relative w-10 h-10 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden">
                    <Image
                      src={imgUrl}
                      alt={pkg.title}
                      fill
                      sizes="40px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold uppercase truncate">{pkg.title}</p>
                    <p className="text-[10px] font-medium text-black/60">
                      {pkg.price > 0 ? `+$${pkg.price.toFixed(2)}` : "Free"}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-black rounded-full p-0.5">
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}