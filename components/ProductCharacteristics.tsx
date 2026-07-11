"use client";

import type { Product } from "@/sanity.types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";

/** Rows from BRAND_QUERY (`"brandName": brand->title`) */
type ProductBrandRows = Array<{ brandName?: string | null }> | null;

interface ProductCharacteristicsProps {
  product: Product;
  brand: ProductBrandRows;
}

interface CoffeeDetails {
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

interface ProductWithCoffeeDetails extends Product {
  coffeeDetails?: CoffeeDetails;
}

function toTitleCase(value?: string) {
  if (!value) return "—";
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const ProductCharacteristics = ({
  product,
  brand,
}: ProductCharacteristicsProps) => {
  const dictionary = useDictionary();
  const c = (path: string, fallback: string) =>
    t(dictionary, `product.characteristics.${path}`, fallback);
  const na = t(dictionary, "product.specs.notAvailable", "—");

  const coffeeDetails = (product as ProductWithCoffeeDetails).coffeeDetails;
  const origin = [coffeeDetails?.originCountry, coffeeDetails?.originRegion]
    .filter(Boolean)
    .join(", ");

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger className="font-bold">
          {c("title", "{name}: Characteristics").replace(
            "{name}",
            product?.name || ""
          )}
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-1">
          <p className="flex items-center justify-between">
            {c("brand", "Brand:")}{" "}
            {brand && brand.length > 0 && (
              <span className="font-semibold tracking-wide">
                {brand[0]?.brandName}
              </span>
            )}
          </p>
          <p className="flex items-center justify-between">
            {c("collection", "Collection:")}{" "}
            <span className="font-semibold tracking-wide">
              {coffeeDetails?.harvestYear ||
                t(dictionary, "product.specs.currentHarvest", "Current Harvest")}
            </span>
          </p>
          <p className="flex items-center justify-between">
            {c("type", "Type:")}{" "}
            <span className="font-semibold tracking-wide">
              {product?.variant}
            </span>
          </p>
          <p className="flex items-center justify-between">
            {c("origin", "Origin:")}{" "}
            <span className="font-semibold tracking-wide">
              {origin || na}
            </span>
          </p>
          <p className="flex items-center justify-between">
            {c("process", "Process:")}{" "}
            <span className="font-semibold tracking-wide">
              {toTitleCase(coffeeDetails?.processingMethod)}
            </span>
          </p>
          <p className="flex items-center justify-between">
            {c("lotType", "Lot Type:")}{" "}
            <span className="font-semibold tracking-wide">
              {toTitleCase(coffeeDetails?.lotType)}
            </span>
          </p>
          <p className="flex items-center justify-between">
            {c("beanFormat", "Bean Format:")}{" "}
            <span className="font-semibold tracking-wide">
              {toTitleCase(coffeeDetails?.beanFormat)}
            </span>
          </p>
          <p className="flex items-center justify-between">
            {c("caffeine", "Caffeine:")}{" "}
            <span className="font-semibold tracking-wide">
              {toTitleCase(coffeeDetails?.caffeineLevel)}
            </span>
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ProductCharacteristics;
