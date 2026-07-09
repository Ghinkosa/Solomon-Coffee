"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Coffee, X } from "lucide-react";
import Link from "next/link";
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
  lang?: string;
}

export function ProductDetailsPanel({
  expandedProduct,
  detailPanelPosition,
  onClose,
  clearClosePanelTimeout,
  schedulePanelClose,
  variant = "default",
  lang,
}: ProductDetailsPanelProps) {
  const isCompact = variant === "compact";
  const isSidePanel = detailPanelPosition?.placement === "side";

  return (
    <AnimatePresence>
      {expandedProduct && detailPanelPosition && (
        <motion.div
          initial={{
            opacity: 0,
            x: isSidePanel
              ? detailPanelPosition.openToRight
                ? 20
                : -20
              : 0,
            y: isSidePanel ? 0 : 10,
            scale: isSidePanel ? 0.97 : 1,
          }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{
            opacity: 0,
            x: isSidePanel
              ? detailPanelPosition.openToRight
                ? 20
                : -20
              : 0,
            y: isSidePanel ? 0 : 10,
            scale: isSidePanel ? 0.97 : 1,
          }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onMouseEnter={clearClosePanelTimeout}
          onMouseLeave={() => {
            if (isSidePanel) return;
            schedulePanelClose();
          }}
          className={`absolute z-40 flex flex-col overflow-hidden rounded-2xl border border-[#e4c290]/45 bg-[#3a2417] text-[#fdf6e8] shadow-[0_24px_60px_-12px_rgba(20,10,5,0.55)] ring-1 ring-[#e4c290]/20 ${
            isSidePanel ? "p-4 md:p-5" : "p-4 md:p-5"
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
          {isSidePanel && (
            <span
              aria-hidden
              className={`pointer-events-none absolute top-10 h-4 w-4 rotate-45 border-[#e4c290]/45 bg-[#3a2417] ${
                detailPanelPosition.openToRight
                  ? "-left-2 border-b border-l"
                  : "-right-2 border-r border-t"
              }`}
            />
          )}

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e4c290]/15 text-[#e4c290]">
                <Coffee size={14} />
              </span>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#e4c290]">
                {isSidePanel ? "Quick look" : "Coffee details"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-[#e4c290]/80 transition-colors hover:bg-[#2a1810]/70 hover:text-[#fdf6e8]"
              aria-label="Close details"
            >
              <X size={15} />
            </button>
          </div>

          <div className="mt-4 flex flex-1 flex-col gap-4">
            <ProductExpandedDetails
              product={expandedProduct}
              variant={isSidePanel && isCompact ? "side" : variant}
            />

            <div className="mt-auto space-y-3 rounded-xl border border-[#e4c290]/30 bg-[#2a1810]/70 p-3.5">
              <PriceView
                price={expandedProduct.price}
                discount={expandedProduct.discount}
                variant="onDark"
              />
              <AddToCartButton
                product={expandedProduct}
                theme="onDark"
                className="w-full rounded-full !border-[#e4c290] !bg-[#e4c290] !text-[#3a2417] hover:!border-[#fdf6e8] hover:!bg-[#fdf6e8] hover:!text-[#3a2417]"
              />
            </div>

            {isSidePanel && expandedProduct.slug?.current && (
              <Link
                href={`/${lang || "en"}/product/${expandedProduct.slug.current}`}
                className="group inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#e4c290] transition-colors hover:text-[#fdf6e8]"
              >
                View full details
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
