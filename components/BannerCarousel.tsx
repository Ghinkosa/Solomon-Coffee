"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import { Button } from "./ui/button";
import { useCallback, useEffect, useState } from "react";
import Container from "./Container";

interface Banner {
  _id: string;
  _type: "banner";
  title?: {
    en?: string;
    it?: string;
    fr?: string;
    hi?: string;
    ar?: string;
  };
  subtitle?: {
    en?: string;
    it?: string;
    fr?: string;
    hi?: string;
    ar?: string;
  };
  priceTitle?: {
    en?: string;
    it?: string;
    fr?: string;
    hi?: string;
    ar?: string;
  };
  price?: number;
  weight?: number;
  description?: {
    en?: string;
    it?: string;
    fr?: string;
    hi?: string;
    ar?: string;
  };
  image?: {
    asset: {
      _ref: string;
      _type: "reference";
    };
  };
  link?: string;
  buttonText?: {
    en?: string;
    it?: string;
    fr?: string;
    hi?: string;
    ar?: string;
  };
}

interface BannerCarouselProps {
  banners: Banner[];
  lang: string;
  dictionary: any;
}

const BannerCarousel = ({ banners, lang, dictionary }: BannerCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000 }),
    Fade(),
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onInit, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi],
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const getLocalizedValue = (field: any) => {
    if (!field) return "";
    return field[lang] || field["en"] || "";
  };

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="relative group">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner, index) => {
            const isActive = index === selectedIndex;
            const title = getLocalizedValue(banner.title);
            const subtitle = getLocalizedValue(banner.subtitle);
            const description = getLocalizedValue(banner.description);
            const priceTitle = getLocalizedValue(banner.priceTitle);
            const buttonText =
              getLocalizedValue(banner.buttonText) ||
              dictionary?.home?.popularCategories?.shopNow ||
              "Shop Now";

            const formatPrice = (value: number) => {
              return new Intl.NumberFormat(lang === "ar" ? "ar-AE" : lang, {
                style: "currency",
                currency:
                  lang === "it" || lang === "fr"
                    ? "EUR"
                    : lang === "hi"
                      ? "INR"
                      : lang === "ar"
                        ? "AED"
                        : "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              }).format(value);
            };

            const price = banner.price ? formatPrice(banner.price) : null;

            const defaultPriceLabels: Record<string, string> = {
              en: "Starting at",
              it: "A partire da",
              fr: "À partir de",
              hi: "शुरुआत",
              ar: "تبدأ من",
            };

            const finalPriceTitle =
              priceTitle || defaultPriceLabels[lang] || defaultPriceLabels.en;

  // Inside the banners.map loop...
return (
  <div
    key={banner._id}
    className="flex-[0_0_100%] min-w-0 relative h-[80vh] md:h-[90vh] flex items-center overflow-hidden bg-stone-900 text-stone-100"
  >
    {/* Background Image with Overlay */}
    {banner.image && (
      <div className="absolute inset-0 opacity-40">
        <Image
          src={urlFor(banner.image).width(2000).quality(90).url()}
          alt={title || "Banner Image"}
          fill
          priority
          className="w-full h-full object-cover"
        />
      </div>
    )}

    {/* Content Container */}
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="max-w-3xl">
        {subtitle && (
          <span
            className={`text-sm uppercase tracking-[0.3em] font-medium mb-6 block text-stone-400 ${
              isActive ? "animate-slideRightFade delay-0" : "opacity-0"
            }`}
          >
            {subtitle}
          </span>
        )}

        {title && (
          <h2
            className={`text-5xl md:text-8xl font-serif leading-tight mb-8 ${
              isActive ? "animate-slideRightFade delay-100" : "opacity-0"
            }`}
          >
            {/* Logic to apply italic style to parts of the title if desired, 
                otherwise standard rendering */}
            {title}
          </h2>
        )}

        {description && (
          <p
            className={`text-lg md:text-xl text-stone-300 max-w-lg mb-8 font-light leading-relaxed ${
              isActive ? "animate-slideRightFade delay-200" : "opacity-0"
            }`}
          >
            {description}
            {price && (
              <span className="block mt-2 font-semibold text-stone-100">
                {finalPriceTitle} {price}
              </span>
            )}
          </p>
        )}

        <div
          className={`flex flex-wrap gap-6 items-center ${
            isActive ? "animate-slideRightFade delay-300" : "opacity-0"
          }`}
        >
          {banner.link && (
            <Link
              href={banner.link}
              className="bg-stone-100 text-stone-900 px-8 py-4 rounded-full font-medium flex items-center space-x-2 hover:bg-stone-200 transition-all duration-300 shadow-lg hover:-translate-y-1"
            >
              <span>{buttonText}</span>
              <ArrowRight size={18} />
            </Link>
          )}

          {/* Optional Secondary Action (The "Watch" button style from your ref) */}
          <button className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-full border border-stone-100 flex items-center justify-center group-hover:bg-stone-100 group-hover:text-stone-900 transition-all">
              <ChevronRight size={16} fill="currentColor" />
            </div>
            <span className="text-sm uppercase tracking-widest font-medium text-stone-100">
              Explore More
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
);
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/30 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/50 border border-white/20 z-10"
        onClick={scrollPrev}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/30 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/50 border border-white/20 z-10"
        onClick={scrollNext}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-5 h-5 border rounded-full flex items-center justify-center transition-all duration-300 ${
              index === selectedIndex
                ? "border-shop_dark_green"
                : "border-transparent"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full inline-flex transition-all duration-300 ${
                index === selectedIndex
                  ? "bg-shop_dark_green"
                  : "bg-shop_dark_green/80"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
