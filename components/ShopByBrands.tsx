import Container from "./Container";
import Title from "./Title";
import Link from "next/link";
import Image from "next/image";
import {
  Truck,
  RefreshCw,
  Headphones,
  ShieldCheck,
  ArrowRight,
  Star,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { urlFor } from "@/sanity/lib/image";

const ShopByBrands = ({
  brands,
  dictionary,
}: {
  brands: any[];
  dictionary?: any;
}) => {
  const features = [
    {
      icon: Truck,
      title: dictionary?.freeDelivery || "Free Delivery",
      description: dictionary?.freeDeliveryDesc || "Free shipping over $100",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: RefreshCw,
      title: dictionary?.freeReturn || "Free Return",
      description: dictionary?.moneyBack || "Money Back guarantee",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Headphones,
      title: dictionary?.customerSupport || "Customer Support",
      description:
        dictionary?.customerSupportDesc || "Friendly 24/7 customer support",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: ShieldCheck,
      title: dictionary?.qualityChecked || "Quality Checked",
      description:
        dictionary?.customerTrusted ||
        "Trusted by thousands of customers worldwide",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <Container className="mt-16 lg:mt-24">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="h-1 w-12 bg-linear-to-r from-shop_orange to-shop_light_orange rounded-full"></div>
          <Title className="text-3xl lg:text-4xl font-bold text-dark-color">
            {dictionary?.title || "Shop by Roasters"}
          </Title>
          <div className="h-1 w-12 bg-linear-to-l from-shop_orange to-shop_light_orange rounded-full"></div>
        </div>
        <p className="text-light-color text-lg max-w-2xl mx-auto">
          {dictionary?.description ||
            "Discover coffee selections from trusted roasters and producers"}
        </p>
        <Link
          href={"/shop"}
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-shop_light_pink text-shop_dark_green font-semibold rounded-full hover:bg-shop_orange hover:text-white border-2 border-shop_orange hoverEffect"
        >
          {dictionary?.exploreAll || "Explore All Roasters"}
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* Brands Grid */}
      <div className="bg-linear-to-br from-shop_light_bg via-white to-shop_light_pink p-8 lg:p-12 rounded-3xl shadow-xl border border-shop_light_green/20 mb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-6">
          {brands.map((brand, index) => (
            <Link
              key={brand?._id}
              href={{
                pathname: "/shop",
                query: { brand: brand?.slug?.current },
              }}
              className="group bg-white rounded-2xl p-6 flex flex-col items-center justify-center aspect-square hover:shadow-2xl shadow-lg border border-gray-100 hover:border-shop_orange hoverEffect transform hover:-translate-y-2 cursor-pointer"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {brand?.image && (
                  <Image
                    src={urlFor(brand.image).width(200).url()}
                    alt={`${brand.title || "Brand"} logo`}
                    width={120}
                    height={80}
                    className="max-w-full max-h-full object-contain group-hover:scale-110 hoverEffect filter group-hover:brightness-110"
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-shop_orange/5 to-transparent opacity-0 group-hover:opacity-100 hoverEffect rounded-xl"></div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Trust & Services Section */}
      <div className="mt-20 py-16 bg-white border-y border-shop_light_green/10 rounded-3xl shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center px-8 lg:px-12">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-shop_light_pink text-shop_dark_green border-none px-4 py-1">
                100+ {dictionary?.trusted || "trusted coffee partners"}
              </Badge>
              <h3 className="text-3xl lg:text-4xl font-bold text-dark-color leading-tight">
                {dictionary?.whyChooseUs || "Why Choose Us?"}
              </h3>
              <p className="text-light-color text-lg leading-relaxed">
                {dictionary?.experience ||
                  "We provide a seamless coffee buying experience with fresh products and dependable service."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-shop_light_green/20 hover:bg-white hover:shadow-md hoverEffect group"
                >
                  <div
                    className={`p-3 rounded-xl ${item.bgColor} ${item.color} group-hover:scale-110 hoverEffect`}
                  >
                    <item.icon size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-dark-color group-hover:text-shop_dark_green hoverEffect">
                      {item.title}
                    </h4>
                    <p className="text-sm text-light-color mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-linear-to-r from-shop_light_pink to-shop_light_orange/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 hoverEffect"></div>
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
              <Image
                src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1600&auto=format&fit=crop"
                alt="Sheba's Coffee roasting team"
                fill
                className="object-cover group-hover:scale-105 hoverEffect"
              />
              <div className="absolute inset-0 bg-linear-to-t from-dark-color/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-4 text-white">
                  <div className="h-12 w-12 rounded-full border-2 border-white/50 flex items-center justify-center backdrop-blur-md">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">
                      {dictionary?.qualityChecked || "Quality Checked"}
                    </p>
                    <p className="font-bold">
                      {dictionary?.customerTrusted || "Trusted globally"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ShopByBrands;
