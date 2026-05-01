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
      title: "Temperature Control",
      description:
        "Precision heat application ensures consistent internal and external bean development.",
      color: "text-orange-600",
    },
    {
      icon: Clock,
      title: "Time Management",
      description:
        "Each roast is timed carefully to balance acidity, sweetness, and body.",
      color: "text-amber-700",
    },
    {
      icon: Wind,
      title: "Airflow Dynamics",
      description:
        "Controlled airflow removes chaff and stabilizes roasting conditions.",
      color: "text-blue-500",
    },
    {
      icon: Flame,
      title: "Small Batch Roasting",
      description:
        "Limited batch sizes allow strict quality control and maximum freshness.",
      color: "text-red-700",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-stone-100 to-white min-h-screen">
      
      {/* Hero Section */}
      <section className="py-24 bg-stone-900 text-white relative overflow-hidden">
        <Image
          src="/photo-1511537190424-bbbab87ac5eb.jpg"
          alt="Coffee Roasting"
          fill
          priority
          className="object-cover opacity-30"
        />

        <Container className="max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge className="mb-6 bg-white/10 text-white border-white/20">
              Master Roasting
            </Badge>

            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              The Art of the Roast
            </h1>

            <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Transforming green coffee beans into rich, complex flavors through
              precision, timing, and craftsmanship.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Steps Section */}
      <section className="py-16 -mt-12 relative z-20">
        <Container className="max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center bg-white shadow-lg hover:shadow-xl transition-shadow border-none">
                  <CardContent className="pt-8">
                    <step.icon
                      className={`w-10 h-10 mx-auto mb-4 ${step.color}`}
                    />
                    <h3 className="text-xl font-bold text-stone-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-stone-500 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Roasting Process Section (UPDATED) */}
      <section className="py-24 bg-white">
        <Container className="max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* LEFT - Images */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="col-span-2 relative h-64 rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/roast1.jpg"
                  alt="Roasting Stage 1"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="relative h-48 rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/roast2.jpg"
                  alt="Roasting Stage 2"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="relative h-48 rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/roast3.jpg"
                  alt="Roasting Stage 3"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>

            {/* RIGHT - Explanation */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-amber-100 text-amber-800">
                Roasting Process
              </Badge>

              <h2 className="text-4xl font-bold text-stone-900 mb-6 uppercase tracking-tight">
                Precision in Every Roast
              </h2>

              <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                Roasting is the stage where raw green beans are transformed into
                the flavorful coffee enjoyed worldwide. Carefully controlled
                heat triggers complex chemical reactions that develop aroma,
                sweetness, acidity, and body.
              </p>

              <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                The process begins with drying, followed by the Maillard
                reaction, and continues through the first crack into final
                development. Each phase is monitored closely to ensure balance
                and consistency in every batch.
              </p>

              <p className="text-lg text-stone-600 mb-8 leading-relaxed">
                By combining artisan skill with precise control systems, we
                produce roasts that highlight the unique characteristics of
                every coffee origin — from bright and fruity to deep and bold.
              </p>

              <Button
                asChild
                className="bg-stone-900 hover:bg-stone-800 rounded-full"
              >
                <Link href="/shop">
                  Explore Our Coffee{" "}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-stone-900 text-white">
        <Container className="max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Experience the Difference
            </h2>

            <p className="text-xl text-stone-400 mb-10">
              Freshly roasted coffee crafted with precision and delivered at peak flavor.
            </p>

            <Button
              asChild
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-full px-10"
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