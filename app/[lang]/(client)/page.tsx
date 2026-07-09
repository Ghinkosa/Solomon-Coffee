import HomeCategories from "@/components/HomeCategories";
import LatestBlog from "@/components/LatestBlog";
import HomeBanner from "@/components/HomeBanner";
import ProductGrid from "@/components/ProductGrid";
import ShopFeatures from "@/components/ShopFeatures";
import { getCategories } from "@/sanity/queries";
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seo";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";
import Script from "next/script";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, HandHelping, Coffee, GraduationCap } from "lucide-react";
import productMockup from "@/images/product-mockup.png";
import OurStorySection from "@/components/OurStorySection";
import HomeBrewCta from "@/components/HomeBrewCta";
import Container from "@/components/Container";
import {
  homeBodyClass,
  homeCaptionClass,
  homeEyebrowClass,
  homeSubheadingClass,
} from "@/components/HomeSectionHeader";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  
  // Parallel Data Fetching on the Server
  const [categories, dictionary] = await Promise.all([
    getCategories(8),
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

      <OurStorySection />

      {/* Mission & Vision Section */}
      <section className="py-16 lg:py-20">
        <Container>
          <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-16">
          <div className="space-y-6">
            <div className={`rounded-full bg-shop_dark_green px-4 py-1 text-white ${homeEyebrowClass}`}>
              Behind the Coffee
            </div>
            <h2 className="font-serif text-3xl font-bold leading-tight text-shop_dark_green md:text-4xl">
              Our Mission: <br />
              <span className="italic text-shop_orange">Coffee with a Purpose</span>
            </h2>
            <p className={homeBodyClass}>
              At Sheba Cup Coffee, our mission goes beyond coffee. Every bag you buy supports 
              lifesaving care for children battling cancer in Ethiopia.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Heart className="text-shop_orange" size={32} />
                <h3 className={homeSubheadingClass}>Childhood Cancer Care</h3>
                <p className={homeCaptionClass}>
                  Supporting the Mathiwos Wondu Foundation Ethiopia.
                </p>
              </div>
              <div className="space-y-3">
                <HandHelping className="text-shop_orange" size={32} />
                <h3 className={homeSubheadingClass}>Treatment Support</h3>
                <p className={homeCaptionClass}>
                  Screenings and care for families in need.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Coffee className="text-shop_orange" size={32} />
                <h3 className={homeSubheadingClass}>30+ Years Experience</h3>
                <p className={homeCaptionClass}>
                  Direct partnerships with Birbirsa & Shakicha Farms.
                </p>
              </div>
              <div className="space-y-3">
                <GraduationCap className="text-shop_orange" size={32} />
                <h3 className={homeSubheadingClass}>Community Growth</h3>
                <p className={homeCaptionClass}>
                  Education programs for women and children.
                </p>
              </div>
            </div>
            <Link
              href="/mission"
              className="inline-flex items-center gap-2 border-b border-shop_orange pb-1 text-base font-medium text-shop_orange transition-all hover:border-shop_dark_green hover:text-shop_dark_green"
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
        </Container>
      </section>

      <section className="bg-shop_light_bg py-16 lg:py-20">
        <ProductGrid dictionary={dictionary} lang={lang} />
      </section>

      <HomeBrewCta lang={lang} />

      {categories.length > 0 && (
        <HomeCategories
          categories={categories}
          dictionary={dictionary.home.popularCategories}
          lang={lang}
        />
      )}

      <ShopFeatures dictionary={dictionary.home.shopFeatures} />

      <section className="py-16 lg:py-20">
        <LatestBlog dictionary={dictionary.home.latestBlog} />
      </section>
    </div>
  );
}