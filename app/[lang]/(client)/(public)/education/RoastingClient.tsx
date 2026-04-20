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
        "Precision thermal profiling ensures even development from core to surface.",
      color: "text-orange-600",
    },
    {
      icon: Clock,
      title: "Time Management",
      description:
        "The Maillard reaction is carefully timed to balance acidity and sweetness.",
      color: "text-amber-700",
    },
    {
      icon: Wind,
      title: "Airflow Dynamics",
      description:
        "Optimized airflow removes chaff and ensures a clean, smoke-free profile.",
      color: "text-blue-500",
    },
    {
      icon: Flame,
      title: "Small Batching",
      description:
        "We roast in limited quantities to maintain absolute quality control.",
      color: "text-red-700",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-stone-100 to-white min-h-screen">
      {/* Hero Section */}
      <section className="py-24 bg-stone-900 text-white relative overflow-hidden">
        <Image
          src="/photo-1511537190424-bbbab87ac5eb.jpg" // ✅ FIXED
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
              Unlocking the hidden potential within Ethiopia&apos;s finest beans
              through science, soul, and precision.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Grid Steps Section */}
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

      {/* Philosophy Section */}
      <section className="py-20">
        <Container className="max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-amber-100 text-amber-800">
                Our Heritage
              </Badge>

              <h2 className="text-4xl font-bold text-stone-900 mb-6 uppercase tracking-tight">
                Beyond the Green Bean
              </h2>

              <p className="text-lg text-stone-600 mb-8 leading-relaxed">
                Roasting is the transformative stage where potential becomes
                reality. Our Master Roasters use a combination of heritage
                techniques and modern data-logging to ensure every batch hits
                the perfect development curve.
              </p>

              <Button
                asChild
                className="bg-stone-900 hover:bg-stone-800 rounded-full"
              >
                <Link href="/shop">
                  View Collections{" "}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl"
            >
              <Image
                src="/photo-1559056199-641a0ac8b55e.jpg" // ✅ FIXED
                alt="Roasting Detail"
                fill
                className="object-cover"
              />
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
              Taste the Tradition
            </h2>

            <p className="text-xl text-stone-400 mb-10">
              Freshly roasted in small batches and delivered to your door.
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