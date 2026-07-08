"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Droplets, 
  Sun, 
  Droplet, 
  Sparkles,
  TrendingUp,
  Award,
  ChevronRight
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
};

export default function OurCoffee() {
  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-stone-900">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=2000&auto=format"
            alt="Coffee farm and processing"
            fill
            className="object-cover opacity-40"
            priority
          />
        </div>

        <Container className="relative z-10 text-center text-white">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="max-w-4xl mx-auto"
          >
            <Badge className="mb-6 bg-amber-600/20 text-amber-400 border-amber-600/50">
              From Farm to Cup
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Our Coffee
            </h1>
            <div className="w-24 h-1 bg-amber-500 mx-auto my-8 rounded-full" />
            <p className="text-lg md:text-xl text-stone-300 max-w-2xl mx-auto">
              Discover the art and science behind every cup — from cherry to roast.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Introduction Section */}
      <section className="py-24 bg-gradient-to-b from-white to-amber-50/30">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <div className="h-1 w-16 bg-gradient-to-r from-amber-600 to-amber-800 rounded-full" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-stone-900 mb-6">
              Our Processing Methods
            </h2>
            <p className="text-lg text-stone-600 leading-relaxed">
              Each coffee we source undergoes meticulous processing to unlock its unique character. 
              From the sun-drenched drying beds to the controlled fermentation tanks, every step is 
              designed to bring out the very best in the bean.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Natural Process Section */}
      <Container className="py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInRight}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-100">
                <Sun className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-stone-900">Natural Process</h3>
            </div>
            <div className="space-y-4 text-stone-600 leading-relaxed">
              <p>
                We carefully sort coffee cherries multiple times, selecting only those at peak ripeness. 
                Fully intact cherries are quickly transported in ventilated boxes and laid on raised drying 
                beds to dry naturally under the sun.
              </p>
              <p>
                The cherries are turned regularly to ensure even drying and consistent quality. This natural 
                process allows the fruit of the cherry to infuse the bean, creating deeper complexity and 
                vibrant flavor.
              </p>
              <p>
                Customers can expect fruit-forward tasting notes ranging from blueberry and mango to ripe 
                strawberry. The sun-drying process takes approximately 34 days, resulting in a bold, 
                expressive coffee with a naturally rich profile.
              </p>
            </div>
            <Badge variant="outline" className="bg-white/50">
              Learn More <ChevronRight className="w-3 h-3 ml-1" />
            </Badge>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInLeft}
            className="grid grid-cols-2 gap-4"
          >
            <div className="group relative overflow-hidden rounded-2xl shadow-xl">
              <div className="aspect-video relative">
                <Image
                  src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format"
                  alt="Coffee cherries drying under sunlight"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl shadow-xl">
              <div className="aspect-video relative">
                <Image
                  src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format"
                  alt="Raised drying beds"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </Container>

      {/* Washed Process Section */}
      <div className="bg-gradient-to-r from-blue-50/30 to-cyan-50/30 py-16 my-8">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInRight}
              className="order-2 lg:order-1 grid grid-cols-2 gap-4"
            >
              <div className="group relative overflow-hidden rounded-2xl shadow-xl">
                <div className="aspect-video relative">
                  <Image
                    src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format"
                    alt="Coffee washing channels"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-2xl shadow-xl">
                <div className="aspect-video relative">
                  <Image
                    src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format"
                    alt="Coffee processing equipment"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInLeft}
              className="order-1 lg:order-2 space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-100">
                  <Droplets className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-stone-900">Washed Process</h3>
              </div>
              <div className="space-y-4 text-stone-600 leading-relaxed">
                <p>
                  Only the ripest coffee cherries are hand-selected, then placed into water-filled channels 
                  where defects naturally rise and are removed.
                </p>
                <p>
                  The cherries are guided through a depulper, gently separating the fruit from the beans. 
                  The beans are fermented for 12–48 hours with their naturally occurring honey-like layer 
                  intact, allowing clean and refined flavors to develop.
                </p>
                <p>
                  After fermentation, the coffee is thoroughly washed in controlled channels where lighter, 
                  imperfect beans float away while dense, high-quality beans settle.
                </p>
                <p>
                  The coffee is then transferred to our dry mill and slowly dried on 1,700 raised drying beds 
                  built to ensure consistency, clarity, and exceptional quality.
                </p>
              </div>
              <Badge variant="outline" className="bg-white/50">
                Learn More <ChevronRight className="w-3 h-3 ml-1" />
              </Badge>
            </motion.div>
          </div>
        </Container>
      </div>

      {/* Honey Process Section */}
      <Container className="py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInRight}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-100">
                <Droplet className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-stone-900">Honey Process</h3>
            </div>
            <div className="space-y-4 text-stone-600 leading-relaxed">
              <p>
                In the honey process, the cherry peel is removed while some of the fruit flesh remains 
                attached. This sticky layer, known as mucilage, remains on the beans while drying.
              </p>
              <p>
                The amount of mucilage retained after processing creates different honey varieties. 
                Higher mucilage content creates fuller-bodied coffee with richer flavor profiles.
              </p>
            </div>
            
            {/* Honey Varieties */}
            <div className="mt-6">
              <h4 className="font-semibold text-stone-900 mb-3 text-lg">Honey Varieties:</h4>
              <div className="flex flex-wrap gap-2">
                {["White Honey", "Yellow Honey", "Gold Honey", "Red Honey", "Black Honey"].map((variety, idx) => {
                  const colors = [
                    "bg-white text-gray-700 border-gray-200",
                    "bg-yellow-50 text-yellow-700 border-yellow-200",
                    "bg-amber-50 text-amber-700 border-amber-200",
                    "bg-orange-50 text-orange-700 border-orange-200",
                    "bg-amber-800/10 text-amber-900 border-amber-300"
                  ];
                  return (
                    <Badge key={idx} variant="outline" className={`${colors[idx]} px-3 py-1.5 text-sm font-medium`}>
                      {variety}
                    </Badge>
                  );
                })}
              </div>
            </div>
            
            <Badge variant="outline" className="bg-white/50">
              Learn More <ChevronRight className="w-3 h-3 ml-1" />
            </Badge>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInLeft}
            className="grid grid-cols-2 gap-4"
          >
            <div className="group relative overflow-hidden rounded-2xl shadow-xl">
              <div className="aspect-video relative">
                <Image
                  src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format"
                  alt="Honey processing workflow"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl shadow-xl">
              <div className="aspect-video relative">
                <Image
                  src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format"
                  alt="Close up coffee bean processing"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </Container>

      {/* Quality & Sustainability Section */}
      <section className="py-20 bg-stone-900 text-white">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Commitment</h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto rounded-full" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: 0 }}
              className="space-y-4 group"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 group-hover:bg-amber-500/30 transition-all mx-auto">
                <Award className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold">Quality Assured</h3>
              <p className="text-amber-100/80">Every batch is tested for consistency and flavor excellence</p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
              className="space-y-4 group"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 group-hover:bg-amber-500/30 transition-all mx-auto">
                <TrendingUp className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold">Direct Trade</h3>
              <p className="text-amber-100/80">Sustainable partnerships with farmers and cooperatives</p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
              className="space-y-4 group"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 group-hover:bg-amber-500/30 transition-all mx-auto">
                <Sparkles className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold">Fresh Roasted</h3>
              <p className="text-amber-100/80">Small-batch roasting to preserve origin character</p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-50 to-amber-100">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge className="mb-6 bg-stone-900/10 text-stone-900 border-stone-900/20">
              Ready to Taste?
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-stone-900 mb-6">
              Experience Our Coffee
            </h2>
            <p className="text-lg text-stone-600 mb-10 leading-relaxed">
              Ready to taste the difference? Explore our collection of single-origin coffees, 
              each with its own unique processing story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-stone-900 hover:bg-stone-800 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                <Link href="/shop">
                  Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-stone-900 text-stone-900 hover:bg-stone-900/5 px-8 py-6 text-lg rounded-full">
                <Link href="/contact">
                  Learn More
                </Link>
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}