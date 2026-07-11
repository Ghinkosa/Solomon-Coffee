"use client";

import { Product } from "@/sanity.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, Shield, Award } from "lucide-react";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";
import { getGrindLabel } from "@/lib/i18n-nav";

interface ProductSpecsProps {
  product: Product;
}

interface CoffeeDetails {
  producer?: string;
  altitudeMeters?: number;
  flavorNotes?: string[];
  recommendedBrewMethods?: string[];
  grindRecommendation?: string;
  brewRatio?: string;
  roastDate?: string;
  packageSizeGrams?: number;
}

interface ProductWithCoffeeDetails extends Product {
  coffeeDetails?: CoffeeDetails;
}

function toLabel(value?: string) {
  if (!value) return "—";
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const ProductSpecs = ({ product }: ProductSpecsProps) => {
  const dictionary = useDictionary();
  const s = (path: string, fallback: string) =>
    t(dictionary, `product.specs.${path}`, fallback);

  const na = s("notAvailable", "—");
  const coffeeDetails = (product as ProductWithCoffeeDetails).coffeeDetails;
  const roastDate = coffeeDetails?.roastDate
    ? new Date(coffeeDetails.roastDate).toLocaleDateString()
    : na;

  const grindLabel = coffeeDetails?.grindRecommendation
    ? getGrindLabel(dictionary, coffeeDetails.grindRecommendation) ||
      toLabel(coffeeDetails.grindRecommendation)
    : na;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      <Card className="border-2 border-gray-100 hover:border-shop_light_green/30 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-shop_orange" />
            <CardTitle className="text-sm font-semibold">
              {s("coffeeProfile", "Coffee Profile")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{s("roastDate", "Roast Date:")}</span>
            <span className="font-medium">{roastDate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{s("producer", "Producer:")}</span>
            <span className="font-medium">
              {coffeeDetails?.producer || na}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{s("altitude", "Altitude:")}</span>
            <span className="font-medium">
              {coffeeDetails?.altitudeMeters
                ? `${coffeeDetails.altitudeMeters}m`
                : na}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{s("package", "Package:")}</span>
            <span className="font-medium">
              {coffeeDetails?.packageSizeGrams
                ? `${coffeeDetails.packageSizeGrams}g`
                : na}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{s("code", "Code:")}</span>
            <span className="font-medium text-xs text-gray-500">
              #{product?.slug?.current?.slice(-8).toUpperCase()}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-gray-100 hover:border-shop_light_green/30 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-shop_orange" />
            <CardTitle className="text-sm font-semibold">
              {s("shipping", "Shipping")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-medium">
              {s("freeShipping", "✓ Free Shipping")}
            </span>
          </div>
          <div className="text-gray-600">
            {s("estimatedDelivery", "Estimated: 2-5 business days")}
          </div>
          <div className="text-gray-600">
            {s("expressDelivery", "Express: 1-2 business days")}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-gray-100 hover:border-shop_light_green/30 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-shop_orange" />
            <CardTitle className="text-sm font-semibold">
              {s("brewingDetails", "Brewing Details")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="text-gray-600">
            <span className="font-medium text-shop_dark_green">
              {s("brewRatio", "Brew Ratio:")}
            </span>{" "}
            {coffeeDetails?.brewRatio || na}
          </div>
          <div className="text-gray-600">
            <span className="font-medium text-shop_dark_green">
              {s("grind", "Grind:")}
            </span>{" "}
            {grindLabel}
          </div>
          <div className="text-gray-600">
            <span className="font-medium text-shop_dark_green">
              {s("brewMethods", "Brew Methods:")}
            </span>{" "}
            {coffeeDetails?.recommendedBrewMethods?.length
              ? coffeeDetails.recommendedBrewMethods.map(toLabel).join(", ")
              : na}
          </div>
          <div className="text-gray-600">
            <span className="font-medium text-shop_dark_green">
              {s("flavorNotes", "Flavor Notes:")}
            </span>{" "}
            {coffeeDetails?.flavorNotes?.length
              ? coffeeDetails.flavorNotes.join(", ")
              : na}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-gray-100 hover:border-shop_light_green/30 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-shop_orange" />
            <CardTitle className="text-sm font-semibold">
              {s("quality", "Quality")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-medium">
              {s("qualityTested", "✓ Quality Tested")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-medium">
              {s("authenticProduct", "✓ Authentic Product")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-medium">
              {s("securePackaging", "✓ Secure Packaging")}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductSpecs;
