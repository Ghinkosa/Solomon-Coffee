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
import { ArrowRight, Heart, HandHelping, Users, Coffee, GraduationCap, BookOpen } from "lucide-react";
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

      {/* Our Story Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-block px-4 py-1 bg-shop_dark_green text-white text-xs uppercase tracking-widest rounded-full">
              Our Story
            </div>
            <h2 className="text-4xl md:text-5xl font-serif leading-tight text-shop_dark_green">
              From Ethiopian Farms <br />
              <span className="italic text-shop_orange">to Your Cup</span>
            </h2>
            <p className="text-lg text-stone-800/70 leading-relaxed">
              Sheba Cup Coffee began with a simple belief: exceptional Ethiopian coffee
              should be accessible, ethical, and brewed with purpose. We partner directly
              with Birbirsa and Shakicha farms, bringing decades of expertise to every roast.
            </p>
            <p className="text-lg text-stone-800/70 leading-relaxed">
              What sets us apart is not just the coffee—it is the impact behind every bag.
              Your purchase supports childhood cancer care, community education, and
              sustainable farming practices across Ethiopia.
            </p>
            <Link
              href="/mission"
              className="inline-flex items-center space-x-2 text-shop_orange font-medium border-b border-shop_orange pb-1 hover:text-shop_dark_green hover:border-shop_dark_green transition-all"
            >
              <span>Read More</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-shop_light_green to-shop_dark_green">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white text-center">
              <BookOpen className="mb-4 text-shop_orange" size={48} />
              <p className="font-serif italic text-2xl leading-relaxed">
                &quot;Every cup tells a story of heritage, care, and community.&quot;
              </p>
              <p className="mt-4 text-sm uppercase tracking-widest text-white/80">
                — Sheba Cup Coffee
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section - Old Style */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-block px-4 py-1 bg-amber-700 text-white text-xs uppercase tracking-widest rounded-full">
              Behind the Coffee
            </div>
            <h2 className="text-4xl md:text-5xl font-serif leading-tight">
              Our Mission: <br />
              <span className="italic text-amber-700">Coffee with a Purpose</span>
            </h2>
            <p className="text-lg text-stone-800/70 leading-relaxed">
              At Sheba Cup Coffee, our mission goes beyond coffee. Every bag you buy supports 
              lifesaving care for children battling cancer in Ethiopia.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="space-y-3">
                <Heart className="text-amber-600" size={32} />
                <h3 className="font-serif text-xl">Childhood Cancer Care</h3>
                <p className="text-sm text-stone-600">
                  Supporting the Mathiwos Wondu Foundation Ethiopia.
                </p>
              </div>
              <div className="space-y-3">
                <HandHelping className="text-amber-600" size={32} />
                <h3 className="font-serif text-xl">Treatment Support</h3>
                <p className="text-sm text-stone-600">
                  Screenings and care for families in need.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 pt-2">
              <div className="space-y-3">
                <Coffee className="text-amber-600" size={32} />
                <h3 className="font-serif text-xl">30+ Years Experience</h3>
                <p className="text-sm text-stone-600">
                  Direct partnerships with Birbirsa & Shakicha Farms.
                </p>
              </div>
              <div className="space-y-3">
                <GraduationCap className="text-amber-600" size={32} />
                <h3 className="font-serif text-xl">Community Growth</h3>
                <p className="text-sm text-stone-600">
                  Education programs for women and children.
                </p>
              </div>
            </div>
            <Link
              href="/mission"
              className="inline-flex items-center space-x-2 text-amber-700 font-medium border-b border-amber-700 pb-1 hover:text-amber-800 hover:border-amber-800 transition-all"
            >
              <span>Learn about our mission</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={productMockup}
              alt="Sheba Cup Coffee - Coffee with a Purpose"
              className="w-full h-full object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={false}
            />
            <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur p-6 rounded-xl shadow-lg">
              <p className="font-serif italic text-xl text-amber-800 text-center">
                "One bag of coffee helps fund lifesaving support."
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