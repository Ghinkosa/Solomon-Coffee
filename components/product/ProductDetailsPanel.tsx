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
            if (!detailPanelPosition.isMobile && window.innerWidth >= 768)
              return;
            schedulePanelClose();
          }}
          className={`absolute z-30 flex flex-col rounded-xl border border-[#e4c290]/40 bg-[#3a2417] text-[#fdf6e8] shadow-2xl ring-1 ring-[#e4c290]/25 ${
            isCompact ? "p-4 md:p-5" : "p-5"
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
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#e4c290]">
              Coffee details
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-[#e4c290]/80 transition-colors hover:bg-[#2a1810]/60 hover:text-[#fdf6e8]"
              aria-label="Close details"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <ProductExpandedDetails
              product={expandedProduct}
              variant={variant}
            />

            <div className="space-y-3 rounded-lg border border-[#e4c290]/25 bg-[#2a1810]/50 p-3.5">
              <PriceView
                price={expandedProduct.price}
                discount={expandedProduct.discount}
                variant="onDark"
              />
              <AddToCartButton
                product={expandedProduct}
                theme="onDark"
                className={`rounded-full !bg-[#e4c290] !text-[#3a2417] !border-[#e4c290] hover:!bg-[#fdf6e8] hover:!text-[#3a2417] hover:!border-[#fdf6e8] ${
                  isCompact ? "w-full" : "w-full max-w-none"
                }`}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
