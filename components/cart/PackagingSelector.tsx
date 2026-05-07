"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Check, Package } from "lucide-react";
import type { PackagingOption } from "@/store";

interface PackagingSelectorProps {
  selectedId?: string;
  onSelect: (pkg: PackagingOption) => void;
}

export function PackagingSelector({ selectedId, onSelect }: PackagingSelectorProps) {
  const [options, setOptions] = useState<PackagingOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPackaging() {
      try {
        const res = await fetch("/api/packaging");
        if (!res.ok) {
          throw new Error("Failed to fetch packaging options");
        }
        const data = await res.json();
        console.log("📦 Packaging options loaded:", data);
        
        // Transform the data to match store's PackagingOption type
        const transformedData = data.map((item: any) => ({
          _id: item._id,
          title: item.title,
          slug: { current: item.slug || "" },
          description: item.description,
          price: item.price,
          default: item.default,
          image: item.image,
          imageUrl: item.imageUrl,
        }));
        
        setOptions(transformedData);
      } catch (err) {
        console.error("Failed to load packaging", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPackaging();
  }, []);

  if (loading) {
    return (
      <div className="mt-4 p-4 border border-dashed rounded-xl bg-gray-50/50">
        <h4 className="text-[10px] uppercase tracking-widest font-black mb-3 text-muted-foreground flex items-center gap-2">
          <Package className="w-3 h-3" />
          Select Packaging
        </h4>
        <div className="h-24 animate-pulse bg-gray-100 rounded-lg" />
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="mt-4 p-4 border border-dashed rounded-xl bg-gray-50/50">
        <h4 className="text-[10px] uppercase tracking-widest font-black mb-3 text-muted-foreground flex items-center gap-2">
          <Package className="w-3 h-3" />
          Select Packaging
        </h4>
        <div className="text-center text-sm text-gray-400 py-4">
          No packaging options available
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 border border-dashed rounded-xl bg-gray-50/50">
      <h4 className="text-[10px] uppercase tracking-widest font-black mb-3 text-muted-foreground flex items-center gap-2">
        <Package className="w-3 h-3" />
        Select Packaging
      </h4>
      <div className="grid grid-cols-2 gap-3">
        {options.map((pkg) => {
          const isSelected = selectedId === pkg._id;
          
          // Get image URL safely
          let imgUrl = "/placeholder-pkg.png";
          if ((pkg as any).imageUrl) {
            imgUrl = (pkg as any).imageUrl;
          } else if (pkg.image && typeof pkg.image === 'object' && (pkg.image as any).asset?.url) {
            imgUrl = (pkg.image as any).asset.url;
          }

          return (
            <button
              key={pkg._id}
              type="button"
              onClick={() => onSelect(pkg)}
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
  );
}