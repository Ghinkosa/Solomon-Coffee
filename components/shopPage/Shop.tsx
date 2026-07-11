"use client";
import { Category, Product } from "@/sanity.types";
import { client } from "@/sanity/lib/client";
import React, { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import Container from "../Container";
import Title from "../Title";
import CategoryList from "./CategoryList";
import ShopWholesaleSection from "./ShopWholesaleSection";
import { Filter, X } from "lucide-react";
import ProductCard from "../ProductCard";
import NoProductAvailable from "../product/NoProductAvailable";
import { ProductDetailsPanel } from "../product/ProductDetailsPanel";
import {
  getShopGridColumnCount,
  useProductDetailsPanel,
} from "@/hooks/useProductDetailsPanel";

interface Props {
  categories: Category[];
  dictionary: any;
}

const Shop = ({ categories, dictionary }: Props) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const query = `
        *[_type == 'product' 
          && (!defined($selectedCategory) || references(*[_type == "category" && slug.current == $selectedCategory]._id))
        ] 
        | order(name asc) {
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
        }
      `;

      const data = await client.fetch(
        query,
        { selectedCategory },
        { next: { revalidate: 0 } },
      );

      setProducts(data || []);
    } catch (error) {
      console.log("Shop product fetching Error", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, selectedCategory]);

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
    products,
    getColumnCount: getShopGridColumnCount,
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <Container className="py-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <Title className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                {dictionary?.shop?.title || "Shop"}
              </Title>
              <p className="text-gray-600 text-sm">
                {dictionary?.shop?.description || "Browse our collection of premium coffee"}
              </p>
            </div>
            {selectedCategory !== null && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 transition-colors duration-200 text-sm font-medium"
              >
                {dictionary?.shop?.clearFilters || "Clear Filters"}
              </button>
            )}
          </div>

          {selectedCategory && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">
                  {dictionary?.shop?.activeFilters || "Active Filters:"}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {dictionary?.shop?.category || "Category"}:{" "}
                  {
                    categories?.find(
                      (cat) => cat?.slug?.current === selectedCategory,
                    )?.title
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="inline-flex items-center justify-center w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-shop_dark_green transition-colors duration-200"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showMobileFilters
              ? (dictionary?.shop?.hideFilters || "Hide Filters")
              : (dictionary?.shop?.showFilters || "Show Filters")}
            {selectedCategory && (
              <span className="ml-2 bg-shop_dark_green text-white text-xs px-2 py-1 rounded-full">
                1
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Filter Overlay */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="fixed inset-0 bg-black/50"
                onClick={() => setShowMobileFilters(false)}
              />
              <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl max-h-[80vh] overflow-y-auto">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {dictionary?.shop?.filters || "Filters"}
                  </h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="divide-y divide-gray-100">
                  <CategoryList
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    categoryFilterTitle={
                      dictionary?.shop?.categoryFilterTitle || "Categories"
                    }
                    clearCategoryFilterLabel={
                      dictionary?.shop?.clearCategoryFilter ||
                      "Clear category filter"
                    }
                  />
                </div>
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full bg-shop_dark_green text-white py-3 px-4 rounded-lg font-medium hover:bg-shop_dark_green/90 transition-colors duration-200"
                  >
                    {dictionary?.shop?.applyFilters || "Apply Filters"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="sticky top-6 space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {dictionary?.shop?.filters || "Filters"}
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  <CategoryList
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    categoryFilterTitle={
                      dictionary?.shop?.categoryFilterTitle || "Categories"
                    }
                    clearCategoryFilterLabel={
                      dictionary?.shop?.clearCategoryFilter ||
                      "Clear category filter"
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 sm:p-6">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-pulse"
                      >
                        <div className="aspect-square bg-gray-200"></div>
                        <div className="p-4 space-y-3">
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-8 bg-gray-200 rounded w-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : products?.length > 0 ? (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 pb-4 border-b border-gray-100">
                      <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">
                        {products.length} {dictionary?.shop?.productsFound || "products found"}
                      </h2>
                      <div className="text-sm text-gray-600">
                        {dictionary?.shop?.showingAll || "Showing all products"}
                      </div>
                    </div>
                    <div
                      ref={gridWrapperRef}
                      className="relative overflow-x-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        <AnimatePresence mode="popLayout">
                          {products.map((product, index) => (
                            <motion.div
                              key={product._id}
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="h-full"
                              ref={(node) => registerCardRef(product._id, node)}
                            >
                              <ProductCard
                                product={product}
                                mode="shop"
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
                      />
                    </div>
                  </div>
                ) : (
                  <div className="py-12">
                    <NoProductAvailable className="bg-transparent" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>

      {dictionary?.wholesalers && (
        <ShopWholesaleSection dictionary={dictionary.wholesalers} />
      )}
    </div>
  );
};

export default Shop;
