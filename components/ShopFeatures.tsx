"use client";

import { useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Container from "./Container";
import HomeSectionHeader, {
  homeCaptionClass,
} from "./HomeSectionHeader";
import FeatureModal from "./FeatureModal";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Headphones,
  Award,
  Clock,
  Heart,
  LucideIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/** Shared Sheba / shop palette for every card (icons, bars, icon wells) */
const BRAND_CARD = {
  color: "from-shop_light_green to-shop_dark_green",
  bgColor: "bg-shop_light_bg",
  iconColor: "text-shop_dark_green",
} as const;

interface FeatureCopy {
  title: string;
  description: string;
  details: string[];
  benefits: string[];
}

interface FeatureType extends FeatureCopy {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  iconColor: string;
}

type ShopFeaturesDictionary = Record<
  string,
  | string
  | FeatureCopy
  | Record<string, string>
  | undefined
>;

const FEATURE_DEFINITIONS: {
  key: string;
  icon: LucideIcon;
  fallback: FeatureCopy;
}[] = [
  {
    key: "secureShopping",
    icon: ShieldCheck,
    fallback: {
      title: "Secure checkout for your orders",
      description:
        "Encrypted payments so your coffee order stays private and protected.",
      details: [
        "Industry-standard encryption on every checkout step",
        "Trusted processors (cards, wallets) with PCI-aligned handling",
        "We never store full card numbers on our servers",
        "Clear order confirmations and receipts for every coffee purchase",
        "Fraud monitoring on high-value equipment and gift orders",
      ],
      benefits: [
        "Shop with confidence",
        "Private payment details",
        "Recognized payment partners",
        "Transparent receipts",
        "Safer high-value orders",
      ],
    },
  },
  {
    key: "freeDelivery",
    icon: Truck,
    fallback: {
      title: "Coffee delivered to your door",
      description:
        "Reliable shipping on beans, gear, and gifts—free over our threshold.",
      details: [
        "Whole-bean and ground coffee packed to preserve aroma in transit",
        "Tracking on every shipment so you know when your roast arrives",
        "Carriers chosen for careful handling of fragile brew gear",
        "Eco-conscious packaging where we can without compromising freshness",
        "Typical delivery windows shown at checkout before you pay",
      ],
      benefits: [
        "Freshness-minded packing",
        "Live shipment tracking",
        "Careful handling",
        "Lower-impact materials",
        "Clear delivery expectations",
      ],
    },
  },
  {
    key: "easyPayments",
    icon: CreditCard,
    fallback: {
      title: "Simple ways to pay",
      description:
        "Cards, wallets, and familiar options so checking out is quick.",
      details: [
        "Major credit and debit cards supported at checkout",
        "Digital wallets where available for one-tap payment",
        "Order totals and shipping shown before you confirm",
        "Saved addresses for faster repeat bean orders",
        "Receipts suitable for cafés and small business buyers",
      ],
      benefits: [
        "Flexible payment methods",
        "Transparent totals",
        "Faster repeat orders",
        "Business-friendly receipts",
        "Straightforward checkout",
      ],
    },
  },
  {
    key: "support247",
    icon: Headphones,
    fallback: {
      title: "Help with orders & brewing",
      description:
        "Reach us when you need grind advice, order changes, or delivery help.",
      details: [
        "Support for order status, address updates, and subscription questions",
        "Guidance on grind size, brew ratio, and storage for your lot",
        "Escalation to the roastery team for quality or freshness concerns",
        "Self-serve FAQs for common brewing and account questions",
        "Multiple channels so you can pick what works for you",
      ],
      benefits: [
        "Real humans who know coffee",
        "Brewing and storage tips",
        "Roastery-backed answers",
        "Helpful help center",
        "Your choice of channel",
      ],
    },
  },
  {
    key: "qualityAssured",
    icon: Award,
    fallback: {
      title: "Quality you can taste",
      description:
        "Carefully sourced lots, roast-date discipline, and honest labeling.",
      details: [
        "Relationships with growers and importers we trust",
        "Roast profiles dialed for sweetness, clarity, and balance",
        "Batch checks before bags leave the roastery",
        "Clear labels for origin, process, and roast date when applicable",
        "We stand behind what we sell—tell us if something misses the mark",
      ],
      benefits: [
        "Traceable, ethical sourcing",
        "Consistent roast quality",
        "Transparent labeling",
        "Freshness-minded release cadence",
        "Accountability to you",
      ],
    },
  },
  {
    key: "fastProcessing",
    icon: Clock,
    fallback: {
      title: "Roast-to-ship without delay",
      description:
        "Orders picked and dispatched quickly so coffee spends less time waiting.",
      details: [
        "Cut-off times posted so you know when same-day packing applies",
        "Inventory synced to avoid selling beans we cannot ship immediately",
        "Priority handling for time-sensitive gifts and subscriptions",
        "Email updates when your order moves from roasted to shipped",
        "Team training on careful packing for glass and brewers",
      ],
      benefits: [
        "Predictable handling times",
        "Fewer oversell surprises",
        "Gift-friendly speed",
        "Status you can trust",
        "Careful packing standards",
      ],
    },
  },
  {
    key: "bestPrices",
    icon: Heart,
    fallback: {
      title: "Fair value on every bag",
      description:
        "Direct-style pricing on specialty lots, bundles, and limited releases.",
      details: [
        "Competitive pricing on single-origin and signature blends",
        "Bundle savings when you stock up on household or office coffee",
        "Early access pricing on limited micro-lots for subscribers",
        "No fake “compare at” inflation—what you see matches the cup",
        "Loyalty-friendly perks for regular home brewers and wholesale partners",
      ],
      benefits: [
        "Honest shelf pricing",
        "Stock-up savings",
        "Member-friendly drops",
        "Straightforward value",
        "Rewards for loyal drinkers",
      ],
    },
  },
];

function resolveFeatureCopy(
  dictionary: ShopFeaturesDictionary | undefined,
  key: string,
  fallback: FeatureCopy,
): FeatureCopy {
  const copy = dictionary?.[key];
  if (!copy || typeof copy !== "object" || Array.isArray(copy)) {
    return fallback;
  }

  const localized = copy as Partial<FeatureCopy>;
  return {
    title: localized.title || fallback.title,
    description: localized.description || fallback.description,
    details:
      Array.isArray(localized.details) && localized.details.length > 0
        ? localized.details
        : fallback.details,
    benefits:
      Array.isArray(localized.benefits) && localized.benefits.length > 0
        ? localized.benefits
        : fallback.benefits,
  };
}

const ShopFeatures = ({
  dictionary,
}: {
  dictionary?: ShopFeaturesDictionary;
}) => {
  const [selectedFeature, setSelectedFeature] = useState<FeatureType | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const features: FeatureType[] = FEATURE_DEFINITIONS.map(
    ({ key, icon, fallback }) => {
      const copy = resolveFeatureCopy(dictionary, key, fallback);
      return {
        icon,
        ...copy,
        ...BRAND_CARD,
      };
    },
  );

  const handleFeatureClick = (feature: FeatureType) => {
    setSelectedFeature(feature);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedFeature(null), 300);
  };

  const carousel = dictionary?.carousel as Record<string, string> | undefined;
  const modal = dictionary?.modal as Record<string, string> | undefined;

  const sectionTitle =
    typeof dictionary?.title === "string"
      ? dictionary.title
      : "Why choose Sheba Cup Coffee";
  const sectionDescription =
    typeof dictionary?.description === "string"
      ? dictionary.description
      : "Fresh roasting, ethical sourcing, and service built for people who live by their morning cup.";
  const learnMore =
    typeof dictionary?.learnMore === "string"
      ? dictionary.learnMore
      : "Click to learn more →";

  return (
    <section className="bg-black py-16 lg:py-20">
      <Container>
        <HomeSectionHeader
          variant="dark"
          title={sectionTitle}
          description={sectionDescription}
        />

        <div className="relative pb-4">
          <div className="overflow-hidden py-2 pb-6" ref={emblaRef}>
            <div className="flex gap-4">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="min-w-0 flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] xl:flex-[0_0_23%]"
                  >
                    <button
                      type="button"
                      onClick={() => handleFeatureClick(feature)}
                      className="group h-full w-full cursor-pointer rounded-2xl border border-[#E4C290]/25 bg-black p-6 text-left shadow-lg hoverEffect transform hover:-translate-y-2 hover:border-[#E4C290]/50 hover:shadow-2xl hover:shadow-[#E4C290]/10"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="mb-5 flex justify-center">
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E4C290]/15 group-hover:shadow-lg hoverEffect">
                          <IconComponent className="h-8 w-8 text-[#E4C290] group-hover:scale-110 hoverEffect" />
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-[#E4C290]/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                        </div>
                      </div>

                      <div className="space-y-2 text-center">
                        <h3 className="font-serif text-lg font-semibold text-[#E4C290] group-hover:text-[#E4C290] hoverEffect md:text-xl">
                          {feature.title}
                        </h3>
                        <p className={`text-[#E4C290]/80 ${homeCaptionClass}`}>
                          {feature.description}
                        </p>
                        <div className="pt-2 text-sm font-medium text-[#E4C290] opacity-0 transition-opacity group-hover:opacity-100">
                          {learnMore}
                        </div>
                      </div>

                      <div className="mt-4 h-1.5 w-full rounded-full bg-[#E4C290]/20">
                        <div
                          className="h-1.5 rounded-full bg-[#E4C290] transition-all duration-500 group-hover:w-full hoverEffect"
                          style={{ width: "40%" }}
                        ></div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={scrollPrev}
            aria-label={carousel?.prev || "Previous feature"}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-[#E4C290]/30 bg-black text-[#E4C290] shadow-lg hover:bg-[#E4C290]/10 hoverEffect"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label={carousel?.next || "Next feature"}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-[#E4C290]/30 bg-black text-[#E4C290] shadow-lg hover:bg-[#E4C290]/10 hoverEffect"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <FeatureModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          feature={selectedFeature}
          labels={modal}
        />
      </Container>
    </section>
  );
};

export default ShopFeatures;
