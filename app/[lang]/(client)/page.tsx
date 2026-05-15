import HomeCategories from "@/components/HomeCategories";
import LatestBlog from "@/components/LatestBlog";
import HomeBanner from "@/components/HomeBanner";
import ProductGrid from "@/components/ProductGrid";
import ShopByBrands from "@/components/ShopByBrands";
import ShopFeatures from "@/components/ShopFeatures";
import { getCategories, getAllBrands } from "@/sanity/queries";
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seo";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";
import Script from "next/script";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, Coffee } from "lucide-react";
import productMockup from "@/images/product-mockup.png";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  
  // Parallel Data Fetching on the Server
  const [categories, brands, dictionary] = await Promise.all([
    getCategories(8),
    getAllBrands(),
    getDictionary(lang as Locale),
  ]);

  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();

  return (
    <div>
      {/* JSON-LD Structured Data */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <HomeBanner lang={lang} dictionary={dictionary} />

      {/* Mission & Vision Combined Section - Clean & Simple */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="bg-gradient-to-r from-amber-50 to-stone-100 rounded-3xl overflow-hidden shadow-xl">
          <div className="grid md:grid-cols-2 gap-8 items-center p-8 lg:p-12">
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Heart className="text-amber-600" size={24} />
                <span className="text-xs uppercase tracking-wider text-amber-700 font-semibold">Our Mission</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900">
                Coffee with a Purpose
              </h2>
              <p className="text-stone-700 leading-relaxed">
                At Sheba Cup Coffee, our mission goes beyond coffee. Every bag you buy supports 
                childhood cancer care through the{" "}
                <span className="font-medium text-amber-700">Mathiwos Wondu Foundation Ethiopia</span>.
                Your purchase helps provide screenings, treatment support, and care for families.
              </p>
              
              <div className="pt-3">
                <div className="flex items-center gap-2">
                  <Coffee className="text-amber-600" size={24} />
                  <span className="text-xs uppercase tracking-wider text-amber-700 font-semibold">Our Vision</span>
                </div>
                <p className="text-stone-700 leading-relaxed mt-2">
                  With over 30 years of family farming experience, we work directly with 
                  <span className="font-medium"> Birbirsa Coffee Farm</span> and{" "}
                  <span className="font-medium">Shakicha Coffee Farm</span>. Our growth supports 
                  education and development programs for women and children in Ethiopia.
                </p>
              </div>
              
              <Link
                href="/mission"
                className="inline-flex items-center gap-2 bg-amber-700 text-white px-6 py-3 rounded-full font-medium hover:bg-amber-800 transition-all mt-4"
              >
                <span>Learn Our Story</span>
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={productMockup}
                alt="Sheba Cup Coffee"
                className="w-full h-full object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <p className="absolute bottom-4 left-4 right-4 text-white text-sm text-center font-medium">
                Great coffee with an even greater purpose
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the page sections */}
      <div className="pt-8 pb-10 lg:pt-10 lg:pb-12">
        <section className="mt-16 lg:mt-20 bg-shop_light_bg py-8 lg:py-10">
          <ProductGrid dictionary={dictionary} lang={lang} />
        </section>
        
        <section className="bg-[#09332C] pt-16 lg:pt-20 pb-8 lg:pb-10">
          <HomeCategories
            categories={categories}
            dictionary={dictionary.home.popularCategories}
          />
        </section>
        
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 lg:mt-20">
          <div className="rounded-3xl bg-gradient-to-r from-shop_dark_green via-shop_btn_dark_green to-shop_dark_green p-8 sm:p-10 text-center border border-shop_light_green/25 shadow-xl">
            <h3 className="text-2xl sm:text-3xl font-bold text-shop_light_pink mb-3">
              Brew Better at Home with Sheba Cup Coffee
            </h3>
            <p className="text-shop_light_pink/90 max-w-2xl mx-auto mb-6">
              Explore fresh roasts, brewing essentials, and limited selections crafted for your daily ritual.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full border border-shop_orange bg-shop_orange px-6 py-3 font-semibold text-shop_dark_green hover:bg-shop_light_pink hover:border-shop_light_pink hoverEffect"
            >
              Shop Coffee
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
        
        <ShopFeatures dictionary={dictionary.home.shopFeatures} />
        <LatestBlog dictionary={dictionary.home.latestBlog} />
        {/* <ShopByBrands
          brands={brands}
          dictionary={dictionary.home.shopByBrands}
        /> */}
      </div>
    </div>
  );
}