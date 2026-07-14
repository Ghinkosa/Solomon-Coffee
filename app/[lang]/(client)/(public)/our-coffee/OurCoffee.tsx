"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocalizedPath } from "@/hooks/useLocale";
import { motion } from "motion/react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  Expand,
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

type GalleryImage = {
  src: string;
  alt: string;
};

const PROCESS_GALLERIES: Record<string, GalleryImage[]> = {
  natural: [
    {
      src: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=1400&auto=format",
      alt: "Raised drying beds under sunlight",
    },
    {
      src: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1400&auto=format",
      alt: "Coffee cherries drying naturally",
    },
    {
      src: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=1400&auto=format",
      alt: "Sun-dried coffee cherries close up",
    },
  ],
  washed: [
    {
      src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1400&auto=format",
      alt: "Washed coffee processing",
    },
    {
      src: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1400&auto=format",
      alt: "Coffee washing channels",
    },
    {
      src: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1400&auto=format",
      alt: "Fermentation and washing beds",
    },
  ],
  honey: [
    {
      src: "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=1400&auto=format",
      alt: "Honey process mucilage on beans",
    },
    {
      src: "https://images.unsplash.com/photo-1504630083234-14187a9df0f5?q=80&w=1400&auto=format",
      alt: "Honey processed coffee beans drying",
    },
    {
      src: "https://images.unsplash.com/photo-1497935582031-02786dd579da?q=80&w=1400&auto=format",
      alt: "Sticky mucilage during honey processing",
    },
  ],
};

const HONEY_SPECTRUM = [
  { key: "white", tone: "bg-[#f7f3ea]", border: "border-[#e8e0d0]" },
  { key: "yellow", tone: "bg-[#f5e6a8]", border: "border-[#e8d078]" },
  { key: "gold", tone: "bg-[#e8c068]", border: "border-[#d4a84a]" },
  { key: "red", tone: "bg-[#c4784a]", border: "border-[#a85e35]" },
  { key: "black", tone: "bg-[#3a2417]", border: "border-[#2a1a10]" },
] as const;

type ProcessMethod = {
  id: string;
  number: string;
  title: string;
  paragraphs: string[];
  images: GalleryImage[];
  meta: { label: string; value: string }[];
  accent: string;
  reverse?: boolean;
};

function ProcessGallery({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const autoplay = React.useRef(
    Autoplay({
      delay: 4000,
      playOnInit: true,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    autoplay.current,
  ]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    autoplay.current.play();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    if (lightboxOpen) {
      autoplay.current.stop();
    } else {
      autoplay.current.play();
    }
  }, [emblaApi, lightboxOpen]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const lightboxPrev = useCallback(() => {
    setLightboxIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const lightboxNext = useCallback(() => {
    setLightboxIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") lightboxPrev();
      if (e.key === "ArrowRight") lightboxNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, lightboxPrev, lightboxNext]);

  const active = images[selectedIndex] ?? images[0];

  return (
    <>
      <div className="relative">
        <div className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-brand-gold/20 via-transparent to-shop_light_green/15" />

        <div className="relative overflow-hidden rounded-2xl border border-shop_dark_green/10 shadow-[0_24px_60px_-20px_rgba(61,43,31,0.35)]">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {images.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  className="relative aspect-[4/5] min-w-0 flex-[0_0_100%] cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset"
                  onClick={() => openLightbox(index)}
                  aria-label={`View larger: ${image.alt}`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 1024px) 90vw, 40vw"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-shop_dark_green/45 via-transparent to-transparent" />

          <button
            type="button"
            onClick={() => openLightbox(selectedIndex)}
            className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/55"
            aria-label="Open image fullscreen"
          >
            <Expand className="h-4 w-4" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 backdrop-blur-md">
              <span className="text-xs font-medium text-white/90">{title}</span>
              <span className="text-xs text-white/50">·</span>
              <span className="text-xs tabular-nums text-white/70">
                {selectedIndex + 1}/{images.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={scrollPrev}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 flex justify-center gap-2">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === selectedIndex
                  ? "w-6 bg-shop_dark_green"
                  : "w-1.5 bg-shop_dark_green/25 hover:bg-shop_dark_green/40"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-h-[95vh] w-[min(1100px,96vw)] max-w-5xl border-0 bg-transparent p-0 shadow-none sm:rounded-none [&>button]:right-2 [&>button]:top-2 [&>button]:z-20 [&>button]:h-10 [&>button]:w-10 [&>button]:rounded-full [&>button]:border [&>button]:border-white/25 [&>button]:bg-black/50 [&>button]:text-white [&>button]:opacity-100 [&>button]:hover:bg-black/70 [&>button]:hover:text-white">
          <DialogTitle className="sr-only">
            {images[lightboxIndex]?.alt ?? active?.alt ?? title}
          </DialogTitle>

          <div className="relative flex items-center justify-center">
            <button
              type="button"
              onClick={lightboxPrev}
              className="absolute left-2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white transition hover:bg-black/70 sm:left-4"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="relative aspect-[4/5] w-full max-h-[88vh] overflow-hidden rounded-xl bg-black sm:aspect-[3/2]">
              {images[lightboxIndex] && (
                <Image
                  src={images[lightboxIndex].src}
                  alt={images[lightboxIndex].alt}
                  fill
                  sizes="96vw"
                  className="object-contain"
                  priority
                />
              )}
            </div>

            <button
              type="button"
              onClick={lightboxNext}
              className="absolute right-2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white transition hover:bg-black/70 sm:right-4"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <p className="mt-3 text-center text-sm text-white/80">
            {images[lightboxIndex]?.alt}{" "}
            <span className="text-white/45">
              ({lightboxIndex + 1}/{images.length})
            </span>
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function OurCoffee({ dictionary }: { dictionary: any }) {
  const toLocalizedPath = useLocalizedPath();
  const page = dictionary?.ourCoffeePage ?? {};
  const hero = page.hero ?? {};
  const natural = page.natural ?? {};
  const washed = page.washed ?? {};
  const honey = page.honey ?? {};
  const commitment = page.commitment ?? {};
  const cta = page.cta ?? {};
  const commitmentItems = commitment.items ?? [];
  const honeyVarieties: string[] = honey.varieties ?? [
    "White Honey",
    "Yellow Honey",
    "Gold Honey",
    "Red Honey",
    "Black Honey",
  ];

  const withAlts = (
    key: string,
    alts: Record<string, string> | undefined,
    fallbackKeys: string[]
  ): GalleryImage[] => {
    const gallery = PROCESS_GALLERIES[key] ?? [];
    return gallery.map((image, index) => ({
      ...image,
      alt: alts?.[fallbackKeys[index]] ?? image.alt,
    }));
  };

  const methods: ProcessMethod[] = [
    {
      id: "natural",
      number: "01",
      title: natural.title ?? "Natural Process",
      paragraphs: natural.paragraphs ?? [],
      images: withAlts("natural", natural.imageAlts, [
        "beds",
        "drying",
        "drying",
      ]),
      meta: [
        { label: "Drying", value: "~34 days" },
        { label: "Cup profile", value: "Fruit-forward" },
      ],
      accent: "text-shop_light_green",
    },
    {
      id: "washed",
      number: "02",
      title: washed.title ?? "Washed Process",
      paragraphs: washed.paragraphs ?? [],
      images: withAlts("washed", washed.imageAlts, [
        "channels",
        "equipment",
        "channels",
      ]),
      meta: [
        { label: "Fermentation", value: "12–48 hrs" },
        { label: "Cup profile", value: "Clean & refined" },
      ],
      accent: "text-brand-forest",
      reverse: true,
    },
    {
      id: "honey",
      number: "03",
      title: honey.title ?? "Honey Process",
      paragraphs: honey.paragraphs ?? [],
      images: withAlts("honey", honey.imageAlts, [
        "workflow",
        "closeup",
        "workflow",
      ]),
      meta: [
        { label: "Method", value: "Partial mucilage" },
        { label: "Cup profile", value: "Syrupy sweetness" },
      ],
      accent: "text-brand-gold",
    },
  ];

  const heroTitle = hero.title ?? "Our Processing Methods";
  const titleParts = heroTitle.split(/\s+/);
  const titleAccent =
    hero.titleAccent ??
    (titleParts.length > 1 ? titleParts[titleParts.length - 1] : "");
  const titleLead =
    hero.titleLine1 ??
    (titleAccent
      ? titleParts.slice(0, -1).join(" ")
      : heroTitle);

  return (
    <div className="overflow-hidden bg-[#faf8f5]">
      {/* Hero — matched to /education */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-stone-900">
        <Image
          src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=2000&auto=format"
          alt={page.heroImageAlt ?? "Coffee farm and processing"}
          fill
          priority
          className="object-cover opacity-40"
        />
        <Container className="relative z-10 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-4xl"
          >
            <Badge className="mb-6 border-amber-600/50 bg-amber-600/20 text-amber-500 transition-colors hover:bg-amber-600/30">
              {hero.badge ?? "From Farm to Cup"}
            </Badge>
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
              {titleLead}
              {titleAccent ? (
                <>
                  {" "}
                  <span className="text-amber-500">{titleAccent}</span>
                </>
              ) : null}
            </h1>
            <div className="mx-auto my-8 h-1 w-24 rounded-full bg-amber-500" />
            <p className="mx-auto max-w-2xl text-lg text-stone-300 md:text-xl">
              {hero.description ??
                "Each coffee we source undergoes meticulous processing to unlock its unique character. From the sun-drenched drying beds to the controlled fermentation tanks, every step is designed to bring out the very best in the bean."}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Process methods */}
      <section className="relative">
        {methods.map((method, index) => {
          const isLast = index === methods.length - 1;

          return (
            <div
              key={method.id}
              className={`border-b border-shop_dark_green/8 ${
                index % 2 === 1 ? "bg-white" : "bg-[#faf8f5]"
              } ${isLast ? "border-b-0" : ""}`}
            >
              <Container className="py-20 lg:py-28">
                <div
                  className={`grid items-center gap-12 lg:grid-cols-12 lg:gap-16 ${
                    method.reverse ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    variants={fadeInUp}
                    className="lg:col-span-5"
                  >
                    <ProcessGallery images={method.images} title={method.title} />
                  </motion.div>

                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    variants={fadeInUp}
                    className="lg:col-span-7"
                  >
                    <div className="mb-6 flex items-baseline gap-4">
                      <span
                        className={`font-serif text-5xl font-medium leading-none tracking-tight ${method.accent} opacity-80 lg:text-6xl`}
                      >
                        {method.number}
                      </span>
                      <div className="h-px flex-1 bg-shop_dark_green/10" />
                    </div>

                    <h2 className="text-3xl font-semibold tracking-tight text-shop_dark_green sm:text-4xl">
                      {method.title}
                    </h2>

                    <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-y border-shop_dark_green/8 py-4">
                      {method.meta.map((item) => (
                        <div key={item.label}>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-light-text">
                            {item.label}
                          </p>
                          <p className="mt-1 text-sm font-medium text-shop_dark_green">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-dark-text sm:text-base">
                      {method.paragraphs.map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                    </div>

                    {method.id === "honey" && honeyVarieties.length > 0 && (
                      <div className="mt-10">
                        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-light-text">
                          {honey.varietiesTitle ?? "Honey Varieties"}
                        </p>
                        <div className="grid grid-cols-5 gap-2 sm:gap-3">
                          {honeyVarieties.map((variety, idx) => {
                            const spectrum =
                              HONEY_SPECTRUM[idx] ?? HONEY_SPECTRUM[0];
                            return (
                              <div
                                key={variety}
                                className="group flex flex-col items-center gap-2"
                              >
                                <div
                                  className={`aspect-square w-full rounded-xl border ${spectrum.border} ${spectrum.tone} shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5`}
                                />
                                <span className="text-center text-[10px] font-medium leading-tight text-dark-text sm:text-xs">
                                  {variety.replace(/\s*Honey\s*/i, "") ||
                                    variety}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              </Container>
            </div>
          );
        })}
      </section>

      {/* Commitment */}
      <section className="bg-brand-charcoal py-20 text-white lg:py-24">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mb-14 text-center"
          >
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {commitment.title ?? "Our Commitment"}
            </h2>
            <div className="mx-auto mt-5 h-px w-16 bg-brand-gold" />
          </motion.div>

          <div className="grid gap-10 text-center md:grid-cols-3 md:gap-8">
            {commitmentItems.map(
              (
                item: { title: string; description: string },
                index: number
              ) => {
                const icons = [Award, TrendingUp, Sparkles];
                const ItemIcon = icons[index] ?? Award;
                return (
                  <motion.div
                    key={item.title}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="space-y-4"
                  >
                    <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-brand-gold/30 bg-brand-gold/10">
                      <ItemIcon className="h-6 w-6 text-brand-gold-light" />
                    </div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-stone-400">
                      {item.description}
                    </p>
                  </motion.div>
                );
              }
            )}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-[#f3ebe0] py-20 lg:py-24">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-shop_light_green">
              {cta.badge ?? "Ready to Taste?"}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-shop_dark_green sm:text-4xl lg:text-5xl">
              {cta.title ?? "Experience Our Coffee"}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-dark-text">
              {cta.description ??
                "Ready to taste the difference? Explore our collection of single-origin coffees, each with its own unique processing story."}
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-shop_dark_green px-8 text-white hover:bg-brand-brown"
              >
                <Link href={toLocalizedPath("/shop")}>
                  {cta.shopNow ?? "Shop Now"}{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-shop_dark_green/25 bg-transparent px-8 text-shop_dark_green hover:bg-shop_dark_green/5"
              >
                <Link href={toLocalizedPath("/contact")}>
                  {cta.learnMore ?? "Learn More"}
                </Link>
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
