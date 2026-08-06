"use client";

import { Dispatch, SetStateAction } from "react";
import Title from "../Title";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Category } from "@/sanity.types";

interface Props {
  categories: Category[];
  selectedCategory?: string | null;
  setSelectedCategory: Dispatch<SetStateAction<string | null>>;
  categoryFilterTitle?: string;
  clearCategoryFilterLabel?: string;
}

const CategoryList = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  categoryFilterTitle = "Categories",
  clearCategoryFilterLabel = "Clear category filter",
}: Props) => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Title className="text-base font-semibold text-gray-900">
          {categoryFilterTitle}
        </Title>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {categories?.length || 0}
        </span>
      </div>

      <RadioGroup
        value={selectedCategory || ""}
        onValueChange={(value) => setSelectedCategory(value || null)}
        className="space-y-1"
      >
        {categories?.map((category) => {
          const value = category._id;
          if (!value) return null;

          return (
            <div
              key={value}
              className="group flex items-center space-x-3 px-2 py-1 -mx-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors duration-150"
            >
              <RadioGroupItem
                value={value}
                id={`category-${value}`}
                className="border-gray-300 text-shop_dark_green focus:ring-shop_dark_green"
              />
              <Label
                htmlFor={`category-${value}`}
                className={`flex-1 cursor-pointer transition-colors duration-150 ${
                  selectedCategory === value
                    ? "font-medium text-shop_dark_green"
                    : "text-gray-700 group-hover:text-gray-900"
                }`}
              >
                {category?.title}
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      {selectedCategory && (
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className="mt-4 text-xs font-medium text-gray-600 hover:text-shop_dark_green underline underline-offset-2 decoration-1 transition-colors duration-150"
        >
          {clearCategoryFilterLabel}
        </button>
      )}
    </div>
  );
};

export default CategoryList;
