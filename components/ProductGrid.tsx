"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import ProductCard from "./ProductCard";
import { motion, AnimatePresence } from "motion/react";
import { client } from "@/sanity/lib/client";
import HomeTabbar from "./HomeTabbar";
import NoProductAvailable from "./product/NoProductAvailable";
import Container from "./Container";
import type { Product } from "@/sanity.types";
import { ProductGridSkeleton } from "./ProductSkeletons";
import { ProductDetailsPanel } from "./product/ProductDetailsPanel";
import {
  getHomeGridColumnCount,
  useProductDetailsPanel,
} from "@/hooks/useProductDetailsPanel";
import Link from "next/link";

type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "newest";

const ProductGrid = ({
  dictionary,
  lang,
}: {
  dictionary: any;
  lang: string;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedTab, setSelectedTab] = useState<string | null>(null);

  const sortBy: SortOption = "name-asc";

  const [visibleCount, setVisibleCount] = useState(() =>
    typeof window !== "undefined" && window.innerWidth >= 768 ? 3 : 4,
  );

  useEffect(() => {
    const updateVisibleCount = () => {
      setVisibleCount(window.innerWidth < 768 ? 4 : 3);
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  function getSortQuery(sort: SortOption): string {
    switch (sort) {
      case "name-asc":
        return "name asc";
      case "name-desc":
        return "name desc";
      case "price-asc":
        return "price asc";
      case "price-desc":
        return "price desc";
      case "newest":
        return "_createdAt desc";
      default:
        return "name asc";
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const baseQuery = `*[_type == "product"] | order(${getSortQuery(sortBy)}) {
          ...,
          "categories": categories[]->title,
          weightOptions[],
          grindOptions[],
          packagingOptions[] {
            ...,
            packaging-> {
              _id,
              title,
              slug,
              description,
              price,
              default,
              "imageUrl": image.asset->url
            }
          }
        }`;

        const filteredQuery = selectedTab
          ? `*[_type == "product" && variant == $variant] | order(${getSortQuery(sortBy)}) {
              ...,
              "categories": categories[]->title,
              weightOptions[],
              grindOptions[],
              packagingOptions[] {
                ...,
                packaging-> {
                  _id,
                  title,
                  slug,
                  description,
                  price,
                  default,
                  "imageUrl": image.asset->url
                }
              }
            }`
          : baseQuery;

        const data = selectedTab
          ? await client.fetch(filteredQuery, { variant: selectedTab })
          : await client.fetch(baseQuery);

        const fetchedProducts = data || [];
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
      } catch (error) {
        console.error("Sanity Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedTab, sortBy]);

  const applyFilters = useCallback(() => {
    setFilteredProducts(products);
  }, [products]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount],
  );

  const {
    gridWrapperRef,
    expandedCardId,
    expandedProduct,
    detailPanelPosition,
    registerCardRef,
    handleImageTap,
    openDetailsPanel,
    clearClosePanelTimeout,
    schedulePanelClose,
    closePanel,
  } = useProductDetailsPanel({
    products: visibleProducts,
    getColumnCount: getHomeGridColumnCount,
    layout: "home",
  });

  useEffect(() => {
    closePanel();
  }, [selectedTab, closePanel]);

  const gridClasses = "grid-cols-2 md:grid-cols-3 gap-3";

  return (
    <Container className="flex flex-col lg:px-0">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="h-1 w-12 rounded-full bg-linear-to-r from-shop_light_green to-shop_dark_green" />
          <h2 className="text-3xl lg:text-4xl font-bold text-dark-color">
            Featured Coffee Selection
          </h2>
          <div className="h-1 w-12 rounded-full bg-linear-to-l from-shop_light_green to-shop_dark_green" />
        </div>
      </div>

      <div className="mb-8">
        <HomeTabbar selectedTab={selectedTab} onTabSelect={setSelectedTab} />
      </div>

      {loading ? (
        <ProductGridSkeleton />
      ) : filteredProducts?.length > 0 ? (
        <div
          ref={gridWrapperRef}
          className={`relative overflow-visible transition-[padding] duration-200 ${
            expandedProduct && detailPanelPosition?.placement === "below"
              ? "pb-72 md:pb-64"
              : ""
          }`}
        >
          <div className={`grid ${gridClasses}`}>
            <AnimatePresence mode="popLayout">
              {visibleProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  ref={(node) => registerCardRef(product._id, node)}
                  className={
                    expandedCardId === product._id ? "relative z-20" : undefined
                  }
                >
                  <ProductCard
                    product={product}
                    mode="home"
                    isExpanded={expandedCardId === product._id}
                    onImageTap={() => handleImageTap(product, index)}
                    onHoverStart={() => {
                      if (window.innerWidth < 768) return;
                      clearClosePanelTimeout();
                      openDetailsPanel(product, index);
                    }}
                    onHoverEnd={() => {
                      if (window.innerWidth < 768) return;
                      schedulePanelClose();
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <ProductDetailsPanel
            expandedProduct={expandedProduct}
            detailPanelPosition={detailPanelPosition}
            onClose={closePanel}
            clearClosePanelTimeout={clearClosePanelTimeout}
            schedulePanelClose={schedulePanelClose}
            variant="compact"
            lang={lang}
          />
        </div>
      ) : (
        <NoProductAvailable selectedTab={selectedTab || undefined} />
      )}

      <div className="mt-8 pb-6 flex justify-center">
        <Link
          href={`/${lang}/shop`}
          className="border border-dark-color px-4 py-1 rounded-full hover:bg-shop_light_green hover:text-white hover:border-shop_light_green hoverEffect"
        >
          {dictionary?.home?.featuredProducts?.seeAll || "See all"}
        </Link>
      </div>
    </Container>
  );
};

export default ProductGrid;
