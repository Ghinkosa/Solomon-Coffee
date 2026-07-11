import React, { Suspense } from "react";
import Container from "@/components/Container";
import Title from "@/components/Title";
import { getAllProducts, getCategories } from "@/sanity/queries";
import ProductCatalog from "@/components/ProductCatalog";
import { ArrowRight, Package, Filter, Search } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { localizedPath } from "@/lib/localized-path";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";
import Link from "next/link";

const ProductPage = async ({
  params,
}: {
  params: Promise<{ lang: string }>;
}) => {
  const { lang } = await params;
  const [products, categories, dictionary] = await Promise.all([
    getAllProducts(),
    getCategories(),
    getDictionary(lang as Locale),
  ]);
  const t = dictionary?.productCatalogPage ?? {};
  const bc = dictionary?.breadcrumb ?? {};
  const common = dictionary?.common ?? {};

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="bg-gradient-to-r from-shop_dark_green to-shop_light_green">
        <Container>
          <div className="py-16 text-white">
            <div className="mb-6">
              <Breadcrumb>
                <BreadcrumbList className="text-white/80">
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href={localizedPath("/", lang)}
                      className="hover:text-white"
                    >
                      {bc.home ?? common.home ?? "Home"}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-white/60" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-white font-medium">
                      {t.breadcrumbProducts ?? bc.products ?? "Products"}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-8 h-8" />
                <Title className="text-4xl md:text-5xl font-bold text-white mb-0">
                  {t.title ?? "Product Catalog"}
                </Title>
              </div>

              <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8">
                {t.heroDescription ??
                  "Discover our complete collection of premium coffee and brewing essentials."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {(t.statsProducts ?? "{count}+ Products").replace(
                        "{count}",
                        String(products?.length || 0),
                      )}
                    </p>
                    <p className="text-sm text-white/70">
                      {t.statsQuality ?? "Premium Quality Items"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Filter className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {(t.statsCategories ?? "{count} Categories").replace(
                        "{count}",
                        String(categories?.length || 0),
                      )}
                    </p>
                    <p className="text-sm text-white/70">
                      {t.statsNavigate ?? "Easy to Navigate"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {t.statsFilters ?? "Advanced Filters"}
                    </p>
                    <p className="text-sm text-white/70">
                      {t.statsFind ?? "Find What You Need"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-10">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-2 text-shop_dark_green">
                <div className="w-6 h-6 border-2 border-shop_dark_green border-t-transparent rounded-full animate-spin"></div>
                <span className="font-medium">
                  {t.loading ?? "Loading products..."}
                </span>
              </div>
            </div>
          }
        >
          <ProductCatalog
            initialProducts={products}
            categories={categories}
          />
        </Suspense>
      </Container>

      <div className="bg-shop_light_bg border-t">
        <Container>
          <div className="py-12 text-center">
            <Title className="text-2xl mb-4">
              {t.ctaTitle ?? "Can't find what you're looking for?"}
            </Title>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              {t.ctaDescription ??
                "Our customer support team is here to help you find the perfect product."}
            </p>
            <Link
              href={localizedPath("/contact", lang)}
              className="inline-flex items-center gap-2 bg-shop_dark_green text-white px-8 py-3 rounded-lg font-semibold hover:bg-shop_dark_green/90 transition-colors"
            >
              {t.contactSupport ?? "Contact Support"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default ProductPage;
