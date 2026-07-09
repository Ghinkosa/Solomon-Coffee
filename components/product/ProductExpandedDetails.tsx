"use client";

import type { Product } from "@/sanity.types";
import {
  formatCoffeeLabel,
  getCoffeeDetails,
  getCoffeeOrigin,
} from "@/lib/product-coffee-details";
import { toPlainText } from "@/lib/sanity-text";

interface ProductExpandedDetailsProps {
  product: Product;
  variant?: "default" | "compact" | "side";
}

interface SpecChipProps {
  label: string;
  value: string;
}

function SpecChip({
  label,
  value,
  tone = "dark",
}: SpecChipProps & { tone?: "dark" | "light" }) {
  const isLight = tone === "light";

  return (
    <div
      className={`flex min-w-0 flex-col rounded-lg border px-2.5 py-2 ${
        isLight
          ? "border-shop_light_green/20 bg-white"
          : "border-[#e4c290]/40 bg-[#2a1810] shadow-inner"
      }`}
    >
      <span
        className={`text-[10px] font-semibold uppercase tracking-wider ${
          isLight ? "text-shop_light_green" : "text-[#e4c290]"
        }`}
      >
        {label}
      </span>
      <span
        className={`mt-1 text-xs font-medium leading-snug line-clamp-3 ${
          isLight ? "text-shop_dark_green" : "text-[#fdf6e8]"
        }`}
      >
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
  const isSide = variant === "side";
  const chipTone = "dark";
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
    : isSide
      ? specChips.slice(0, 4)
      : specChips;

  const descriptionText = toPlainText(product.description);

  const categoriesLabel = Array.isArray(product.categories)
    ? product.categories.join(", ")
    : typeof product.categories === "string"
      ? product.categories
      : "";

  return (
    <div className={isCompact || isSide ? "min-w-0 flex-1 space-y-3" : "space-y-3"}>
      {product.name && (
        <p className="text-base font-semibold leading-snug text-[#fdf6e8]">
          {product.name}
        </p>
      )}

      {descriptionText && (
        <p
          className={`leading-relaxed text-[#fdf6e8]/90 ${
            isCompact ? "line-clamp-2 text-xs" : "line-clamp-3 text-xs"
          }`}
        >
          {descriptionText}
        </p>
      )}

      {categoriesLabel && (
        <p className="inline-block rounded-full border border-[#e4c290]/40 bg-[#2a1810]/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#fdf6e8]">
          {categoriesLabel}
        </p>
      )}

      {visibleChips.length > 0 && (
        <div
          className={
            isSide
              ? "grid grid-cols-2 gap-2"
              : isCompact
                ? "grid grid-cols-2 gap-2 sm:grid-cols-4"
                : "grid grid-cols-2 gap-2 sm:grid-cols-3"
          }
        >
          {visibleChips.map((chip) => (
            <SpecChip
              key={chip.label}
              label={chip.label}
              value={chip.value}
              tone={chipTone}
            />
          ))}
        </div>
      )}
    </div>
  );
}
