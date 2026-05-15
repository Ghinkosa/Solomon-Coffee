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
import { ArrowRight, Heart, HandHelping, Coffee, GraduationCap, Users, Leaf } from "lucide-react";
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

      {/* Behind the Coffee - Our Mission Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 order-2 md:order-1">
            <div className="inline-block px-4 py-1 bg-amber-700 text-white text-xs uppercase tracking-widest rounded-full">
              Behind the Coffee
            </div>
            <h2 className="text-4xl md:text-5xl font-serif leading-tight">
              Our Mission: <br />
              <span className="italic text-amber-700">Coffee with a Purpose</span>
            </h2>
            <p className="text-lg text-stone-800/70 leading-relaxed">
              At Sheba Cup Coffee, our mission goes beyond coffee.
            </p>
            <p className="text-stone-800/70 leading-relaxed">
              Every bag you buy supports lifesaving care. A portion of each sale goes to the{" "}
              <Link href="#" className="text-amber-700 font-medium hover:underline">
                Mathiwos Wondu Foundation Ethiopia
              </Link>
              , an organization focused on childhood cancer care.
            </p>
            <p className="text-stone-800/70 leading-relaxed">
              Your purchase helps provide screenings, treatment support, and care for families.
            </p>
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
              <p className="text-amber-800 font-serif text-xl italic">
                "One bag of coffee helps fund lifesaving support."
              </p>
            </div>
            <p className="text-stone-800/70 leading-relaxed">
              Sheba Cup Coffee stands for great coffee with a purpose.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2">
                <Heart className="text-amber-600" size={20} />
                <span className="text-sm text-stone-600">Childhood Cancer Care</span>
              </div>
              <div className="flex items-center gap-2">
                <HandHelping className="text-amber-600" size={20} />
                <span className="text-sm text-stone-600">Treatment Support</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="text-amber-600" size={20} />
                <span className="text-sm text-stone-600">Family Care</span>
              </div>
            </div>
            <Link
              href="/mission"
              className="inline-flex items-center space-x-2 bg-amber-700 text-white px-6 py-3 rounded-full font-medium hover:bg-amber-800 transition-all"
            >
              <span>Learn About Our Mission</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl order-1 md:order-2">
            <Image
              src={productMockup}
              alt="Sheba Cup Coffee - Supporting childhood cancer care"
              className="w-full h-full object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={false}
            />
            <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur p-6 rounded-xl shadow-lg">
              <p className="font-serif text-lg text-amber-800 text-center">
                Every cup tells a story of hope
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Behind the Name - Our Vision Section */}
      <section className="bg-stone-900 py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={productMockup}
                alt="Ethiopian organic coffee farm - Birbirsa and Shakicha Coffee Farms"
                className="w-full h-full object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex gap-3 justify-center">
                  <span className="px-3 py-1 bg-amber-600 text-white text-xs rounded-full">30+ Years</span>
                  <span className="px-3 py-1 bg-amber-600 text-white text-xs rounded-full">Ethiopian Heritage</span>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="inline-block px-4 py-1 bg-amber-600 text-white text-xs uppercase tracking-widest rounded-full">
                Behind the Name
              </div>
              <h2 className="text-4xl md:text-5xl font-serif leading-tight text-white">
                Our Vision: <br />
                <span className="italic text-amber-400">From Farm to Cup</span>
              </h2>
              <p className="text-lg text-stone-300 leading-relaxed">
                Sheba Cup Coffee brings authentic organic Ethiopian specialty Arabica coffee from farm to cup across the world.
              </p>
              <p className="text-stone-300 leading-relaxed">
                Our family holds more than 30 years of coffee farming experience. We work directly with{" "}
                <span className="text-amber-400 font-medium">Birbirsa Coffee Farm</span> and{" "}
                <span className="text-amber-400 font-medium">Shakicha Coffee Farm</span>. These partnerships support quality, 
                sustainable farming, and Ethiopia's coffee heritage.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-stone-700">
                <div className="space-y-2">
                  <Coffee className="text-amber-400" size={28} />
                  <h3 className="font-serif text-xl text-white">Organic & Sustainable</h3>
                  <p className="text-sm text-stone-400">
                    Authentic Ethiopian specialty Arabica
                  </p>
                </div>
                <div className="space-y-2">
                  <GraduationCap className="text-amber-400" size={28} />
                  <h3 className="font-serif text-xl text-white">Community Growth</h3>
                  <p className="text-sm text-stone-400">
                    Education & development programs
                  </p>
                </div>
              </div>
              <p className="text-stone-300 italic border-l-4 border-amber-400 pl-4">
                Our goal reaches beyond coffee. Growth from our business supports education and development programs 
                for women and children, helping build stronger communities for the next generation.
              </p>
              <Link
                href="/vision"
                className="inline-flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-full font-medium hover:bg-amber-700 transition-all"
              >
                <span>Discover Our Vision</span>
                <ArrowRight size={16} />
              </Link>
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