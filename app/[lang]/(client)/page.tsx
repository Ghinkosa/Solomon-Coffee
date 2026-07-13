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
import dynamic from "next/dynamic";
import { ArrowRight, Heart, HandHelping, Coffee, GraduationCap } from "lucide-react";
import OurStorySection from "@/components/OurStorySection";
import HomeBrewCta from "@/components/HomeBrewCta";
import Container from "@/components/Container";
import {
  homeBodyClass,
  homeCaptionClass,
  homeEyebrowClass,
  homeSubheadingClass,
} from "@/components/HomeSectionHeader";
import { localizedPath } from "@/lib/localized-path";

const MissionVisual3D = dynamic(
  () => import("@/components/home/MissionVisual3D"),
  { ssr: true },
);

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

      <OurStorySection story={dictionary.home.ourStory} />

      {/* Mission & Vision Section */}
      <section className="py-16 lg:py-20">
        <Container>
          <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-16">
          <div className="space-y-6">
            <div className={`rounded-full bg-shop_dark_green px-4 py-1 text-white ${homeEyebrowClass}`}>
              {dictionary.home.mission.eyebrow}
            </div>
            <h2 className="font-serif text-3xl font-bold leading-tight text-shop_dark_green md:text-4xl">
              {dictionary.home.mission.title} <br />
              <span className="italic text-shop_orange">{dictionary.home.mission.titleAccent}</span>
            </h2>
            <p className={homeBodyClass}>
              {dictionary.home.mission.description}
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Heart className="text-shop_orange" size={32} />
                <h3 className={homeSubheadingClass}>{dictionary.home.mission.pillars.cancerCare.title}</h3>
                <p className={homeCaptionClass}>
                  {dictionary.home.mission.pillars.cancerCare.description}
                </p>
              </div>
              <div className="space-y-3">
                <HandHelping className="text-shop_orange" size={32} />
                <h3 className={homeSubheadingClass}>{dictionary.home.mission.pillars.treatment.title}</h3>
                <p className={homeCaptionClass}>
                  {dictionary.home.mission.pillars.treatment.description}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Coffee className="text-shop_orange" size={32} />
                <h3 className={homeSubheadingClass}>{dictionary.home.mission.pillars.experience.title}</h3>
                <p className={homeCaptionClass}>
                  {dictionary.home.mission.pillars.experience.description}
                </p>
              </div>
              <div className="space-y-3">
                <GraduationCap className="text-shop_orange" size={32} />
                <h3 className={homeSubheadingClass}>{dictionary.home.mission.pillars.community.title}</h3>
                <p className={homeCaptionClass}>
                  {dictionary.home.mission.pillars.community.description}
                </p>
              </div>
            </div>
            <Link
              href={localizedPath("/mission", lang)}
              className="inline-flex items-center gap-2 border-b border-shop_orange pb-1 text-base font-medium text-shop_orange transition-all hover:border-shop_dark_green hover:text-shop_dark_green"
            >
              <span>{dictionary.home.mission.cta}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          <MissionVisual3D
            alt={dictionary.home.mission.imageAlt}
            quote={dictionary.home.mission.quote}
          />
          </div>
        </Container>
      </section>

      <section className="bg-shop_light_bg py-16 lg:py-20">
        <ProductGrid dictionary={dictionary} lang={lang} />
      </section>

      <HomeBrewCta lang={lang} copy={dictionary.home.brewCta} />

      {categories.length > 0 && (
        <HomeCategories
          categories={categories}
          dictionary={dictionary.home.popularCategories}
          lang={lang}
        />
      )}

      <ShopFeatures dictionary={dictionary.home.shopFeatures} />

      <section className="py-16 lg:py-20">
        <LatestBlog dictionary={dictionary.home.latestBlog} lang={lang} />
      </section>
    </div>
  );
}