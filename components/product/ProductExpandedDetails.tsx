"use client";

import type { Product } from "@/sanity.types";
import {
  formatCoffeeLabel,
  getCoffeeDetails,
  getCoffeeOrigin,
} from "@/lib/product-coffee-details";

interface ProductExpandedDetailsProps {
  product: Product;
  variant?: "default" | "compact";
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-2 text-xs">
      <span className="shrink-0 text-[#e4c290]/75">{label}</span>
      <span className="text-right font-medium leading-snug text-[#fdf6e8]">
        {value}
      </span>
    </div>
  );
}

const COMPACT_DETAIL_KEYS = [
  "Roast",
  "Origin",
  "Process",
  "Notes",
] as const;

export function ProductExpandedDetails({
  product,
  variant = "default",
}: ProductExpandedDetailsProps) {
  const isCompact = variant === "compact";
  const coffeeDetails = getCoffeeDetails(product);
  const origin = getCoffeeOrigin(coffeeDetails);
  const flavorNotes = coffeeDetails?.flavorNotes?.filter(Boolean).join(", ");
  const brewMethods = coffeeDetails?.recommendedBrewMethods
    ?.filter(Boolean)
    .map(formatCoffeeLabel)
    .join(", ");

  const detailRows: DetailRowProps[] = [];

  if (product.variant) {
    detailRows.push({ label: "Roast", value: product.variant });
  }
  if (origin) {
    detailRows.push({ label: "Origin", value: origin });
  }
  if (coffeeDetails?.producer && !isCompact) {
    detailRows.push({ label: "Producer", value: coffeeDetails.producer });
  }
  if (coffeeDetails?.processingMethod) {
    detailRows.push({
      label: "Process",
      value: formatCoffeeLabel(coffeeDetails.processingMethod),
    });
  }
  if (coffeeDetails?.lotType && !isCompact) {
    detailRows.push({
      label: "Lot",
      value: formatCoffeeLabel(coffeeDetails.lotType),
    });
  }
  if (flavorNotes) {
    detailRows.push({ label: "Notes", value: flavorNotes });
  }
  if (brewMethods && !isCompact) {
    detailRows.push({ label: "Brew", value: brewMethods });
  }
  if (coffeeDetails?.grindRecommendation && !isCompact) {
    detailRows.push({
      label: "Grind",
      value: formatCoffeeLabel(coffeeDetails.grindRecommendation),
    });
  }
  if (coffeeDetails?.altitudeMeters && !isCompact) {
    detailRows.push({
      label: "Altitude",
      value: `${coffeeDetails.altitudeMeters}m`,
    });
  }

  const visibleRows = isCompact
    ? detailRows.filter((row) =>
        COMPACT_DETAIL_KEYS.includes(row.label as (typeof COMPACT_DETAIL_KEYS)[number]),
      )
    : detailRows;

  const categoriesLabel = Array.isArray(product.categories)
    ? product.categories.join(", ")
    : typeof product.categories === "string"
      ? product.categories
      : "";

  return (
    <div className={isCompact ? "min-w-0 flex-1 space-y-2.5" : "space-y-3"}>
      {product.name && (
        <p
          className={`font-semibold leading-snug text-[#fdf6e8] ${
            isCompact ? "text-sm" : "text-sm"
          }`}
        >
          {product.name}
        </p>
      )}

      {product.description && (
        <p
          className={`leading-relaxed text-[#fdf6e8]/90 ${
            isCompact ? "line-clamp-2 text-xs" : "line-clamp-4 text-xs"
          }`}
        >
          {product.description}
        </p>
      )}

      {categoriesLabel && (
        <p className="inline-block rounded-md bg-[#3a2417]/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-[#fdf6e8]">
          {categoriesLabel}
        </p>
      )}

      {visibleRows.length > 0 && (
        <div
          className={
            isCompact
              ? "grid grid-cols-2 gap-x-4 gap-y-2 rounded-md border border-[#e4c290]/20 bg-[#09332c]/40 px-3 py-2.5"
              : "space-y-2 rounded-md border border-[#e4c290]/20 bg-[#09332c]/40 px-3 py-2.5"
          }
        >
          {visibleRows.map((row) => (
            <DetailRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      )}
    </div>
  );
}
