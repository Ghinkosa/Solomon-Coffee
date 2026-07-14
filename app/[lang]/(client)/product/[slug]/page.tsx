import { Suspense } from "react";
import ProductPageSkeleton from "@/components/ProductPageSkeleton";
import { getProductBySlug, getRelatedProducts } from "@/sanity/queries";
import { notFound } from "next/navigation";
import ProductContent from "@/components/ProductContent";
import { Product } from "@/sanity.types";
import { Metadata } from "next";
import {
  generateProductMetadata,
  generateProductSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo";

import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

type Props = {
  params: Promise<{ slug: string; lang: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params;
  const dictionary = await getDictionary(lang);
  const meta = dictionary?.product?.meta;
  const product = (await getProductBySlug(slug)) as Product | null;

  if (!product) {
    return {
      title: meta?.notFoundTitle ?? "Product Not Found",
      description:
        meta?.notFoundDescription ??
        "The product you're looking for could not be found.",
    };
  }

  return generateProductMetadata(product);
}

const ProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string; lang: Locale }>;
}) => {
  const { slug, lang } = await params;

  return (
    <div>
      <Suspense fallback={<ProductPageSkeleton />}>
        <ProductPageContent slug={slug} lang={lang} />
      </Suspense>
    </div>
  );
};

const ProductPageContent = async ({
  slug,
  lang,
}: {
  slug: string;
  lang: Locale;
}) => {
  const [product, dictionary] = await Promise.all([
    getProductBySlug(slug) as Promise<Product | null>,
    getDictionary(lang),
  ]);

  if (!product) {
    return notFound();
  }

  const categoryIds =
    product?.categories?.map(
      (cat: { _ref: string; _type: string; _key: string }) => cat._ref,
    ) || [];
  const relatedProducts = await getRelatedProducts(
    categoryIds,
    product?.slug?.current || "",
    4,
  );

  const productWithReviews = {
    ...product,
    averageRating: product.averageRating ?? undefined,
    totalReviews: product.totalReviews ?? undefined,
  };

  const productSchema = generateProductSchema(productWithReviews);
  const bc = dictionary?.breadcrumb ?? {};
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: bc.home ?? "Home", url: "/" },
    { name: bc.shop ?? "Shop", url: "/shop" },
    {
      name: productWithReviews.name || bc.product || "Product",
      url: `/product/${slug}`,
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <ProductContent
        product={productWithReviews}
        relatedProducts={(relatedProducts || []) as unknown as Product[]}
      />
    </>
  );
};

export default ProductPage;
