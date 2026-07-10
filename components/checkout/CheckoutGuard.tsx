"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useCartStore from "@/store";
import { CheckoutSkeleton } from "@/components/checkout/CheckoutSkeleton";
import { useLocalizedPath } from "@/hooks/useLocale";

interface CheckoutGuardProps {
  children: React.ReactNode;
}

export function CheckoutGuard({ children }: CheckoutGuardProps) {
  const router = useRouter();
  const { items: cart } = useCartStore();
  const toLocalizedPath = useLocalizedPath();

  useEffect(() => {
    // Check if cart is empty on mount and redirect to cart page
    if (cart !== undefined && cart.length === 0) {
      router.replace(toLocalizedPath("/cart"));
    }
  }, [cart, router, toLocalizedPath]);

  // Show loading while cart is being checked or during redirect
  if (cart === undefined || cart.length === 0) {
    return <CheckoutSkeleton />;
  }

  return <>{children}</>;
}
