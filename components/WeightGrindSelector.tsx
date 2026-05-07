"use client";

import React from "react";
import { Coffee, Scale } from "lucide-react";

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
  selectedWeight?: WeightOption;
  selectedGrind?: GrindOption;
  onWeightChange: (weight: WeightOption) => void;
  onGrindChange: (grind: GrindOption) => void;
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
  selectedWeight,
  selectedGrind,
  onWeightChange,
  onGrindChange,
}: WeightGrindSelectorProps) {
  // If no options, don't render
  if (weightOptions.length === 0 && grindOptions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Weight Selection */}
      {weightOptions.length > 0 && (
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
      {grindOptions.length > 0 && (
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
    </div>
  );
}