"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { Product } from "@/sanity.types";
import type { DetailPanelPosition } from "@/hooks/useProductDetailsPanel";
import PriceView from "@/components/PriceView";
import AddToCartButton from "@/components/AddToCartButton";
import { ProductExpandedDetails } from "./ProductExpandedDetails";

interface ProductDetailsPanelProps {
  expandedProduct: Product | null;
  detailPanelPosition: DetailPanelPosition | null;
  onClose: () => void;
  clearClosePanelTimeout: () => void;
  schedulePanelClose: () => void;
  variant?: "default" | "compact";
}

export function ProductDetailsPanel({
  expandedProduct,
  detailPanelPosition,
  onClose,
  clearClosePanelTimeout,
  schedulePanelClose,
  variant = "default",
}: ProductDetailsPanelProps) {
  const isCompact = variant === "compact";
  return (
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
            y: detailPanelPosition.isMobile ? 6 : 0,
          }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{
            opacity: 0,
            x: detailPanelPosition.isMobile
              ? 0
              : detailPanelPosition.openToRight
                ? 16
                : -16,
            y: detailPanelPosition.isMobile ? 6 : 0,
          }}
          transition={{ duration: 0.2 }}
          onMouseEnter={clearClosePanelTimeout}
          onMouseLeave={() => {
            if (!detailPanelPosition.isMobile && window.innerWidth >= 768) return;
            schedulePanelClose();
          }}
          className={`absolute z-30 flex flex-col rounded-xl border border-[#e4c290]/35 bg-shop_dark_green text-[#e4c290] shadow-2xl ring-1 ring-[#e4c290]/20 ${
            isCompact ? "p-4 md:p-5" : "p-6"
          }`}
          style={{
            top: detailPanelPosition.top,
            left: detailPanelPosition.left,
            width: detailPanelPosition.width,
            ...(detailPanelPosition.minHeight > 0
              ? { minHeight: detailPanelPosition.minHeight }
              : {}),
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#e4c290]">
              Coffee details
            </p>
            <button
              type="button"
              onClick={onClose}
              className="text-[#e4c290]/70 hover:text-[#fdf6e8] transition-colors"
              aria-label="Close details"
            >
              <X size={16} />
            </button>
          </div>

          <div
            className={`mt-3 flex flex-1 gap-4 ${
              isCompact
                ? "flex-col md:flex-row md:items-end md:justify-between"
                : "flex-col justify-between"
            }`}
          >
            <ProductExpandedDetails
              product={expandedProduct}
              variant={variant}
            />

            <div
              className={`shrink-0 space-y-3 ${
                isCompact
                  ? "border-t border-[#e4c290]/20 pt-3 md:border-t-0 md:border-l md:pl-5 md:pt-0"
                  : "border-t border-[#e4c290]/20 pt-3"
              }`}
            >
              <PriceView
                price={expandedProduct.price}
                discount={expandedProduct.discount}
                className="text-base text-[#fdf6e8]"
              />
              <AddToCartButton
                product={expandedProduct}
                className={`rounded-full !bg-[#e4c290] !text-[#09332c] !border-[#e4c290] hover:!bg-[#fdf6e8] hover:!text-[#09332c] hover:!border-[#fdf6e8] ${
                  isCompact ? "w-full md:w-36" : "w-full max-w-[11rem]"
                }`}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
