"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useAnimation } from "framer-motion";
import { urlFor } from "@/sanity/lib/image";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Droplets, 
  Sun, 
  Droplet, 
  Wind,
  Coffee,
  Sparkles,
  TrendingUp,
  Award
} from "lucide-react";

interface ProcessSection {
  enabled: boolean;
  title: string;
  description?: any;
  images?: any[];
  varieties?: string[];
}

interface OurCoffeeProps {
  coffeeContent: {
    title?: string;
    description?: string;
    heroImage?: any;
    naturalProcess?: ProcessSection;
    washedProcess?: ProcessSection;
    honeyProcess?: ProcessSection & { varieties?: string[] };
    anaerobicProcess?: ProcessSection;
  };
}

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const ProcessCard = ({ 
  title, 
  description, 
  images, 
  reversed = false,
  icon: Icon,
  color
}: { 
  title: string; 
  description: any; 
  images?: any[]; 
  reversed?: boolean;
  icon: React.ElementType;
  color: string;
}) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  if (!images || images.length === 0) return null;

  const content = (
    <motion.div 
      variants={fadeInUp}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-shop_dark_green">{title}</h3>
      </div>
      <div className="prose prose-lg text-gray-600 leading-relaxed">
        {description?.map((block: any, idx: number) => (
          <p key={idx} className="mb-4">
            {block.children?.map((c: any) => c.text).join("")}
          </p>
        ))}
      </div>
    </motion.div>
  );

  const imageSection = (
    <motion.div 
      variants={fadeInUp}
      className="grid grid-cols-2 gap-4"
    >
      {images.slice(0, 2).map((img, idx) => (
        <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden shadow-xl group">
          <Image
            src={urlFor(img).url()}
            alt={`${title} process ${idx + 1}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ))}
    </motion.div>
  );

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={staggerContainer}
      className={`grid md:grid-cols-2 gap-12 items-center py-16 border-b border-gray-100 last:border-0 ${
        reversed ? "md:direction-rtl" : ""
      }`}
    >
      {reversed ? (
        <>
          {imageSection}
          {content}
        </>
      ) : (
        <>
          {content}
          {imageSection}
        </>
      )}
    </motion.div>
  );
};

export default function OurCoffee({ coffeeContent }: OurCoffeeProps) {
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });

  // Default content if nothing from Sanity
  const naturalProcess = coffeeContent?.naturalProcess || {
    enabled: true,
    title: "Natural Process",
    description: [
      {
        children: [
          { text: "We carefully sort coffee cherries multiple times, selecting only those at peak ripeness. Fully intact cherries are quickly transported in ventilated boxes and laid on raised drying beds to dry naturally under the sun.\n\nThe cherries are turned regularly to ensure even drying and consistent quality. This natural process allows the fruit of the cherry to infuse the bean, creating deeper complexity and vibrant flavor.\n\nCustomers can expect fruit-forward tasting notes ranging from blueberry and mango to ripe strawberry.\n\nThe sun-drying process takes approximately 34 days, resulting in a bold, expressive coffee with a naturally rich profile." }
        ]
      }
    ]
  };

  const washedProcess = coffeeContent?.washedProcess || {
    enabled: true,
    title: "Washed Process",
    description: [
      {
        children: [
          { text: "Only the ripest coffee cherries are hand-selected, then placed into water-filled channels where defects naturally rise and are removed.\n\nThe cherries are guided through a depulper, gently separating the fruit from the beans.\n\nThe beans are fermented for 12–48 hours with their naturally occurring honey-like layer intact, allowing clean and refined flavors to develop.\n\nAfter fermentation, the coffee is thoroughly washed in controlled channels where lighter, imperfect beans float away while dense, high-quality beans settle.\n\nThe coffee is then transferred to our dry mill and slowly dried on 1,700 raised drying beds built to ensure consistency, clarity, and exceptional quality." }
        ]
      }
    ]
  };

  const honeyProcess = coffeeContent?.honeyProcess || {
    enabled: true,
    title: "Honey Process",
    description: [
      {
        children: [
          { text: "In the honey process, the cherry peel is removed while some of the fruit flesh remains attached. This sticky layer, known as mucilage, remains on the beans while drying.\n\nThe amount of mucilage retained after processing creates different honey varieties. Higher mucilage content creates fuller-bodied coffee with richer flavor profiles." }
        ]
      }
    ],
    varieties: [
      "White Honey",
      "Yellow Honey",
      "Gold Honey",
      "Red Honey",
      "Black Honey"
    ]
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=2000&auto=format"
            alt="Coffee farm and processing"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        {/* Animated Coffee Beans Background */}
        <div className="absolute inset-0 z-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`
              }}
            >
              <Coffee className="w-8 h-8 text-amber-200" />
            </div>
          ))}
        </div>

        <Container className="relative z-10 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-amber-500/20 text-amber-200 border-amber-400/30 backdrop-blur-sm">
              From Farm to Cup
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              {coffeeContent?.title || "Our Coffee"}
            </h1>
            <p className="text-xl md:text-2xl text-amber-100/90 max-w-3xl mx-auto">
              {coffeeContent?.description || "Discover the art and science behind every cup — from cherry to roast."}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Introduction Section */}
      <section className="py-20 bg-gradient-to-b from-white to-amber-50/30">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <div className="h-1 w-16 bg-gradient-to-r from-shop_light_green to-shop_dark_green rounded-full" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-shop_dark_green mb-6">
              Our Processing Methods
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Each coffee we source undergoes meticulous processing to unlock its unique character. 
              From the sun-drenched drying beds to the controlled fermentation tanks, every step is 
              designed to bring out the very best in the bean.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Natural Process Section */}
      <Container className="py-12">
        <ProcessCard
          title={naturalProcess.title}
          description={naturalProcess.description}
          images={naturalProcess.images}
          reversed={false}
          icon={Sun}
          color="bg-amber-500"
        />
      </Container>

      {/* Washed Process Section */}
      <div className="bg-amber-50/20">
        <Container className="py-12">
          <ProcessCard
            title={washedProcess.title}
            description={washedProcess.description}
            images={washedProcess.images}
            reversed={true}
            icon={Droplets}
            color="bg-blue-500"
          />
        </Container>
      </div>

      {/* Honey Process Section */}
      <Container className="py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center py-16 border-b border-gray-100">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-100">
                <Droplet className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-shop_dark_green">{honeyProcess.title}</h3>
            </div>
            <div className="prose prose-lg text-gray-600 leading-relaxed">
              {honeyProcess.description?.map((block: any, idx: number) => (
                <p key={idx} className="mb-4">
                  {block.children?.map((c: any) => c.text).join("")}
                </p>
              ))}
            </div>
            
            {/* Honey Varieties */}
            {honeyProcess.varieties && honeyProcess.varieties.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-shop_dark_green mb-3">Honey Varieties:</h4>
                <div className="flex flex-wrap gap-2">
                  {honeyProcess.varieties.map((variety, idx) => (
                    <Badge key={idx} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      {variety}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {(honeyProcess.images || [
              { asset: { url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format" } },
              { asset: { url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format" } }
            ]).slice(0, 2).map((img, idx) => (
              <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden shadow-xl group">
                <Image
                  src={img.asset?.url || img.url || "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format"}
                  alt={`Honey process ${idx + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </Container>

      {/* Anaerobic Process (Bonus Section) */}
      {coffeeContent?.anaerobicProcess?.enabled && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50">
          <Container className="py-12">
            <ProcessCard
              title={coffeeContent.anaerobicProcess.title || "Anaerobic Process"}
              description={coffeeContent.anaerobicProcess.description}
              images={coffeeContent.anaerobicProcess.images}
              reversed={false}
              icon={Wind}
              color="bg-purple-500"
            />
          </Container>
        </div>
      )}

      {/* Quality & Sustainability Section */}
      <section className="py-20 bg-shop_dark_green text-white">
        <Container>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mx-auto">
                <Award className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold">Quality Assured</h3>
              <p className="text-amber-100/80">Every batch is tested for consistency and flavor excellence</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mx-auto">
                <TrendingUp className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold">Direct Trade</h3>
              <p className="text-amber-100/80">Sustainable partnerships with farmers and cooperatives</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mx-auto">
                <Sparkles className="w-8 h-8 text-amber-400" />
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
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-shop_dark_green mb-4">
              Experience Our Coffee
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Ready to taste the difference? Explore our collection of single-origin coffees, 
              each with its own unique processing story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-shop_dark_green hover:bg-shop_dark_green/90">
                <Link href="/shop">
                  Shop Now <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-shop_dark_green text-shop_dark_green">
                <Link href="/contact">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Add CSS animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        .animate-float {
          animation: float infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}