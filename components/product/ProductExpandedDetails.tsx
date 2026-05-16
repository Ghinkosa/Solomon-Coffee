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

interface SpecChipProps {
  label: string;
  value: string;
}

function SpecChip({ label, value }: SpecChipProps) {
  return (
    <div className="flex min-w-0 flex-col rounded-lg border border-[#e4c290]/30 bg-[#2a1810]/80 px-2.5 py-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#e4c290]">
        {label}
      </span>
      <span className="mt-1 text-xs font-medium leading-snug text-[#fdf6e8] line-clamp-3">
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

  const specChips: SpecChipProps[] = [];

  if (product.variant) {
    specChips.push({ label: "Roast", value: product.variant });
  }
  if (origin) {
    specChips.push({ label: "Origin", value: origin });
  }
  if (coffeeDetails?.producer && !isCompact) {
    specChips.push({ label: "Producer", value: coffeeDetails.producer });
  }
  if (coffeeDetails?.processingMethod) {
    specChips.push({
      label: "Process",
      value: formatCoffeeLabel(coffeeDetails.processingMethod),
    });
  }
  if (coffeeDetails?.lotType && !isCompact) {
    specChips.push({
      label: "Lot",
      value: formatCoffeeLabel(coffeeDetails.lotType),
    });
  }
  if (flavorNotes) {
    specChips.push({ label: "Notes", value: flavorNotes });
  }
  if (brewMethods && !isCompact) {
    specChips.push({ label: "Brew", value: brewMethods });
  }
  if (coffeeDetails?.grindRecommendation && !isCompact) {
    specChips.push({
      label: "Grind",
      value: formatCoffeeLabel(coffeeDetails.grindRecommendation),
    });
  }
  if (coffeeDetails?.altitudeMeters && !isCompact) {
    specChips.push({
      label: "Altitude",
      value: `${coffeeDetails.altitudeMeters}m`,
    });
  }

  const visibleChips = isCompact
    ? specChips.filter((chip) =>
        COMPACT_DETAIL_KEYS.includes(
          chip.label as (typeof COMPACT_DETAIL_KEYS)[number],
        ),
      )
    : specChips;

  const categoriesLabel = Array.isArray(product.categories)
    ? product.categories.join(", ")
    : typeof product.categories === "string"
      ? product.categories
      : "";

  return (
    <div className={isCompact ? "min-w-0 flex-1 space-y-3" : "space-y-3"}>
      {product.name && (
        <p className="text-base font-semibold leading-snug text-[#fdf6e8]">
          {product.name}
        </p>
      )}

      {product.description && (
        <p
          className={`leading-relaxed text-[#fdf6e8]/85 ${
            isCompact ? "line-clamp-2 text-xs" : "line-clamp-3 text-xs"
          }`}
        >
          {product.description}
        </p>
      )}

      {categoriesLabel && (
        <p className="inline-block rounded-full border border-[#e4c290]/35 bg-[#3a2417]/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#fdf6e8]">
          {categoriesLabel}
        </p>
      )}

      {visibleChips.length > 0 && (
        <div
          className={
            isCompact
              ? "grid grid-cols-2 gap-2 sm:grid-cols-4"
              : "grid grid-cols-2 gap-2 sm:grid-cols-3"
          }
        >
          {visibleChips.map((chip) => (
            <SpecChip key={chip.label} label={chip.label} value={chip.value} />
          ))}
        </div>
      )}
    </div>
  );
}
