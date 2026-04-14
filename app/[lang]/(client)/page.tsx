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
import { ArrowRight, Play, Leaf, Award } from "lucide-react";

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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
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
<<<<<<< HEAD
              At Sheba's Coffee, we believe that understanding the origin is as important as the taste.
=======
              At Solomon's Coffee, we believe that understanding the origin is as important as the taste.
>>>>>>> 88c4da277ced64b47f1ac3c0650594ef040c7133
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
            <img
              src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=1000"
              alt="Coffee Farm"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-8 left-8 right-8 bg-stone-100/90 backdrop-blur p-6 rounded-xl">
              <p className="font-serif italic text-xl text-stone-900">
                "Saba" style narrative: Every cup tells a story of the soil, the sun, and the hands that nurtured it.
              </p>
            </div>
          </div>
        </div>
      </section>

    

      <div className="py-10">
        <ProductGrid dictionary={dictionary} lang={lang} />
        <HomeCategories
          categories={categories}
          dictionary={dictionary.home.popularCategories}
        />
        <ShopFeatures dictionary={dictionary.home.shopFeatures} />
        {/* <ShopByBrands
          brands={brands}
          dictionary={dictionary.home.shopByBrands}
        /> */}
        <LatestBlog dictionary={dictionary.home.latestBlog} />
      </div>
    </div>
  );
}