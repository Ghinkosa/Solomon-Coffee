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
import { ArrowRight, Play, Leaf, Award } from "lucide-react";
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

      {/* Hero Section - Static Version for Server Component */}
      {/* <section className="relative h-[90vh] flex items-center overflow-hidden bg-stone-900 text-stone-100">
        <div className="absolute inset-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=2000"
            alt="Coffee Roasting"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <span className="text-sm uppercase tracking-[0.3em] font-medium mb-6 block text-stone-400">
              Authentic Ethiopian Heritage
            </span>
            <h1 className="text-6xl md:text-8xl font-serif leading-tight mb-8">
              Bring the <span className="italic">farm flavor</span> into your cup.
            </h1>
            <div className="flex flex-wrap gap-6">
              <Link
                href="/shop"
                className="bg-stone-100 text-stone-900 px-8 py-4 rounded-full font-medium flex items-center space-x-2 hover:bg-stone-200 transition-colors"
              >
                <span>Shop the Collection</span>
                <ArrowRight size={18} />
              </Link>
              <button className="flex items-center space-x-3 group">
                <div className="w-12 h-12 rounded-full border border-stone-100 flex items-center justify-center group-hover:bg-stone-100 group-hover:text-stone-900 transition-all">
                  <Play size={16} fill="currentColor" />
                </div>
                <span className="text-sm uppercase tracking-widest font-medium">
                  Watch the Journey
                </span>
              </button>
            </div>
          </div>
        </div>
      </section> */}
      <HomeBanner lang={lang} dictionary={dictionary} />

      {/* Educational / Philosophy Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-block px-4 py-1 bg-stone-900 text-stone-100 text-xs uppercase tracking-widest rounded-full">
              Our Philosophy
            </div>
            <h2 className="text-4xl md:text-5xl font-serif leading-tight">
              Beyond the Bean: <br />
              <span className="italic text-stone-600">An Educational Journey</span>
            </h2>
            <p className="text-lg text-stone-800/70 leading-relaxed">
              At Sheba Cup Coffee, we believe that understanding the origin is as important as the taste.
              Our roasting process is a delicate balance of tradition and science, designed to highlight
              the unique terroir of Ethiopia's finest high-altitude farms.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="space-y-3">
                <Leaf className="text-stone-600" size={32} />
                <h3 className="font-serif text-xl">Sustainable Sourcing</h3>
                <p className="text-sm text-stone-600">
                  Direct relationships with small-holder farmers.
                </p>
              </div>
              <div className="space-y-3">
                <Award className="text-stone-600" size={32} />
                <h3 className="font-serif text-xl">Artisanal Roasting</h3>
                <p className="text-sm text-stone-600">
                  Small batches, profiled for maximum clarity.
                </p>
              </div>
            </div>
            <Link
              href="/education"
              className="inline-flex items-center space-x-2 text-stone-900 font-medium border-b border-stone-900 pb-1 hover:text-stone-600 hover:border-stone-600 transition-all"
            >
              <span>Learn about our process</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={productMockup}
              alt="Sheba Cup Coffee product mockup"
              className="w-full h-full object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={false}
            />
            <div className="absolute bottom-8 left-8 right-8 bg-stone-100/90 backdrop-blur p-6 rounded-xl">
              <p className="font-serif italic text-xl text-stone-900">
                "Saba" style narrative: Every cup tells a story of the soil, the sun, and the hands that nurtured it.
              </p>
            </div>
          </div>
        </div>
      </section>

    

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