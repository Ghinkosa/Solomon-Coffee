"use client";

import { motion } from "framer-motion";
import {
  Thermometer,
  Clock,
  Wind,
  Flame,
  ArrowRight,
  CheckCircle2,
  Droplets,
  Sun,
  Beaker
} from "lucide-react";

import Container from "@/components/Container";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { useLocalizedPath } from "@/hooks/useLocale";
import Image from "next/image";

const ROASTING_IMAGES = {
  hero:
    "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=2000&auto=format",
  roast1:
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
  roast2:
    "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80",
  roast3:
    "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=80",
  natural:
    "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1200&q=80",
  washed:
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80",
  honey:
    "https://images.unsplash.com/photo-1504630083234-14187a9df0f5?auto=format&fit=crop&w=1200&q=80",
} as const;

interface RoastingClientProps {
  dictionary: any;
}

const RoastingClient = ({ dictionary }: RoastingClientProps) => {
  const toLocalizedPath = useLocalizedPath();
  const page = dictionary?.educationPage ?? {};
  const hero = page.hero ?? {};
  const process = page.process ?? {};
  const processing = page.processing ?? {};
  const cta = page.cta ?? {};
  const highlights = process.highlights ?? [];
  const methods = processing.methods ?? [];
  return (
    <div className="bg-gradient-to-b from-stone-100 to-white min-h-screen">
      {/* HERO SECTION */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-stone-900">
        <Image
          src={ROASTING_IMAGES.hero}
          alt={process.imageAlts?.hero ?? "Coffee Roasting Hero"}
          fill
          priority
          className="object-cover opacity-40"
        />
        <Container className="relative z-10 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <Badge className="mb-6 bg-amber-600/20 border-amber-600/50 text-amber-500 hover:bg-amber-600/30 transition-colors">
              {hero.badge ?? "The Art of the Roast"}
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              {hero.titleLine1 ?? "Crafted With Care"} <br />{" "}
              <span className="text-amber-500">
                {hero.titleAccent ?? "Roasted With Purpose"}
              </span>
            </h1>
            <div className="w-24 h-1 bg-amber-500 mx-auto my-8 rounded-full" />
            <p className="text-lg md:text-xl text-stone-300 max-w-2xl mx-auto">
              {hero.description ??
                "At Sheba Cup Coffee, roasting is simple, intentional, and precise. We preserve the soul of 100% Ethiopian specialty coffee through small-batch mastery in Allentown, PA."}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* PHILOSOPHY & ROASTING DETAILS */}
      <section className="py-24 bg-white">
        <Container className="max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="col-span-2 relative h-80 rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={ROASTING_IMAGES.roast1}
                  alt={process.imageAlts?.drum ?? "Roasting Drum Close Up"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-60 rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src={ROASTING_IMAGES.roast2}
                  alt={process.imageAlts?.green ?? "Green Coffee Beans"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-60 rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src={ROASTING_IMAGES.roast3}
                  alt={process.imageAlts?.finished ?? "Finished Roast"}
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-stone-900 mb-8 leading-tight">
                {process.titleLine1 ?? "Our Roasting Process"} <br />{" "}
                {process.titleLine2 ?? "At Sheba Cup"}
              </h2>
              <div className="space-y-6 text-lg text-stone-600 leading-relaxed">
                <p>
                  {process.paragraph1 ??
                    "Every specialty coffee roast begins slowly and deliberately. We gently apply heat so the beans develop evenly and cleanly. As the roast progresses, natural sugars emerge and sweetness builds naturally."}
                </p>
                <p>
                  {process.paragraph2 ??
                    "We finish the roast at the exact moment the beans become balanced, expressive, and alive—where clarity, sweetness, and acidity come together in perfect harmony."}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {highlights.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-amber-600" />
                      <span className="text-stone-800 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* PROCESSING METHODS (The detailed content you provided) */}
      <section className="py-24 bg-stone-50 border-y border-stone-200">
        <Container className="max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4">{processing.badge ?? "Beyond the Roast"}</Badge>
            <h2 className="text-4xl font-bold text-stone-900">
              {processing.title ?? "Our Processing Methods"}
            </h2>
            <p className="text-stone-500 mt-4 max-w-2xl mx-auto italic">
              {processing.description ??
                "The journey from cherry to bean defines the flavor profile long before it hits our roaster."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {methods.map((method: { title: string; description: string; imageAlt: string }, index: number) => {
              const images = [ROASTING_IMAGES.natural, ROASTING_IMAGES.washed, ROASTING_IMAGES.honey];
              const icons = [Sun, Droplets, Beaker];
              const MethodIcon = icons[index] ?? Sun;
              return (
            <Card key={index} className="border-none shadow-xl bg-white overflow-hidden group">
              <div className="h-48 relative">
                <Image 
                  src={images[index]}
                  alt={method.imageAlt}
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-black/20" />
                <MethodIcon className="absolute bottom-4 right-4 text-white w-8 h-8" />
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-stone-900">{method.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {method.description}
                </p>
              </CardContent>
            </Card>
            );
            })}
          </div>
        </Container>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24 text-center">
        <Container className="max-w-4xl">
          <h2 className="text-4xl lg:text-5xl font-bold text-stone-900 mb-6">
            {cta.titleLine1 ?? "Because Great Coffee"} <br />{" "}
            {cta.titleLine2 ?? "Should Speak Clearly"}
          </h2>
          <p className="text-xl text-stone-600 leading-relaxed mb-10">
            {cta.description ??
              "Dark roasting masks origin. Our approach allows the coffee's true identity to remain intact—from the land it was grown on to the cup in your hand. Bright, floral, and aromatic."}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-stone-950 hover:bg-stone-800 text-white rounded-full px-12 h-14 text-lg"
          >
            <Link href={toLocalizedPath("/shop")}>
              {cta.button ?? "Explore the Collection"}
            </Link>
          </Button>
        </Container>
      </section>
    </div>
  );
};

export default RoastingClient;