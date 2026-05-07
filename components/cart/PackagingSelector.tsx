"use client";

import React, { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { createClient } from "@sanity/client";

// Create a Sanity client instance
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  useCdn: true,
});

interface PackagingOption {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  price: number;
  default: boolean;
  image?: any;
}

interface PackagingSelectorProps {
  selectedId?: string;
  onSelect: (packaging: PackagingOption) => void;
}

export function PackagingSelector({ selectedId, onSelect }: PackagingSelectorProps) {
  const [packagingOptions, setPackagingOptions] = useState<PackagingOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackagingOptions = async () => {
      try {
        const query = `*[_type == "packaging"] | order(default desc, price asc) {
          _id,
          title,
          slug,
          description,
          price,
          default,
          image
        }`;
        const data = await sanityClient.fetch(query);
        console.log("📦 Packaging options fetched:", data);
        setPackagingOptions(data);
      } catch (error) {
        console.error("Failed to fetch packaging options:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackagingOptions();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-gray-400 italic p-2 text-center">
        Loading packaging options...
      </div>
    );
  }

  if (packagingOptions.length === 0) {
    return (
      <div className="text-sm text-gray-400 italic p-2 text-center">
        No packaging options available
      </div>
    );
  }

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <Package className="w-4 h-4" />
        Select Packaging
      </label>
      <div className="grid grid-cols-2 gap-2">
        {packagingOptions.map((option) => (
          <button
            key={option._id}
            onClick={() => onSelect(option)}
            className={`
              px-3 py-2 rounded-lg border text-center transition-all
              ${selectedId === option._id 
                ? 'border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/20' 
                : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
              }
            `}
          >
            <div className="font-medium">{option.title}</div>
            <div className="text-sm text-gray-600">
              {option.price === 0 ? "Free" : `+$${option.price}`}
            </div>
            {option.default && !selectedId && (
              <div className="text-xs text-primary mt-1">Default</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}