"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/sanity.types";

export interface DetailPanelPosition {
  top: number;
  left: number;
  width: number;
  minHeight: number;
  openToRight: boolean;
  isMobile: boolean;
}

export type ProductDetailsPanelLayout = "home" | "shop";

interface UseProductDetailsPanelOptions {
  products: Product[];
  getColumnCount: () => number;
  layout?: ProductDetailsPanelLayout;
}

export function useProductDetailsPanel({
  products,
  getColumnCount,
  layout = "shop",
}: UseProductDetailsPanelOptions) {
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<Product | null>(null);
  const [detailPanelPosition, setDetailPanelPosition] =
    useState<DetailPanelPosition | null>(null);
  const gridWrapperRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const closePanelTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      const isHomeLayout = layout === "home";
      const columns = getColumnCount();
      const columnIndex = index % columns;
      const openToRight = columnIndex < columns - 1;

      let top: number;
      let left: number;
      let panelWidth: number;
      let panelMinHeight: number;

      if (isHomeLayout || isMobile) {
        const rowIndex = Math.floor(index / columns);
        const rowStart = rowIndex * columns;
        const rowEnd = Math.min(rowStart + columns, products.length);
        let rowBottom = cardRect.bottom;

        for (let i = rowStart; i < rowEnd; i++) {
          const rowProduct = products[i];
          const rowNode = cardRefs.current[rowProduct._id];
          if (!rowNode) continue;
          rowBottom = Math.max(rowBottom, rowNode.getBoundingClientRect().bottom);
        }

        top = rowBottom - wrapperRect.top + gap;
        left = 0;
        panelWidth = wrapperRect.width;
        panelMinHeight = 0;
      } else {
        const rawLeft = openToRight
          ? cardRect.left - wrapperRect.left + cardWidth + gap
          : cardRect.left - wrapperRect.left - cardWidth - gap;
        panelWidth = Math.max(cardWidth * 1.2, 280);
        panelMinHeight = Math.max(cardRect.height, 360);
        left = Math.max(
          0,
          Math.min(rawLeft, Math.max(0, wrapperRect.width - panelWidth)),
        );
        top = cardRect.top - wrapperRect.top;
      }

      setExpandedCardId(product._id);
      setExpandedProduct(product);
      setDetailPanelPosition({
        top,
        left,
        width: panelWidth,
        minHeight: panelMinHeight,
        openToRight: isHomeLayout || isMobile ? true : openToRight,
        isMobile: isHomeLayout || isMobile,
      });
    },
    [getColumnCount, layout, products],
  );

  const handleImageTap = useCallback(
    (product: Product, index: number) => {
      if (expandedCardId === product._id) {
        closePanel();
        return;
      }
      openDetailsPanel(product, index);
    },
    [expandedCardId, closePanel, openDetailsPanel],
  );

  const registerCardRef = useCallback((productId: string, node: HTMLDivElement | null) => {
    cardRefs.current[productId] = node;
  }, []);

  useEffect(() => {
    closePanel();
  }, [products.length, closePanel]);

  useEffect(() => {
    if (!expandedProduct) return;
    const currentIndex = products.findIndex((p) => p._id === expandedProduct._id);
    if (currentIndex < 0) return;

    const handleResize = () => openDetailsPanel(expandedProduct, currentIndex);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [expandedProduct, openDetailsPanel, products]);

  useEffect(
    () => () => {
      if (closePanelTimeoutRef.current) clearTimeout(closePanelTimeoutRef.current);
    },
    [],
  );

  return {
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
  };
}

export function getHomeGridColumnCount(): number {
  if (typeof window === "undefined") return 1;
  if (window.innerWidth >= 1024) return 5;
  if (window.innerWidth >= 768) return 4;
  if (window.innerWidth >= 640) return 3;
  return 2;
}

export function getShopGridColumnCount(): number {
  if (typeof window === "undefined") return 1;
  if (window.innerWidth >= 1280) return 4;
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 640) return 2;
  return 1;
}
