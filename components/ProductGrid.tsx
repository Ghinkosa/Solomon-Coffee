"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import ProductCard from "./ProductCard";
import { motion, AnimatePresence } from "motion/react";
import { client } from "@/sanity/lib/client";
import HomeTabbar from "./HomeTabbar";
import NoProductAvailable from "./product/NoProductAvailable";
import Container from "./Container";
import { ALL_PRODUCTS_QUERYResult, Product } from "@/sanity.types";
import { ProductGridSkeleton } from "./ProductSkeletons";
import PriceView from "./PriceView";
import AddToCartButton from "./AddToCartButton";
import { X } from "lucide-react";
import Link from "next/link";

type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "newest";

interface DetailPanelPosition {
  top: number;
  left: number;
  width: number;
  openToRight: boolean;
  isMobile: boolean;
}

const ProductGrid = ({
  dictionary,
  lang,
}: {
  dictionary: any;
  lang: string;
}) => {
  const [products, setProducts] = useState<ALL_PRODUCTS_QUERYResult>([]);
  const [filteredProducts, setFilteredProducts] =
    useState<ALL_PRODUCTS_QUERYResult>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  
  const sortBy: SortOption = "name-asc";
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<Product | null>(null);
  const [detailPanelPosition, setDetailPanelPosition] =
    useState<DetailPanelPosition | null>(null);
  const [productsPerPage] = useState(20);
  const gridWrapperRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const closePanelTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  function getSortQuery(sort: SortOption): string {
    switch (sort) {
      case "name-asc": return "name asc";
      case "name-desc": return "name desc";
      case "price-asc": return "price asc";
      case "price-desc": return "price desc";
      case "newest": return "_createdAt desc";
      default: return "name asc";
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const query = selectedTab
          ? `*[_type == "product" && variant == $variant] | order(${getSortQuery(sortBy)}){
              ...,
              "categories": categories[]->title
            }`
          : `*[_type == "product"] | order(${getSortQuery(sortBy)}){
              ...,
              "categories": categories[]->title
            }`;
        const data = selectedTab
          ? await client.fetch(query, { variant: selectedTab })
          : await client.fetch(query);
        
        // Ensure data is always an array
        const fetchedProducts = data || [];
        
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
        
        console.log(`Fetched ${fetchedProducts.length} items for ${selectedTab}`);
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

  useEffect(() => {
    setExpandedCardId(null);
    setExpandedProduct(null);
    setDetailPanelPosition(null);
  }, [selectedTab, filteredProducts.length]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, productsPerPage),
    [filteredProducts, productsPerPage],
  );

  function getColumnCount(): number {
    if (typeof window === "undefined") return 1;
    if (window.innerWidth >= 1024) return 5;
    if (window.innerWidth >= 768) return 4;
    if (window.innerWidth >= 640) return 3;
    return 2;
  }

  const openDetailsPanel = useCallback(
    (product: Product, index: number) => {
      const cardNode = cardRefs.current[product._id];
      const wrapperNode = gridWrapperRef.current;
      if (!cardNode || !wrapperNode) return;

      const cardRect = cardNode.getBoundingClientRect();
      const wrapperRect = wrapperNode.getBoundingClientRect();
      const cardWidth = cardRect.width;
      const gap = 12;
      const isMobile = window.innerWidth < 768;
      const columns = getColumnCount();
      const columnIndex = index % columns;
      const openToRight = columnIndex < columns - 1;
      const rawLeft = isMobile
        ? 0
        : openToRight
          ? cardRect.left - wrapperRect.left + cardWidth + gap
          : cardRect.left - wrapperRect.left - cardWidth - gap;
      const panelWidth = isMobile ? wrapperRect.width : cardWidth;
      const left = Math.max(
        0,
        Math.min(rawLeft, Math.max(0, wrapperRect.width - panelWidth)),
      );
      const top = isMobile
        ? cardRect.top - wrapperRect.top + cardRect.height + gap
        : cardRect.top - wrapperRect.top;

      setExpandedCardId(product._id);
      setExpandedProduct(product);
      setDetailPanelPosition({
        top,
        left,
        width: panelWidth,
        openToRight,
        isMobile,
      });
    },
    [],
  );

  const handleImageTap = useCallback(
    (product: Product, index: number) => {
      if (expandedCardId === product._id) {
        setExpandedCardId(null);
        setExpandedProduct(null);
        setDetailPanelPosition(null);
        return;
      }
      openDetailsPanel(product, index);
    },
    [expandedCardId, openDetailsPanel],
  );

  useEffect(() => {
    if (!expandedProduct) return;
    const currentIndex = visibleProducts.findIndex((p) => p._id === expandedProduct._id);
    if (currentIndex < 0) return;

    const handleResize = () => openDetailsPanel(expandedProduct, currentIndex);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [expandedProduct, openDetailsPanel, visibleProducts]);

  useEffect(
    () => () => {
      if (closePanelTimeoutRef.current) clearTimeout(closePanelTimeoutRef.current);
    },
    [],
  );

  const clearClosePanelTimeout = useCallback(() => {
    if (!closePanelTimeoutRef.current) return;
    clearTimeout(closePanelTimeoutRef.current);
    closePanelTimeoutRef.current = null;
  }, []);

  const closePanel = useCallback(() => {
    setExpandedCardId(null);
    setExpandedProduct(null);
    setDetailPanelPosition(null);
  }, []);

  const schedulePanelClose = useCallback(() => {
    clearClosePanelTimeout();
    closePanelTimeoutRef.current = setTimeout(() => closePanel(), 120);
  }, [clearClosePanelTimeout, closePanel]);

  const gridClasses = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3";

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
        <p className="text-light-color text-lg max-w-2xl mx-auto">
          Freshly roasted picks and customer favorites from Sheba Cup Coffee
        </p>
      </div>

      <div className="mb-8">
        <HomeTabbar
          selectedTab={selectedTab}
          onTabSelect={setSelectedTab}
        />
      </div>

      {loading ? (
        <ProductGridSkeleton />
      ) : filteredProducts?.length > 0 ? (
        <div ref={gridWrapperRef} className="relative overflow-x-hidden">
          <div className={`grid ${gridClasses}`}>
          <AnimatePresence mode="popLayout">
            {visibleProducts.map((product, index) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                ref={(node) => {
                  cardRefs.current[product._id] = node;
                }}
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
          <AnimatePresence>
            {expandedProduct && detailPanelPosition && (
              <motion.div
                initial={{
                  opacity: 0,
                  x: detailPanelPosition.isMobile
                    ? 0
                    : detailPanelPosition.openToRight
                      ? 16
                      : -16,
                  y: detailPanelPosition.isMobile ? 8 : 0,
                }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{
                  opacity: 0,
                  x: detailPanelPosition.isMobile
                    ? 0
                    : detailPanelPosition.openToRight
                      ? 16
                      : -16,
                  y: detailPanelPosition.isMobile ? 8 : 0,
                }}
                transition={{ duration: 0.2 }}
                onMouseEnter={clearClosePanelTimeout}
                onMouseLeave={() => {
                  if (window.innerWidth < 768) return;
                  schedulePanelClose();
                }}
                className="absolute z-30 rounded-xl border border-[#e4c290]/35 bg-shop_dark_green p-5 text-[#e4c290] shadow-2xl ring-1 ring-[#e4c290]/20"
                style={{
                  top: detailPanelPosition.top,
                  left: detailPanelPosition.left,
                  width: detailPanelPosition.width,
                }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#e4c290]">
                    Coffee details
                  </p>
                  <button
                    type="button"
                    onClick={closePanel}
                    className="text-[#e4c290]/70 hover:text-[#fdf6e8] transition-colors"
                    aria-label="Close details"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-3 max-h-56 space-y-3 overflow-y-auto pr-1">
                  {expandedProduct?.categories && (
                    <p className="rounded-md bg-[#3a2417]/70 px-2 py-1 uppercase line-clamp-2 text-xs font-medium text-[#fdf6e8]">
                      {expandedProduct.categories.map((cat) => cat).join(", ")}
                    </p>
                  )}

                  <PriceView
                    price={expandedProduct?.price}
                    discount={expandedProduct?.discount}
                    className="text-sm mt-2 text-[#fdf6e8]"
                  />
                  <AddToCartButton
                    product={expandedProduct}
                    className="w-40 rounded-full mt-3 !bg-[#e4c290] !text-[#09332c] !border-[#e4c290] hover:!bg-[#fdf6e8] hover:!text-[#09332c] hover:!border-[#fdf6e8]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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