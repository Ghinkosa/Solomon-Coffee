"use client";

import useEmblaCarousel from "embla-carousel-react";
import Fade from "embla-carousel-fade";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { localizedPath } from "@/lib/localized-path";
import { urlFor } from "@/sanity/lib/image";
import { useCallback, useEffect, useState } from "react";

interface Banner {
  _id: string;
  _type: "banner";
  title?: {
    en?: string;
    es?: string;
    ar?: string;
  };
  subtitle?: {
    en?: string;
    es?: string;
    ar?: string;
  };
  priceTitle?: {
    en?: string;
    es?: string;
    ar?: string;
  };
  price?: number;
  weight?: number;
  description?: {
    en?: string;
    es?: string;
    ar?: string;
  };
  image?: {
    asset: {
      _ref: string;
      _type: "reference";
    };
  };
  backgroundVideo?: {
    asset?: {
      url?: string;
    };
  };
  backgroundVideoUrl?: string;
  disableVideoOnMobile?: boolean;
  link?: string;
  buttonText?: {
    en?: string;
    es?: string;
    ar?: string;
  };
}

interface BannerCarouselProps {
  banners: Banner[];
  lang: string;
  dictionary: any;
}

const BannerCarousel = ({ banners, lang, dictionary }: BannerCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Fade()]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [disableVideoForUser, setDisableVideoForUser] = useState(false);
  const [videoDurations, setVideoDurations] = useState<Record<string, number>>(
    {},
  );

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

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 768);
    updateViewport();
    window.addEventListener("resize", updateViewport);

    const saveData = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection?.saveData;

    // Keep gating narrow for predictable CMS testing: only disable when user enables data saver.
    setDisableVideoForUser(Boolean(saveData));

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

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

  const heroShopLink = `/${lang || "en"}/shop`;

  const getSlideDelay = (banner: Banner) => {
    const videoUrl =
      banner.backgroundVideoUrl || banner.backgroundVideo?.asset?.url;
    const canPlayVideoForSlide =
      Boolean(videoUrl) &&
      !disableVideoForUser &&
      !(isMobile && banner.disableVideoOnMobile);

    if (!canPlayVideoForSlide) return 5000;

    const videoDuration = videoDurations[banner._id];
    if (!videoDuration || !Number.isFinite(videoDuration)) return 5000;

    // Small buffer so CTA/content is visible briefly after the video loop.
    return Math.round(videoDuration * 1000) + 600;
  };

  useEffect(() => {
    if (!emblaApi || banners.length === 0) return;
    const currentBanner = banners[selectedIndex];
    if (!currentBanner) return;

    const timeoutId = setTimeout(() => {
      emblaApi.scrollNext();
    }, getSlideDelay(currentBanner));

    return () => clearTimeout(timeoutId);
  }, [
    emblaApi,
    selectedIndex,
    banners,
    isMobile,
    disableVideoForUser,
    videoDurations,
  ]);

  return (
    <div className="relative isolate group">
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
              dictionary?.home?.banner?.shopNow ||
              "Shop Now";

            const formatPrice = (value: number) => {
              return new Intl.NumberFormat(lang === "ar" ? "ar-AE" : lang, {
                style: "currency",
                currency: lang === "ar" ? "AED" : "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              }).format(value);
            };

            const price = banner.price ? formatPrice(banner.price) : null;

            const startingAtLabel =
              dictionary?.home?.banner?.startingAt || "Starting at";

            const finalPriceTitle = priceTitle || startingAtLabel;

            const videoUrl =
              banner.backgroundVideoUrl || banner.backgroundVideo?.asset?.url;
            const hasVideo = Boolean(videoUrl);
            const canPlayVideo =
              hasVideo &&
              isActive &&
              !disableVideoForUser &&
              !(isMobile && banner.disableVideoOnMobile);

            return (
              <div
                key={banner._id}
                className="relative flex min-h-[min(720px,80vh)] w-full min-w-0 flex-[0_0_100%] items-center overflow-hidden bg-stone-900 py-14 text-stone-100 sm:py-16 md:min-h-[85vh] md:py-20 lg:py-24"
              >
                {/* Background media: video (when allowed) with image fallback */}
                {canPlayVideo && videoUrl ? (
                  <div className="absolute inset-0 z-0 opacity-45">
                    <video
                      src={videoUrl}
                      className="h-full w-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      onLoadedMetadata={(event) => {
                        const duration = event.currentTarget.duration;
                        if (!duration || !Number.isFinite(duration)) return;

                        setVideoDurations((prev) => {
                          if (prev[banner._id] === duration) return prev;
                          return { ...prev, [banner._id]: duration };
                        });
                      }}
                      poster={
                        banner.image
                          ? urlFor(banner.image).width(1600).quality(70).url()
                          : undefined
                      }
                    />
                  </div>
                ) : banner.image ? (
                  <div className="absolute inset-0 z-0 opacity-40">
                    <Image
                      src={urlFor(banner.image).width(2000).quality(85).url()}
                      alt={title || "Banner Image"}
                      fill
                      priority={index === 0}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}

                {/* Brand overlay for consistent text contrast */}
                <div
                  className="absolute inset-0 z-[1]"
                  style={{
                    background: "rgba(9,51,44,0.48)",
                  }}
                />

                {/* Content Container */}
                <div className="relative z-[2] mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="max-w-3xl">
                    {subtitle && (
                      <span
                        className={`mb-4 block text-sm font-medium uppercase tracking-[0.3em] text-stone-400 sm:mb-5 ${
                          isActive ? "animate-fadeInUp" : "opacity-0"
                        }`}
                      >
                        {subtitle}
                      </span>
                    )}

                    {title && (
                      <h2
                        className={`mb-5 font-serif text-4xl leading-[1.08] sm:mb-6 sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl ${
                          isActive ? "animate-fadeInUp delay-200" : "opacity-0"
                        }`}
                      >
                        {title}
                      </h2>
                    )}

                    {description && (
                      <p
                        className={`mb-6 max-w-lg text-base font-light leading-relaxed text-stone-300 sm:mb-8 sm:text-lg md:text-xl ${
                          isActive ? "animate-fadeInUp delay-400" : "opacity-0"
                        }`}
                      >
                        {description}
                        {price && (
                          <span className="mt-2 block font-semibold text-stone-100">
                            {finalPriceTitle} {price}
                          </span>
                        )}
                      </p>
                    )}

                    <div
                      className={`flex flex-wrap items-center gap-4 sm:gap-6 ${
                        isActive ? "animate-fadeInUp delay-600" : "opacity-0"
                      }`}
                    >
                      {banner.link && (
                        <Link
                          href={localizedPath(banner.link, lang || "en")}
                          className="flex items-center space-x-2 rounded-full bg-stone-100 px-8 py-4 font-medium text-stone-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-stone-200"
                        >
                          <span>{buttonText}</span>
                          <ArrowRight size={18} />
                        </Link>
                      )}

                      <Link
                        href={heroShopLink}
                        className="group flex items-center space-x-3"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-stone-100 transition-all group-hover:bg-stone-100 group-hover:text-stone-900">
                          <ChevronRight size={16} fill="currentColor" />
                        </div>
                        <span className="text-sm font-medium uppercase tracking-widest text-stone-100">
                          {dictionary?.home?.banner?.exploreMore || "Explore More"}
                        </span>
                      </Link>
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
