import Container from "@/components/Container";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import { ShoppingBag } from "lucide-react";
import { CheckoutContent } from "@/components/checkout/CheckoutContent";
import { notFound } from "next/navigation";
import { getOrderById } from "@/sanity/queries";
import { currentUser } from "@clerk/nextjs/server";
import { OrderCheckoutContent } from "@/components/checkout/OrderCheckoutContent";
import { Suspense } from "react";

import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

interface Props {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    orderId?: string;
  }>;
}

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  const bc = (dictionary?.breadcrumb ?? {}) as Record<string, string>;
  const checkoutMeta = (dictionary?.checkout ?? {}) as Record<string, string>;
  const { orderId } = await searchParams;
  const user = await currentUser();

  // If there's an orderId, this is a payment for an existing order
  if (orderId) {
    if (!user) {
      notFound();
    }

    const order = await getOrderById(orderId);
    if (!order || order.clerkUserId !== user.id) {
      notFound();
    }

    return (
      <Container className="py-6">
        {/* Breadcrumb with custom items for payment flow */}
        <DynamicBreadcrumb
          customItems={[
            { label: bc.home ?? "Home", href: "/" },
            { label: bc.orders ?? "Orders", href: "/orders" },
            { label: bc.payment ?? "Payment" },
          ]}
          className="mb-6"
        />

        {/* Checkout Header */}
        <div className="flex items-center gap-2 mb-6">
          <ShoppingBag className="w-6 h-6" />
          <h1 className="text-2xl font-bold">{checkoutMeta.completePayment ?? "Complete Payment"}</h1>
        </div>

        {/* Order Checkout Content */}
        <Suspense
          fallback={
            <div className="w-full h-96 bg-gray-100 rounded-lg animate-pulse" />
          }
        >
          <OrderCheckoutContent order={order} />
        </Suspense>
      </Container>
    );
  }

  // Regular checkout flow
  return (
    <Container className="py-6">
      {/* Breadcrumb with parent context showing "Home > Dashboard > Cart > Checkout" */}
      <DynamicBreadcrumb
        customItems={[
          { label: bc.home ?? "Home", href: "/" },
          { label: bc.dashboard ?? "Dashboard", href: "/user" },
          { label: bc.cart ?? "Cart", href: "/cart" },
          { label: bc.checkout ?? "Checkout" },
        ]}
        className="mb-6"
      />

      {/* Checkout Header */}
      <div className="flex items-center gap-2 mb-6">
        <ShoppingBag className="w-6 h-6" />
        <h1 className="text-2xl font-bold">{checkoutMeta.title ?? "Checkout"}</h1>
      </div>

      {/* Checkout Content */}
      <Suspense
        fallback={
          <div className="w-full h-96 bg-gray-100 rounded-lg animate-pulse" />
        }
      >
        <CheckoutContent />
      </Suspense>
    </Container>
  );
}
