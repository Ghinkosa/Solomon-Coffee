"use client";

import { motion } from "motion/react";
import {
  Thermometer,
  Clock,
  Wind,
  Flame,
  ArrowRight,
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
      {/* HERO */}
      <section className="py-28 bg-stone-950 text-white relative overflow-hidden">
        <Image
          src="/roast-hero.jpg"
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
              At Sheba Cup Coffee, roasting is intentional, precise, and deeply
              connected to the character of every bean. We roast in small
              batches to preserve clarity, sweetness, and the natural beauty of
              specialty coffee.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* ROASTING FEATURES */}
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

      {/* MAIN ROASTING PROCESS */}
      <section className="py-24 bg-white">
        <Container className="max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* LEFT IMAGES */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="col-span-2 relative h-72 rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/roast1.jpg"
                  alt="Coffee Drying Process"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="relative h-52 rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src="/roast2.jpg"
                  alt="Coffee Roasting"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="relative h-52 rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src="/roast3.jpg"
                  alt="Roasted Coffee Beans"
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
              <Badge className="mb-5 bg-amber-100 text-amber-800">
                Our Philosophy
              </Badge>

              <h2 className="text-4xl lg:text-5xl font-bold text-stone-900 mb-6 leading-tight">
                Our Roasting Process <br /> At Sheba Cup Coffee
              </h2>

              <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                At Sheba Cup Coffee, roasting is simple, intentional, and
                precise. From our small roastery in Allentown, Pennsylvania, we
                roast 100% Ethiopian specialty coffee in small batches to
                maintain complete control over quality, freshness, and flavor.
              </p>

              <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                Ethiopian specialty coffee is naturally complex — known for its
                floral aromatics, bright acidity, and smooth sweetness. Our
                roasting philosophy is built around preserving those qualities,
                not overpowering them.
              </p>

              <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                Every specialty coffee roast begins slowly and deliberately. We
                gently apply heat so the beans develop evenly and cleanly. As
                the roast progresses, natural sugars emerge and sweetness builds
                naturally.
              </p>

              <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                We finish the roast at the exact moment the coffee becomes
                balanced, expressive, and alive — where clarity, sweetness, and
                acidity come together in harmony.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-600"></div>
                  <p className="text-stone-700">
                    Light to medium roasting profiles
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-600"></div>
                  <p className="text-stone-700">
                    Never smoky. Never bitter. Never rushed.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-600"></div>
                  <p className="text-stone-700">
                    Designed to preserve origin character and clarity
                  </p>
                </div>
              </div>

              <Button
                asChild
                className="bg-stone-900 hover:bg-stone-800 rounded-full px-8"
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

      {/* WHY WE ROAST THIS WAY */}
      <section className="py-24 bg-stone-100">
        <Container className="max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Badge className="mb-5 bg-stone-900 text-white">
              Why We Roast This Way
            </Badge>

            <h2 className="text-4xl lg:text-5xl font-bold text-stone-900 mb-8">
              Because Great Coffee Should Speak Clearly
            </h2>

            <p className="text-xl text-stone-600 leading-relaxed mb-6">
              Dark roasting can mask origin and erase character. Our approach
              allows the coffee’s true identity to remain intact — from the land
              it was grown on to the cup in your hand.
            </p>

            <p className="text-xl text-stone-600 leading-relaxed mb-10">
              Because of how we roast, our coffees are bright yet smooth,
              floral, aromatic, and clean from first sip to finish. This is
              coffee designed to be enjoyed black, where every origin note can
              be experienced honestly and naturally.
            </p>

            <Button
              asChild
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 rounded-full px-10"
            >
              <Link href="/shop">Order Fresh Coffee</Link>
            </Button>
          </motion.div>
        </Container>
      </section>
    </div>
  );
};

export default RoastingClient;