"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useAnimation, useInView } from "framer-motion";
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
  Award,
  ChevronRight
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

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
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
  color,
  index
}: { 
  title: string; 
  description: any; 
  images?: any[]; 
  reversed?: boolean;
  icon: React.ElementType;
  color: string;
  index: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  if (!images || images.length === 0) return null;

  const animation = reversed ? fadeInLeft : fadeInRight;

  return (
    <div ref={ref} className="relative">
      {/* Decorative element */}
      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
        <div className={`w-12 h-1 rounded-full bg-gradient-to-r ${color === "bg-amber-500" ? "from-amber-500 to-orange-500" : color === "bg-blue-500" ? "from-blue-500 to-cyan-500" : "from-amber-600 to-amber-400"}`} />
      </div>

      <div className={`grid lg:grid-cols-2 gap-12 items-center py-16 ${index !== 2 ? "border-b border-gray-100" : ""}`}>
        <motion.div
          variants={!reversed ? fadeInLeft : fadeInRight}
          initial="hidden"
          animate={controls}
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
          <Badge variant="outline" className="bg-white/50">
            Learn More <ChevronRight className="w-3 h-3 ml-1" />
          </Badge>
        </motion.div>

        <motion.div
          variants={reversed ? fadeInLeft : fadeInRight}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-2 gap-4"
        >
          {images.slice(0, 2).map((img, idx) => (
            <div key={idx} className="group relative overflow-hidden rounded-2xl shadow-xl">
              <div className="aspect-video relative">
                <Image
                  src={urlFor(img).url()}
                  alt={`${title} process ${idx + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default function OurCoffee({ coffeeContent }: OurCoffeeProps) {
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true, amount: 0.1 });
  const heroControls = useAnimation();

  useEffect(() => {
    if (isHeroInView) {
      heroControls.start("visible");
    }
  }, [isHeroInView, heroControls]);

  // Default content based on client requirements
  const naturalProcess = coffeeContent?.naturalProcess || {
    enabled: true,
    title: "Natural Process",
    description: [
      {
        children: [
          { text: "We carefully sort coffee cherries multiple times, selecting only those at peak ripeness. Fully intact cherries are quickly transported in ventilated boxes and laid on raised drying beds to dry naturally under the sun." },
          { text: "The cherries are turned regularly to ensure even drying and consistent quality. This natural process allows the fruit of the cherry to infuse the bean, creating deeper complexity and vibrant flavor." },
          { text: "Customers can expect fruit-forward tasting notes ranging from blueberry and mango to ripe strawberry." },
          { text: "The sun-drying process takes approximately 34 days, resulting in a bold, expressive coffee with a naturally rich profile." }
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
          { text: "Only the ripest coffee cherries are hand-selected, then placed into water-filled channels where defects naturally rise and are removed." },
          { text: "The cherries are guided through a depulper, gently separating the fruit from the beans." },
          { text: "The beans are fermented for 12–48 hours with their naturally occurring honey-like layer intact, allowing clean and refined flavors to develop." },
          { text: "After fermentation, the coffee is thoroughly washed in controlled channels where lighter, imperfect beans float away while dense, high-quality beans settle." },
          { text: "The coffee is then transferred to our dry mill and slowly dried on 1,700 raised drying beds built to ensure consistency, clarity, and exceptional quality." }
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
          { text: "In the honey process, the cherry peel is removed while some of the fruit flesh remains attached. This sticky layer, known as mucilage, remains on the beans while drying." },
          { text: "The amount of mucilage retained after processing creates different honey varieties. Higher mucilage content creates fuller-bodied coffee with richer flavor profiles." }
        ]
      }
    ],
    varieties: ["White Honey", "Yellow Honey", "Gold Honey", "Red Honey", "Black Honey"]
  };

  // Placeholder images if none provided
  const defaultNaturalImages = [
    { asset: { url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format" } },
    { asset: { url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format" } }
  ];
  
  const defaultWashedImages = [
    { asset: { url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format" } },
    { asset: { url: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format" } }
  ];
  
  const defaultHoneyImages = [
    { asset: { url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format" } },
    { asset: { url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format" } }
  ];

  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=2000&auto=format"
            alt="Coffee farm and processing"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>

        {/* Animated Coffee Beans */}
        <div className="absolute inset-0 z-0 opacity-30">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${8 + Math.random() * 12}s`
              }}
            >
              <Coffee className="w-6 h-6 text-amber-300/50" />
            </div>
          ))}
        </div>

        <Container className="relative z-10 text-center text-white">
          <motion.div
            ref={heroRef}
            initial="hidden"
            animate={heroControls}
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-6 bg-amber-500/30 text-amber-200 border-amber-400/50 backdrop-blur-sm px-4 py-1.5">
                From Farm to Cup
              </Badge>
            </motion.div>
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight tracking-tight"
            >
              {coffeeContent?.title || "Our Coffee"}
            </motion.h1>
            <motion.div variants={fadeInUp} className="w-24 h-1 bg-amber-500 mx-auto my-8 rounded-full" />
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-amber-100/90 max-w-2xl mx-auto leading-relaxed"
            >
              {coffeeContent?.description || "Discover the art and science behind every cup — from cherry to roast."}
            </motion.p>
          </motion.div>
        </Container>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-2 bg-white/50 rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Introduction Section */}
      <section className="py-24 bg-gradient-to-b from-white to-amber-50/30">
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
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-shop_dark_green mb-6">
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
      <Container className="py-8">
        <ProcessCard
          title={naturalProcess.title}
          description={naturalProcess.description}
          images={naturalProcess.images || defaultNaturalImages}
          reversed={false}
          icon={Sun}
          color="bg-amber-500"
          index={0}
        />
      </Container>

      {/* Washed Process Section */}
      <div className="bg-gradient-to-r from-blue-50/30 to-cyan-50/30 py-8 my-8">
        <Container>
          <ProcessCard
            title={washedProcess.title}
            description={washedProcess.description}
            images={washedProcess.images || defaultWashedImages}
            reversed={true}
            icon={Droplets}
            color="bg-blue-500"
            index={1}
          />
        </Container>
      </div>

      {/* Honey Process Section */}
      <Container className="py-8">
        <div className="relative py-16">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
            <div className="w-12 h-1 rounded-full bg-gradient-to-r from-amber-600 to-amber-400" />
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
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
              
              {/* Honey Varieties Grid */}
              {honeyProcess.varieties && honeyProcess.varieties.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-semibold text-shop_dark_green mb-4 text-lg">Honey Varieties:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {honeyProcess.varieties.map((variety, idx) => {
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
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {(honeyProcess.images || defaultHoneyImages).slice(0, 2).map((img, idx) => (
                <div key={idx} className="group relative overflow-hidden rounded-2xl shadow-xl">
                  <div className="aspect-video relative">
                    <Image
                      src={img.asset?.url || img.url || "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format"}
                      alt={`Honey process ${idx + 1}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </Container>

      {/* Quality & Sustainability Section */}
      <section className="py-24 bg-shop_dark_green text-white mt-16">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Commitment</h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto rounded-full" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
              viewport={{ once: true }}
              className="space-y-4 group"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 group-hover:bg-amber-500/30 transition-all mx-auto">
                <Award className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold">Quality Assured</h3>
              <p className="text-amber-100/80 leading-relaxed">Every batch is tested for consistency and flavor excellence</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="space-y-4 group"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 group-hover:bg-amber-500/30 transition-all mx-auto">
                <TrendingUp className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold">Direct Trade</h3>
              <p className="text-amber-100/80 leading-relaxed">Sustainable partnerships with farmers and cooperatives</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-4 group"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 group-hover:bg-amber-500/30 transition-all mx-auto">
                <Sparkles className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold">Fresh Roasted</h3>
              <p className="text-amber-100/80 leading-relaxed">Small-batch roasting to preserve origin character</p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50">
        <Container>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge className="mb-6 bg-shop_dark_green/10 text-shop_dark_green border-shop_dark_green/20">
              Ready to Taste?
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-shop_dark_green mb-6">
              Experience Our Coffee
            </h2>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Ready to taste the difference? Explore our collection of single-origin coffees, 
              each with its own unique processing story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-shop_dark_green hover:bg-shop_dark_green/90 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                <Link href="/shop">
                  Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-shop_dark_green text-shop_dark_green hover:bg-shop_dark_green/5 px-8 py-6 text-lg rounded-full">
                <Link href="/contact">
                  Learn More
                </Link>
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
        .animate-float {
          animation: float infinite ease-in-out;
        }
        .animate-bounce {
          animation: bounce 2s infinite;
        }
      `}</style>
    </div>
  );
}