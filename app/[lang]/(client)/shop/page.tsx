import Shop from "@/components/shopPage/Shop";
import { getCategories } from "@/sanity/queries";
import { Suspense } from "react";
import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

interface Props {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return {
    title: dictionary?.shopMeta?.title ?? "Shop",
    description:
      dictionary?.shopMeta?.description ??
      "Browse fresh coffee, brewing tools, and curated essentials for home and office brewing.",
  };
}

const ShopPage = async ({ params }: Props) => {
  const { lang } = await params;
  const categories = await getCategories();
  const dictionary = await getDictionary(lang);

  return (
    <div className="bg-white min-h-screen">
      <Suspense
        fallback={
          <div className="min-h-96 bg-gray-50 animate-pulse rounded-lg" />
        }
      >
        <Shop categories={categories} dictionary={dictionary} />
      </Suspense>
    </div>
  );
};

export default ShopPage;
