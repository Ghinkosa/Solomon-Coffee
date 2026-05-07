"use client";

import { motion } from "framer-motion"; // Note: changed to framer-motion as it is the standard package name
import {
  Thermometer,
  Clock,
  Wind,
  Flame,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import Container from "@/components/Container";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import Image from "next/image";

const RoastingClient = () => {
  const steps = [
    {
      icon: Thermometer,
      title: "Precision Heat Control",
      description:
        "Every roast is carefully monitored to ensure balanced bean development and clarity of flavor.",
      color: "text-orange-600",
    },
    {
      icon: Clock,
      title: "Slow Development",
      description:
        "We roast slowly and intentionally, allowing sweetness and complexity to emerge naturally.",
      color: "text-amber-700",
    },
    {
      icon: Wind,
      title: "Clean Airflow",
      description:
        "Controlled airflow keeps the roasting environment stable and consistent throughout the process.",
      color: "text-blue-500",
    },
    {
      icon: Flame,
      title: "Small Batch Roasting",
      description:
        "Small production batches allow us to maintain freshness, quality, and attention to detail.",
      color: "text-red-700",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-stone-100 to-white min-h-screen">
      {/* HERO SECTION */}
      <section className="py-28 bg-stone-950 text-white relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070"
          alt="Coffee Roasting Process"
          fill
          priority
          className="object-cover opacity-30"
        />

        <Container className="max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge className="mb-6 bg-white/10 border-white/20 text-white">
              Our Roasting Process
            </Badge>

            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Crafted With Care <br /> Roasted With Purpose
            </h1>

            <p className="text-xl lg:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed">
              At Sheba Cup Coffee, roasting is simple, intentional, and precise. 
              We preserve the natural beauty of 100% Ethiopian specialty coffee.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* ROASTING FEATURES GRID */}
      <section className="py-16 -mt-12 relative z-20">
        <Container className="max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white border-none shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                  <CardContent className="pt-8 text-center">
                    <step.icon
                      className={`w-10 h-10 mx-auto mb-4 ${step.color}`}
                    />
                    <h3 className="text-xl font-bold text-stone-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-stone-600 leading-relaxed text-sm">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* MAIN ROASTING PROCESS CONTENT */}
      <section className="py-24 bg-white">
        <Container className="max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* LEFT IMAGES (Grid of 3 as requested) */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="col-span-2 relative h-72 rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=2070"
                  alt="Specialty Coffee Sorting"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-52 rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1525088553748-01d6e210e00b?q=80&w=2070"
                  alt="The Roasting Drum"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-52 rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1580915411954-282cb1b0d780?q=80&w=2070"
                  alt="Freshly Roasted Beans"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>

            {/* RIGHT CONTENT */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-5 bg-amber-100 text-amber-800 border-amber-200">
                How We Roast
              </Badge>

              <h2 className="text-4xl lg:text-5xl font-bold text-stone-900 mb-6 leading-tight">
                Our Roasting Philosophy <br /> in Allentown, PA
              </h2>

              <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                From our small roastery in Allentown, Pennsylvania, we roast 100% 
                Ethiopian specialty coffee in small batches to maintain complete 
                control over quality, freshness, and flavor.
              </p>

              <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                Ethiopian specialty coffee is naturally complex — known for its 
                floral aromatics, bright acidity, and smooth sweetness. Our philosophy 
                is built around preserving those qualities, not overpowering them.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "Light to medium roasting profiles",
                  "Never smoky. Never bitter. Never rushed.",
                  "Balanced, expressive, and alive",
                  "Designed to let natural character shine"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                    <p className="text-stone-700 font-medium">{item}</p>
                  </div>
                ))}
              </div>

              <Button
                asChild
                className="bg-stone-900 hover:bg-stone-800 rounded-full px-8 h-12"
              >
                <Link href="/shop">
                  Explore Our Coffee
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* WHY WE ROAST THIS WAY - BRAND VOICE */}
      <section className="py-24 bg-stone-100">
        <Container className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Badge className="mb-5 bg-stone-900 text-white">
              Why Choose Us
            </Badge>

            <h2 className="text-4xl lg:text-5xl font-bold text-stone-900 mb-8">
              Because Flavor Should <br /> Speak Softly and Clearly
            </h2>

            <p className="text-xl text-stone-600 leading-relaxed mb-6">
              Dark roasting masks origin and erases character. Our approach allows 
              the coffee’s true identity to remain intact — from the land it was 
              grown on to the cup in your hand.
            </p>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 mb-10">
               <h4 className="text-stone-900 font-bold mb-4 uppercase tracking-widest text-sm">What You’ll Taste</h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-amber-700 font-bold text-lg">Bright</p>
                    <p className="text-stone-500 text-sm">Yet smooth and balanced</p>
                  </div>
                  <div>
                    <p className="text-amber-700 font-bold text-lg">Floral</p>
                    <p className="text-stone-500 text-sm">Naturally aromatic notes</p>
                  </div>
                  <div>
                    <p className="text-amber-700 font-bold text-lg">Clean</p>
                    <p className="text-stone-500 text-sm">From first sip to finish</p>
                  </div>
               </div>
            </div>

            <p className="text-lg text-stone-500 italic mb-10">
              "This is coffee meant to be enjoyed black, where Ethiopian origin speaks clearly and honestly."
            </p>

            <Button
              asChild
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 rounded-full px-10 shadow-lg shadow-amber-600/20"
            >
              <Link href="/shop">Order Freshly Roasted Coffee</Link>
            </Button>
          </motion.div>
        </Container>
      </section>
    </div>
  );
};

export default RoastingClient;