"use client";

import { Product } from "@/sanity.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, Shield, Award } from "lucide-react";

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
  const coffeeDetails = (product as ProductWithCoffeeDetails).coffeeDetails;
  const roastDate = coffeeDetails?.roastDate
    ? new Date(coffeeDetails.roastDate).toLocaleDateString()
    : "—";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {/* Product Features */}
      <Card className="border-2 border-gray-100 hover:border-shop_light_green/30 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-shop_orange" />
            <CardTitle className="text-sm font-semibold">
              Coffee Profile
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Roast Date:</span>
            <span className="font-medium">{roastDate}</span>
          </div>
          {product?.brand && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Brand:</span>
              <span className="font-medium">Brand</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Producer:</span>
            <span className="font-medium">
              {coffeeDetails?.producer || "—"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Altitude:</span>
            <span className="font-medium">
              {coffeeDetails?.altitudeMeters
                ? `${coffeeDetails.altitudeMeters}m`
                : "—"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Package:</span>
            <span className="font-medium">
              {coffeeDetails?.packageSizeGrams
                ? `${coffeeDetails.packageSizeGrams}g`
                : "—"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Code:</span>
            <span className="font-medium text-xs text-gray-500">
              #{product?.slug?.current?.slice(-8).toUpperCase()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Info */}
      <Card className="border-2 border-gray-100 hover:border-shop_light_green/30 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-shop_orange" />
            <CardTitle className="text-sm font-semibold">Shipping</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-medium">✓ Free Shipping</span>
          </div>
          <div className="text-gray-600">Estimated: 2-5 business days</div>
          <div className="text-gray-600">Express: 1-2 business days</div>
        </CardContent>
      </Card>

      {/* Brewing Details */}
      <Card className="border-2 border-gray-100 hover:border-shop_light_green/30 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-shop_orange" />
            <CardTitle className="text-sm font-semibold">
              Brewing Details
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="text-gray-600">
            <span className="font-medium text-shop_dark_green">
              Brew Ratio:
            </span>{" "}
            {coffeeDetails?.brewRatio || "—"}
          </div>
          <div className="text-gray-600">
            <span className="font-medium text-shop_dark_green">
              Grind:
            </span>{" "}
            {toLabel(coffeeDetails?.grindRecommendation)}
          </div>
          <div className="text-gray-600">
            <span className="font-medium text-shop_dark_green">
              Brew Methods:
            </span>{" "}
            {coffeeDetails?.recommendedBrewMethods?.length
              ? coffeeDetails.recommendedBrewMethods.map(toLabel).join(", ")
              : "—"}
          </div>
          <div className="text-gray-600">
            <span className="font-medium text-shop_dark_green">
              Flavor Notes:
            </span>{" "}
            {coffeeDetails?.flavorNotes?.length
              ? coffeeDetails.flavorNotes.join(", ")
              : "—"}
          </div>
        </CardContent>
      </Card>

      {/* Quality Assurance */}
      <Card className="border-2 border-gray-100 hover:border-shop_light_green/30 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-shop_orange" />
            <CardTitle className="text-sm font-semibold">Quality</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-medium">✓ Quality Tested</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-medium">
              ✓ Authentic Product
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-medium">
              ✓ Secure Packaging
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductSpecs;
