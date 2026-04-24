import Container from "@/components/Container";
import ProductCard from "@/components/ProductCard";
import Title from "@/components/Title";
import DealCountdown from "@/components/DealCountdown";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import { DEAL_PRODUCTSResult, Product } from "@/sanity.types";
import { getDealProducts } from "@/sanity/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  Coffee,
  TrendingDown,
  ShoppingBag,
  Star,
  Users,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

/** Sheba brand — explicit hex (inline gradients) so UI does not depend on Tailwind token emission */
const BR = {
  forest: "#09332c",
  brown: "#3a2417",
  charcoal: "#1c2329",
  goldLight: "#e4c290",
} as const;

interface Props {
  params: Promise<{ lang: Locale }>;
}

const DealPage = async ({ params }: Props) => {
  const { lang } = await params;
  const [products, dictionary] = await Promise.all([
    getDealProducts(),
    getDictionary(lang),
  ]);

  const totalProducts = products?.length || 0;
  const avgDiscount =
    products?.reduce((acc, product) => acc + (product?.discount || 0), 0) /
      totalProducts || 0;
  const maxDiscount = Math.max(
    ...(products?.map((p) => p?.discount || 0) || [0]),
  );

  const features = [
    {
      icon: Coffee,
      title: dictionary.deals.features.lightning.title,
      description: dictionary.deals.features.lightning.description,
    },
    {
      icon: Star,
      title: dictionary.deals.features.premium.title,
      description: dictionary.deals.features.premium.description,
    },
    {
      icon: Heart,
      title: dictionary.deals.features.favorites.title,
      description: dictionary.deals.features.favorites.description,
    },
    {
      icon: Clock,
      title: dictionary.deals.features.limited.title,
      description: dictionary.deals.features.limited.description,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-shop_light_bg via-white to-[#09332c]/[0.08]">
      <Container className="pt-6">
        <DynamicBreadcrumb />
      </Container>

      <Container className="py-8 sm:py-12">
        <div
          className="overflow-hidden rounded-xl border border-[#a3802e]/40 p-6 shadow-xl sm:p-8 lg:p-12"
          style={{
            background: `linear-gradient(145deg, ${BR.forest} 0%, ${BR.brown} 48%, ${BR.charcoal} 100%)`,
            color: BR.goldLight,
          }}
        >
          <div className="flex flex-col gap-6 text-[#e4c290] lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="flex-1 space-y-4 sm:space-y-6">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 rounded-full border border-[#e4c290]/45 bg-black/25 px-3 py-1 sm:gap-2 sm:px-4 sm:py-2">
                  <Coffee
                    className="h-4 w-4 text-[#e4c290] sm:h-5 sm:w-5"
                    aria-hidden
                  />
                  <span className="text-xs font-semibold tracking-wide text-[#fdf6e8] sm:text-sm">
                    {dictionary.deals.hero.badge}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="border-[#e4c290]/85 bg-[#1c2329]/55 text-xs text-[#fdf6e8] sm:text-sm"
                >
                  {dictionary.deals.hero.upToOff.replace(
                    "{maxDiscount}",
                    maxDiscount.toString(),
                  )}
                </Badge>
              </div>

              <div>
                <h1 className="mb-2 text-2xl font-bold text-[#fdf6e8] sm:mb-4 sm:text-3xl md:text-4xl lg:text-5xl">
                  {dictionary.deals.hero.title}
                </h1>
                <p className="max-w-2xl text-sm text-[#e4c290] sm:text-base md:text-lg">
                  {dictionary.deals.hero.description.replace(
                    "{maxDiscount}",
                    maxDiscount.toString(),
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                <div className="rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur-sm sm:p-4">
                  <div className="mb-1 flex items-center gap-2 text-[#e4c290]/85">
                    <ShoppingBag className="h-4 w-4" aria-hidden />
                    <span className="text-xs sm:text-sm">
                      {dictionary.deals.hero.stats.products}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-[#fdf6e8] sm:text-2xl">
                    {totalProducts}
                  </p>
                </div>

                <div className="rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur-sm sm:p-4">
                  <div className="mb-1 flex items-center gap-2 text-[#e4c290]/85">
                    <TrendingDown className="h-4 w-4" aria-hidden />
                    <span className="text-xs sm:text-sm">
                      {dictionary.deals.hero.stats.avgDiscount}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-[#fdf6e8] sm:text-2xl">
                    {avgDiscount.toFixed(0)}%
                  </p>
                </div>

                <div className="col-span-2 rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur-sm sm:col-span-1 sm:p-4">
                  <div className="mb-1 flex items-center gap-2 text-[#e4c290]/85">
                    <Users className="h-4 w-4" aria-hidden />
                    <span className="text-xs sm:text-sm">
                      {dictionary.deals.hero.stats.happyCustomers}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-[#fdf6e8] sm:text-2xl">
                    2.5K+
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:flex-shrink-0">
              <div className="rounded-xl border border-[#a3802e]/35 bg-black/20 p-4 backdrop-blur-sm sm:p-6">
                <DealCountdown
                  endsIn={dictionary.deals.countdown.endsIn}
                  days={dictionary.deals.countdown.days}
                  hours={dictionary.deals.countdown.hours}
                  mins={dictionary.deals.countdown.mins}
                  secs={dictionary.deals.countdown.secs}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>

      <Container className="py-6 sm:py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-2 border-[#a3802e]/30 bg-white shadow-sm transition-all duration-300 hover:border-[#a3802e]/55 hover:shadow-md"
            >
              <CardContent className="p-4 text-center sm:p-6">
                <feature.icon
                  className="mx-auto mb-3 h-8 w-8 text-[#a3802e] sm:h-10 sm:w-10"
                  aria-hidden
                />
                <h3 className="mb-2 text-sm font-semibold text-shop_dark_green sm:text-base">
                  {feature.title}
                </h3>
                <p className="text-xs text-shop_dark_green/75 sm:text-sm">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>

      <Container className="py-8 sm:py-12">
        <div className="mb-8 text-center sm:mb-12">
          <div className="mb-4 flex items-center justify-center gap-2 sm:gap-3">
            <Coffee
              className="h-6 w-6 text-[#a3802e] sm:h-8 sm:w-8"
              aria-hidden
            />
            <Title className="mb-0 text-xl font-bold text-shop_dark_green sm:text-2xl md:text-3xl">
              {dictionary.deals.collection.title}
            </Title>
            <Coffee
              className="h-6 w-6 text-[#a3802e] sm:h-8 sm:w-8"
              aria-hidden
            />
          </div>
          <p className="mx-auto max-w-2xl text-sm text-shop_dark_green/80 sm:text-base">
            {dictionary.deals.collection.description}
          </p>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product: DEAL_PRODUCTSResult[0]) => (
              <div
                key={product?._id}
                className="transform transition-transform duration-300 hover:scale-105"
              >
                <ProductCard product={product as unknown as Product} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="border border-[#a3802e]/25 bg-white p-8 text-center sm:p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#09332c]/10 sm:h-20 sm:w-20">
                <ShoppingBag
                  className="h-8 w-8 text-[#a3802e] sm:h-10 sm:w-10"
                  aria-hidden
                />
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-shop_dark_green sm:text-xl">
                  {dictionary.deals.collection.noDeals.title}
                </h3>
                <p className="mb-4 text-sm text-shop_dark_green/75 sm:text-base">
                  {dictionary.deals.collection.noDeals.description}
                </p>
                <Button
                  asChild
                  className="bg-[#09332c] text-[#e4c290] hover:bg-[#3a2417]"
                >
                  <Link href="/shop">
                    {dictionary.deals.collection.noDeals.button}
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        )}
      </Container>

      <Container className="py-8 sm:py-12">
        <div
          className="rounded-xl p-6 text-center text-[#e4c290] shadow-xl sm:p-8 lg:p-12"
          style={{
            background: `linear-gradient(90deg, ${BR.forest} 0%, ${BR.brown} 50%, ${BR.charcoal} 100%)`,
          }}
        >
          <h2 className="mb-4 text-xl font-bold text-[#fdf6e8] sm:text-2xl md:text-3xl">
            {dictionary.deals.cta.title}
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-sm text-[#e4c290] sm:text-base">
            {dictionary.deals.cta.description}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="w-full border-0 bg-[#e4c290] text-[#1c2329] hover:bg-[#fdf6e8] sm:w-auto"
            >
              <Link href="/shop">{dictionary.deals.cta.explore}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-[#e4c290]/90 bg-transparent text-[#fdf6e8] hover:bg-[#e4c290] hover:text-[#1c2329] sm:w-auto"
            >
              {dictionary.deals.cta.subscribe}
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default DealPage;
