"use client";
import AddToCartButton from "@/components/AddToCartButton";
import Container from "@/components/Container";
import FavoriteButton from "@/components/FavoriteButton";
import ImageView from "@/components/common/ImageView";
import PriceView from "@/components/PriceView";
import ProductCharacteristics from "@/components/ProductCharacteristics";
import ProductsDetails from "@/components/ProductsDetails";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import ProductSpecs from "@/components/ProductSpecs";
import ProductReviews from "@/components/ProductReviews";
import { trackProductView } from "@/lib/analytics";
import { toPlainText } from "@/lib/sanity-text";

import { Product } from "@/sanity.types";
import {
  CornerDownLeft,
  StarIcon,
  Truck,
  Shield,
  RefreshCw,
  Scale,
  Coffee,
  Package,
  Check,
  BadgePercent,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { FaRegQuestionCircle } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import { RxBorderSplit } from "react-icons/rx";
import { TbTruckDelivery } from "react-icons/tb";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ProductAnimationWrapper,
  ProductImageWrapper,
  ProductDetailsWrapper,
  ProductActionWrapper,
  ProductSectionWrapper,
} from "@/components/ProductClientWrapper";
import RelatedProducts from "./RelatedProducts";
import { WeightOption, GrindOption, PackagingOption } from "@/store";
import Image from "next/image";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";
import { getGrindLabel } from "@/lib/i18n-nav";
import type { Dictionary } from "@/lib/dictionary-context";

interface ProductContentProps {
  product: Product;
  relatedProducts: Product[];
}

const ProductContent = ({
  product,
  relatedProducts,
}: ProductContentProps) => {
  const dictionary = useDictionary() as Dictionary;
  const productCopy = dictionary.product as Record<string, unknown>;
  const select = productCopy?.select as Record<string, string> | undefined;
  const stockCopy = productCopy?.stock as Record<string, string> | undefined;
  const reviewsCopy = productCopy?.reviews as Record<string, string> | undefined;
  const delivery = productCopy?.delivery as Record<string, string> | undefined;
  const trust = productCopy?.trust as Record<
    string,
    { title?: string; description?: string }
  > | undefined;
  const defaultLabel = t(dictionary, "product.default", "Default");
  const packagingExtra = t(dictionary, "product.packagingExtra", "packaging");
  const [selectedWeight, setSelectedWeight] = useState<WeightOption | undefined>(
    (product as any).weightOptions?.find((w: WeightOption) => w.isDefault)
  );
  const [selectedGrind, setSelectedGrind] = useState<GrindOption | undefined>(
    (product as any).grindOptions?.find((g: GrindOption) => g.isDefault && g.available)
  );
  const [selectedPackaging, setSelectedPackaging] = useState<PackagingOption | undefined>(undefined);
  const [packagingOptions, setPackagingOptions] = useState<PackagingOption[]>([]);
  const [loadingPackaging, setLoadingPackaging] = useState(true);

  // Get actual review data from product
  const averageRating = product?.averageRating || 0;
  const totalReviews = product?.totalReviews || 0;
  const descriptionText = toPlainText(product?.description);

  // Track product view on component mount
  useEffect(() => {
    if (product) {
      trackProductView({
        productId: product._id,
        name: product.name || "Unknown",
      });
    }
  }, [product]);

  // Fetch packaging from API (same as PackagingSelector)
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
        
        setPackagingOptions(transformedData);
      } catch (err) {
        console.error("Failed to load packaging", err);
      } finally {
        setLoadingPackaging(false);
      }
    }
    fetchPackaging();
  }, []);

  // Set default packaging after options are loaded
  useEffect(() => {
    if (packagingOptions.length > 0 && !selectedPackaging) {
      const defaultPkg = packagingOptions.find(p => p.default);
      if (defaultPkg) {
        console.log("Setting default packaging:", defaultPkg);
        setSelectedPackaging(defaultPkg);
      } else {
        setSelectedPackaging(packagingOptions[0]);
      }
    }
  }, [packagingOptions, selectedPackaging]);

  const currentPrice = selectedWeight?.price || product.price || 0;
  const packagingPrice = selectedPackaging?.price || 0;

  return (
    <ProductAnimationWrapper>
      <Container>
        {/* Breadcrumb Navigation */}
        <DynamicBreadcrumb
          productData={{
            name: product?.name || "",
            slug: product?.slug?.current || "",
          }}
        />

        <div className="flex flex-col md:flex-row gap-10 pb-6">
          {/* Product Images */}
          {product?.images && (
            <ProductImageWrapper>
              <ImageView images={product?.images} isStock={product?.stock} />
            </ProductImageWrapper>
          )}

          {/* Product Details */}
          <ProductDetailsWrapper>
            {/* Title and Category */}
            <div className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-bold text-shop_dark_green leading-tight">
                {product?.name}
              </h1>
              {descriptionText && (
                <p className="text-lg text-dark-text leading-relaxed">
                  {descriptionText}
                </p>
              )}

              {/* Enhanced Rating Display */}
              {totalReviews > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, index) => (
                      <StarIcon
                        key={index}
                        size={16}
                        className={`${
                          index < Math.floor(averageRating)
                            ? "text-shop_light_green fill-shop_light_green"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-shop_dark_green">
                    {averageRating.toFixed(1)} ({totalReviews}{" "}
                    {totalReviews === 1
                      ? (reviewsCopy?.review ?? "review")
                      : (reviewsCopy?.reviews ?? "reviews")})
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, index) => (
                      <StarIcon
                        key={index}
                        size={16}
                        className="text-gray-300"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {reviewsCopy?.noReviewsYet ?? "No reviews yet"}
                  </span>
                </div>
              )}
            </div>

            {/* Pricing Section */}
            <div className="space-y-4 border-t border-b border-gray-200 py-6 bg-white/70 rounded-lg px-4">
              <div className="flex items-baseline gap-2">
                <PriceView
                  price={currentPrice}
                  discount={product?.discount}
                  className="text-2xl font-bold"
                />
                {packagingPrice > 0 && (
                  <span className="text-sm text-gray-500">
                    + ${packagingPrice} {packagingExtra}
                  </span>
                )}
              </div>

              {/* Enhanced Stock Status */}
              <div className="flex items-center gap-3">
                <Badge
                  className={`text-sm font-semibold ${
                    product?.stock === 0
                      ? "bg-red-100 text-red-700 hover:bg-red-100"
                      : product?.stock && product.stock < 10
                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                      : "bg-green-100 text-green-700 hover:bg-green-100"
                  }`}
                >
                  {product?.stock === 0
                    ? (stockCopy?.outOfStock ?? "Out of Stock")
                    : product?.stock && product.stock < 10
                    ? (stockCopy?.lowStock ?? "Only {count} left!").replace(
                        "{count}",
                        String(product.stock),
                      )
                    : (stockCopy?.inStock ?? "In Stock")}
                </Badge>
              </div>

              {/* Discount Information */}
              {product?.discount && product.discount > 0 && (
                <div className="bg-shop_orange/10 text-shop_orange px-3 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2">
                  <BadgePercent className="h-4 w-4 shrink-0" />
                  {(t(dictionary, "product.saveDiscount", "Save {discount}% on this item!")).replace(
                    "{discount}",
                    String(product.discount),
                  )}
                </div>
              )}
            </div>

            {/* Weight Selection */}
            {(product as any).weightOptions && (product as any).weightOptions.length > 0 && (
              <div className="space-y-3">
                <label className="flex items-center gap-2 font-medium text-gray-700">
                  <Scale className="w-4 h-4 text-shop_dark_green" />
                  {select?.weight ?? "Select Weight"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(product as any).weightOptions.map((option: WeightOption) => (
                    <button
                      key={option.weight}
                      onClick={() => setSelectedWeight(option)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        selectedWeight?.weight === option.weight
                          ? "border-shop_dark_green bg-shop_dark_green/5 ring-2 ring-shop_dark_green/20"
                          : "border-gray-200 hover:border-shop_dark_green/50 hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{option.weight}</div>
                      <div className="text-sm text-gray-600">
                        ${option.price}
                      </div>
                      {option.isDefault && (
                        <div className="text-xs text-shop_dark_green mt-1">{defaultLabel}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Grind Selection */}
            {(product as any).grindOptions && (product as any).grindOptions.length > 0 && (
              <div className="space-y-3">
                <label className="flex items-center gap-2 font-medium text-gray-700">
                  <Coffee className="w-4 h-4 text-shop_dark_green" />
                  {select?.grind ?? "Select Grind"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(product as any).grindOptions
                    .filter((g: GrindOption) => g.available)
                    .map((option: GrindOption) => (
                      <button
                        key={option.grindType}
                        onClick={() => setSelectedGrind(option)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          selectedGrind?.grindType === option.grindType
                            ? "border-shop_dark_green bg-shop_dark_green/5 ring-2 ring-shop_dark_green/20"
                            : "border-gray-200 hover:border-shop_dark_green/50 hover:bg-gray-50"
                        }`}
                      >
                        <div className="font-semibold text-gray-900">
                          {getGrindLabel(dictionary, option.grindType)}
                        </div>
                        {option.isDefault && (
                          <div className="text-xs text-shop_dark_green mt-1">{defaultLabel}</div>
                        )}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Packaging Selection - Using API like PackagingSelector */}
            {loadingPackaging ? (
              <div className="space-y-3">
                <label className="flex items-center gap-2 font-medium text-gray-700">
                  <Package className="w-4 h-4 text-shop_dark_green" />
                  {select?.packaging ?? "Select Packaging"}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-20 bg-gray-100 animate-pulse rounded-lg"></div>
                  <div className="h-20 bg-gray-100 animate-pulse rounded-lg"></div>
                </div>
              </div>
            ) : packagingOptions.length > 0 ? (
              <div className="space-y-3">
                <label className="flex items-center gap-2 font-medium text-gray-700">
                  <Package className="w-4 h-4 text-shop_dark_green" />
                  {select?.packaging ?? "Select Packaging"}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {packagingOptions.map((pkg) => {
                    const isSelected = selectedPackaging?._id === pkg._id;
                    
                    // Get image URL safely
                    let imgUrl = "/placeholder-pkg.png";
                    if (pkg.imageUrl) {
                      imgUrl = pkg.imageUrl;
                    } else if (pkg.image && typeof pkg.image === 'object') {
                      const asset = (pkg.image as any).asset;
                      if (asset && asset.url) {
                        imgUrl = asset.url;
                      }
                    }
                    
                    return (
                      <button
                        key={pkg._id}
                        onClick={() => setSelectedPackaging(pkg)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-shop_dark_green bg-shop_dark_green/5 ring-2 ring-shop_dark_green/20"
                            : "border-gray-200 hover:border-shop_dark_green/50 hover:bg-gray-50"
                        }`}
                      >
                        <div className="relative w-10 h-10 shrink-0 bg-gray-50 rounded-md overflow-hidden">
                          <Image
                            src={imgUrl}
                            alt={pkg.title}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-gray-900">{pkg.title}</div>
                          <div className="text-sm text-gray-600">
                            {pkg.price === 0 ? t(dictionary, "common.free", "Free") : `+$${pkg.price}`}
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-5 h-5 text-shop_dark_green shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                {select?.noPackaging ?? "No packaging options available"}
              </div>
            )}

            {/* Action Buttons */}
            <ProductActionWrapper delay={0.3}>
              <div className="flex items-center gap-2.5 lg:gap-5">
                <AddToCartButton 
                  product={product}
                  selectedWeight={selectedWeight}
                  selectedGrind={selectedGrind}
                  selectedPackaging={selectedPackaging}
                />
                <FavoriteButton showProduct={true} product={product} />
              </div>
            </ProductActionWrapper>

            {/* Product Characteristics */}
            <ProductActionWrapper delay={0.4}>
              <ProductCharacteristics product={product} />
            </ProductActionWrapper>

            {/* Action Links */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-b-gray-200 py-5 -mt-2">
              <button className="flex items-center gap-2 text-sm text-black hover:text-shop_light_green hoverEffect transition-colors">
                <RxBorderSplit className="text-lg" />
                <span>{delivery?.compareColor ?? "Compare color"}</span>
              </button>
              <button className="flex items-center gap-2 text-sm text-black hover:text-shop_light_green hoverEffect transition-colors">
                <FaRegQuestionCircle className="text-lg" />
                <span>{delivery?.askQuestion ?? "Ask a question"}</span>
              </button>
              <button className="flex items-center gap-2 text-sm text-black hover:text-shop_light_green hoverEffect transition-colors">
                <TbTruckDelivery className="text-lg" />
                <span>{delivery?.title ?? "Delivery & Return"}</span>
              </button>
              <button className="flex items-center gap-2 text-sm text-black hover:text-shop_light_green hoverEffect transition-colors">
                <FiShare2 className="text-lg" />
                <span>{delivery?.share ?? "Share"}</span>
              </button>
            </div>

            {/* Delivery Information */}
            <ProductActionWrapper delay={0.5}>
              <div className="flex flex-col">
                <div className="border border-light-color/25 border-b-0 p-4 flex items-center gap-3 bg-white/70 rounded-t-lg">
                  <Truck size={32} className="text-shop_orange" />
                  <div>
                    <p className="text-lg font-semibold text-black">
                      {delivery?.freeDelivery ?? "Free Delivery"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {delivery?.postalCodeHint ??
                        "Enter your Postal code for Delivery Availability."}{" "}
                      <button className="underline underline-offset-2 hover:text-shop_light_green transition-colors">
                        {delivery?.checkNow ?? "Check now"}
                      </button>
                    </p>
                  </div>
                </div>
                <div className="border border-light-color/25 p-4 flex items-center gap-3 bg-white/70 rounded-b-lg">
                  <CornerDownLeft size={32} className="text-shop_orange" />
                  <div>
                    <p className="text-lg font-semibold text-black">
                      {delivery?.returnDelivery ?? "Return Delivery"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {delivery?.returnDetails ?? "Free 30 days Delivery Returns."}{" "}
                      <button className="underline underline-offset-2 hover:text-shop_light_green transition-colors">
                        {delivery?.details ?? "Details"}
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </ProductActionWrapper>
          </ProductDetailsWrapper>
        </div>

        {/* Product Details Section */}
        <ProductSectionWrapper delay={0.6}>
          <ProductsDetails product={product} />
        </ProductSectionWrapper>

        {/* Trust Indicators & Guarantees */}
        <ProductSectionWrapper delay={0.7}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8">
            <Card className="border-2 border-gray-100 text-center p-4">
              <Shield className="h-8 w-8 text-shop_orange mx-auto mb-2" />
              <h3 className="font-semibold text-shop_dark_green mb-1">
                {trust?.securePayment?.title ?? "Secure Payment"}
              </h3>
              <p className="text-sm text-gray-600">
                {trust?.securePayment?.description ??
                  "100% secure payment with SSL encryption"}
              </p>
            </Card>

            <Card className="border-2 border-gray-100 text-center p-4">
              <Truck className="h-8 w-8 text-shop_orange mx-auto mb-2" />
              <h3 className="font-semibold text-shop_dark_green mb-1">
                {trust?.fastDelivery?.title ?? "Fast Delivery"}
              </h3>
              <p className="text-sm text-gray-600">
                {trust?.fastDelivery?.description ??
                  "Free shipping on orders over $50"}
              </p>
            </Card>

            <Card className="border-2 border-gray-100 text-center p-4">
              <RefreshCw className="h-8 w-8 text-shop_orange mx-auto mb-2" />
              <h3 className="font-semibold text-shop_dark_green mb-1">
                {trust?.qualityPromise?.title ?? "Quality Promise"}
              </h3>
              <p className="text-sm text-gray-600">
                {trust?.qualityPromise?.description ??
                  "Fast help for damaged, incorrect, or quality-related issues"}
              </p>
            </Card>
          </div>
        </ProductSectionWrapper>

        {/* Product Specifications */}
        <ProductSectionWrapper delay={0.8}>
          <ProductSpecs product={product} />
        </ProductSectionWrapper>

        {/* Customer Reviews */}
        <ProductSectionWrapper delay={0.9}>
          <ProductReviews
            productId={product._id}
            productName={
              product.name ||
              t(dictionary, "product.defaultProductName", "this product")
            }
          />
        </ProductSectionWrapper>

        {/* Related Products */}
        <ProductSectionWrapper delay={1.0}>
          <RelatedProducts
            currentProduct={product}
            relatedProducts={relatedProducts}
          />
        </ProductSectionWrapper>
      </Container>
    </ProductAnimationWrapper>
  );
};

export default ProductContent;