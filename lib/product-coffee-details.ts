import type { Product } from "@/sanity.types";

export interface CoffeeDetails {
  originCountry?: string;
  originRegion?: string;
  producer?: string;
  altitudeMeters?: number;
  processingMethod?: string;
  flavorNotes?: string[];
  recommendedBrewMethods?: string[];
  grindRecommendation?: string;
  brewRatio?: string;
  roastDate?: string;
  harvestYear?: number;
  lotType?: string;
  packageSizeGrams?: number;
  beanFormat?: string;
  caffeineLevel?: string;
}

export interface ProductWithCoffeeDetails extends Product {
  coffeeDetails?: CoffeeDetails;
}

export function getCoffeeDetails(product: Product): CoffeeDetails | undefined {
  return (product as ProductWithCoffeeDetails).coffeeDetails;
}

export function formatCoffeeLabel(value?: string) {
  if (!value) return "";
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getCoffeeOrigin(coffeeDetails?: CoffeeDetails) {
  return [coffeeDetails?.originCountry, coffeeDetails?.originRegion]
    .filter(Boolean)
    .join(", ");
}
