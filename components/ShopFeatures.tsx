"use client";

import { useState } from "react";
import Container from "./Container";
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
} from "lucide-react";

/** Shared Sheba / shop palette for every card (icons, bars, icon wells) */
const BRAND_CARD = {
  color: "from-shop_light_green to-shop_dark_green",
  bgColor: "bg-shop_light_bg",
  iconColor: "text-shop_dark_green",
} as const;

interface FeatureType {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  iconColor: string;
  details: string[];
  benefits: string[];
}

const ShopFeatures = ({ dictionary }: { dictionary?: any }) => {
  const [selectedFeature, setSelectedFeature] = useState<FeatureType | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const features: FeatureType[] = [
    {
      icon: ShieldCheck,
      title:
        dictionary?.secureShopping?.title || "Secure checkout for your orders",
      description:
        dictionary?.secureShopping?.description ||
        "Encrypted payments so your coffee order stays private and protected.",
      ...BRAND_CARD,
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
    {
      icon: Truck,
      title: dictionary?.freeDelivery?.title || "Coffee delivered to your door",
      description:
        dictionary?.freeDelivery?.description ||
        "Reliable shipping on beans, gear, and gifts—free over our threshold.",
      ...BRAND_CARD,
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
    {
      icon: CreditCard,
      title: dictionary?.easyPayments?.title || "Simple ways to pay",
      description:
        dictionary?.easyPayments?.description ||
        "Cards, wallets, and familiar options so checking out is quick.",
      ...BRAND_CARD,
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
    {
      icon: Headphones,
      title: dictionary?.support247?.title || "Help with orders & brewing",
      description:
        dictionary?.support247?.description ||
        "Reach us when you need grind advice, order changes, or delivery help.",
      ...BRAND_CARD,
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
    {
      icon: Award,
      title: dictionary?.qualityAssured?.title || "Quality you can taste",
      description:
        dictionary?.qualityAssured?.description ||
        "Carefully sourced lots, roast-date discipline, and honest labeling.",
      ...BRAND_CARD,
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
    {
      icon: Clock,
      title: dictionary?.fastProcessing?.title || "Roast-to-ship without delay",
      description:
        dictionary?.fastProcessing?.description ||
        "Orders picked and dispatched quickly so coffee spends less time waiting.",
      ...BRAND_CARD,
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
    {
      icon: Heart,
      title: dictionary?.bestPrices?.title || "Fair value on every bag",
      description:
        dictionary?.bestPrices?.description ||
        "Direct-style pricing on specialty lots, bundles, and limited releases.",
      ...BRAND_CARD,
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
  ];

  const handleFeatureClick = (feature: FeatureType) => {
    setSelectedFeature(feature);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedFeature(null), 300);
  };

  return (
    <Container className="my-16 lg:my-24">
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-3">
          <div className="h-1 w-12 rounded-full bg-linear-to-r from-shop_dark_green/70 to-shop_dark_green"></div>
          <h2 className="text-3xl font-bold uppercase tracking-tight text-dark-color lg:text-4xl">
            {dictionary?.title || "Why choose Sheba Cup Coffee"}
          </h2>
          <div className="h-1 w-12 rounded-full bg-linear-to-l from-shop_dark_green/70 to-shop_dark_green"></div>
        </div>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-light-color">
          {dictionary?.description ||
            "Fresh roasting, ethical sourcing, and service built for people who live by their morning cup."}
        </p>
      </div>

      <div className="rounded-3xl border border-[#E4C290]/30 bg-[#1C2329] p-8 shadow-xl lg:p-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <button
                key={feature.title}
                type="button"
                onClick={() => handleFeatureClick(feature)}
                className="group w-full cursor-pointer rounded-2xl border border-[#E4C290]/20 bg-[#252D34] p-6 text-left shadow-lg hoverEffect transform hover:-translate-y-2 hover:border-[#E4C290]/45 hover:shadow-2xl"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="mb-5 flex justify-center">
                  <div
                    className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E4C290]/15 group-hover:shadow-lg hoverEffect"
                  >
                    <IconComponent
                      className="h-8 w-8 text-[#E4C290] group-hover:scale-110 hoverEffect"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-linear-to-t from-[#E4C290]/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <h3 className="text-lg font-bold text-[#E4C290] group-hover:text-[#E4C290] hoverEffect">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#E4C290]/80">
                    {feature.description}
                  </p>
                  <div className="pt-2 text-xs font-medium text-[#E4C290] opacity-0 transition-opacity group-hover:opacity-100">
                    {dictionary?.learnMore || "Click to learn more →"}
                  </div>
                </div>

                <div className="mt-4 h-1.5 w-full rounded-full bg-[#E4C290]/20">
                  <div
                    className="h-1.5 rounded-full bg-[#E4C290] transition-all duration-500 group-hover:w-full hoverEffect"
                    style={{ width: "40%" }}
                  ></div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-12 border-t border-[#E4C290]/25 pt-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="rounded-2xl border border-[#E4C290]/20 bg-[#252D34] p-6 text-center">
              <div className="mb-2 text-4xl font-bold text-[#E4C290]">
                50K+
              </div>
              <p className="font-medium text-[#E4C290]/80">
                {dictionary?.stats?.happyCustomers || "Happy coffee drinkers"}
              </p>
            </div>
            <div className="rounded-2xl border border-[#E4C290]/20 bg-[#252D34] p-6 text-center">
              <div className="mb-2 text-4xl font-bold text-[#E4C290]">
                100K+
              </div>
              <p className="font-medium text-[#E4C290]/80">
                {dictionary?.stats?.productsSold || "Bags shipped"}
              </p>
            </div>
            <div className="rounded-2xl border border-[#E4C290]/20 bg-[#252D34] p-6 text-center">
              <div className="mb-2 text-4xl font-bold text-[#E4C290]">
                99%
              </div>
              <p className="font-medium text-[#E4C290]/80">
                {dictionary?.stats?.satisfactionRate || "Would recommend us"}
              </p>
            </div>
            <div className="rounded-2xl border border-[#E4C290]/20 bg-[#252D34] p-6 text-center">
              <div className="mb-2 text-4xl font-bold text-[#E4C290]">
                24/7
              </div>
              <p className="font-medium text-[#E4C290]/80">
                {dictionary?.stats?.customerSupport || "Order & brew support"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-4 rounded-2xl border border-[#E4C290]/30 bg-[#252D34] px-8 py-4 shadow-md">
            <ShieldCheck className="h-6 w-6 shrink-0 text-[#E4C290]" />
            <span className="font-semibold text-[#E4C290]">
              {dictionary?.trustLine ||
                "Trusted by home brewers and cafés who care about the cup."}
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="h-5 w-5 fill-current text-[#E4C290]"
                  viewBox="0 0 20 20"
                  aria-hidden
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>

      <FeatureModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        feature={selectedFeature}
      />
    </Container>
  );
};

export default ShopFeatures;
