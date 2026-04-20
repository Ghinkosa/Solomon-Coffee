import Shop from "@/components/shopPage/Shop";
import { getAllBrands, getCategories } from "@/sanity/queries";
import { Suspense } from "react";
import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse our extensive collection of products and find the best deals.",
};

interface Props {
  params: Promise<{ lang: Locale }>;
}

const ShopPage = async ({ params }: Props) => {
  const { lang } = await params;
  const categories = await getCategories();
  const brands = await getAllBrands();
  const dictionary = await getDictionary(lang);

  return (
    <div className="bg-white min-h-screen">
      <Suspense
        fallback={
          <div className="min-h-96 bg-gray-50 animate-pulse rounded-lg" />
        }
      >
        <Shop categories={categories} brands={brands} dictionary={dictionary} />
      </Suspense>
    </div>
  );
};

export default ShopPage;
