"use client";

import React, { useEffect, useState, useCallback } from "react";
import ProductCard from "./ProductCard";
import { motion, AnimatePresence } from "motion/react";
import { client } from "@/sanity/lib/client";
import HomeTabbar from "./HomeTabbar";
import { productType } from "@/constants";
import NoProductAvailable from "./product/NoProductAvailable";
import { Filter } from "lucide-react";
import Container from "./Container";
import { ALL_PRODUCTS_QUERYResult } from "@/sanity.types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductGridSkeleton } from "./ProductSkeletons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

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
  const [products, setProducts] = useState<ALL_PRODUCTS_QUERYResult>([]);
  const [filteredProducts, setFilteredProducts] =
    useState<ALL_PRODUCTS_QUERYResult>([]);
  const [loading, setLoading] = useState(false);
  
  /**
   * CRITICAL FIX: 
   * Initializing with .value ensuring it matches "Light Roast" (Capitalized)
   * which matches your Sanity TypeGen definitions exactly.
   */
  const [selectedTab, setSelectedTab] = useState(productType[0]?.value || "Light Roast");
  
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [showFilters, setShowFilters] = useState(false);
  const [productsPerPage] = useState(20);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [stockStatus, setStockStatus] = useState<string>("all");
  const [rating, setRating] = useState<string>("all");

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

  /**
   * QUERY FIX:
   * We search for the exact string stored in $variant.
   * Your Sanity type uses "Light Roast", so $variant must be "Light Roast".
   */
  const query = `*[_type == "product" && variant == $variant] | order(${getSortQuery(sortBy)}){
    ...,
    "categories": categories[]->title
  }`;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // FIX: Removed .toLowerCase(). Sending "Light Roast" directly.
        const data = await client.fetch(query, { variant: selectedTab });
        
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
    let filtered = [...products];

    if (priceRange[0] > 0 || priceRange[1] < 1000) {
      filtered = filtered.filter((product) => {
        const price = product.price || 0;
        const finalPrice = product.discount
          ? price - price * (product.discount / 100)
          : price;
        return finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
      });
    }

    if (stockStatus !== "all") {
      filtered = filtered.filter((p) => 
        stockStatus === "in-stock" ? (p.stock || 0) > 0 : (p.stock || 0) === 0
      );
    }

    if (rating !== "all") {
      filtered = filtered.filter((p) => {
        if (rating === "5") return p.status === "hot";
        if (rating === "4") return p.status === "hot" || p.status === "new";
        return true;
      });
    }

    setFilteredProducts(filtered);
  }, [products, priceRange, stockStatus, rating]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const gridClasses = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3";

  return (
    <Container className="flex flex-col lg:px-0 mt-16 lg:mt-24">
      <div className="text-center mb-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-dark-color mb-2">
          Featured Coffee Selection
        </h2>
        <p className="text-light-color text-lg max-w-2xl mx-auto">
          Freshly roasted picks and customer favorites from Sheba&apos;s Coffee
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-shop_light_green/10 p-6 mb-8">
        <HomeTabbar
          selectedTab={selectedTab}
          onTabSelect={setSelectedTab}
          dictionary={dictionary?.home?.featuredProducts}
        />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} className="mr-2" /> Filters
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="price-asc">Price (Low-High)</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
            <Badge className="bg-shop_light_pink text-shop_dark_green">
              {filteredProducts.length} items
            </Badge>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <div className="space-y-2">
                  <Label>Price Range (${priceRange[0]} - ${priceRange[1]})</Label>
                  <Slider value={priceRange} onValueChange={setPriceRange} max={1000} step={10} />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Select value={stockStatus} onValueChange={setStockStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="in-stock">In Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                   <Button variant="ghost" onClick={() => {setPriceRange([0,1000]); setStockStatus("all")}}>Reset</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading ? (
        <ProductGridSkeleton />
      ) : filteredProducts?.length > 0 ? (
        <div className={`grid ${gridClasses}`}>
          <AnimatePresence mode="popLayout">
            {filteredProducts.slice(0, productsPerPage).map((product) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <NoProductAvailable selectedTab={selectedTab} />
      )}
    </Container>
  );
};

export default ProductGrid;