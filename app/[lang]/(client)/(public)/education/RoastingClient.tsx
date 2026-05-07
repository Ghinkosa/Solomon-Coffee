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
import Image from "next/image";

const RoastingClient = () => {
  return (
    <div className="bg-gradient-to-b from-stone-100 to-white min-h-screen">
      {/* HERO SECTION */}
      <section className="py-32 bg-stone-950 text-white relative overflow-hidden">
        <Image
          src="/sheba-hero-roast.jpg"
          alt="Coffee Roasting Hero"
          fill
          priority
          className="object-cover opacity-40"
        />
        <Container className="max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge className="mb-6 bg-amber-600/20 border-amber-600/50 text-amber-500 hover:bg-amber-600/30 transition-colors">
              The Art of the Roast
            </Badge>
            <h1 className="text-6xl lg:text-8xl font-bold mb-8 leading-tight tracking-tight">
              Crafted With Care <br /> <span className="text-amber-500">Roasted With Purpose</span>
            </h1>
            <p className="text-xl lg:text-2xl text-stone-300 max-w-3xl mx-auto leading-relaxed font-light">
              At Sheba Cup Coffee, roasting is simple, intentional, and precise. 
              We preserve the soul of 100% Ethiopian specialty coffee through 
              small-batch mastery in Allentown, PA.
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
                  src="/roast1.jpg"
                  alt="Roasting Drum Close Up"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-60 rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src="/roast2.jpg"
                  alt="Green Coffee Beans"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-60 rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src="/roast3.jpg"
                  alt="Finished Roast"
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
                Our Roasting Process <br /> At Sheba Cup
              </h2>
              <div className="space-y-6 text-lg text-stone-600 leading-relaxed">
                <p>
                  Every specialty coffee roast begins slowly and deliberately. 
                  We gently apply heat so the beans develop evenly and cleanly. 
                  As the roast progresses, natural sugars emerge and sweetness builds naturally.
                </p>
                <p>
                  We finish the roast at the exact moment the beans become balanced, 
                  expressive, and alive—where clarity, sweetness, and acidity come 
                  together in perfect harmony.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {[
                    "Light to medium profiles",
                    "Never smoky or bitter",
                    "Never rushed",
                    "100% Ethiopian origin"
                  ].map((item, i) => (
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
            <Badge className="mb-4">Beyond the Roast</Badge>
            <h2 className="text-4xl font-bold text-stone-900">Our Processing Methods</h2>
            <p className="text-stone-500 mt-4 max-w-2xl mx-auto italic">
              The journey from cherry to bean defines the flavor profile long before it hits our roaster.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* NATURAL PROCESS */}
            <Card className="border-none shadow-xl bg-white overflow-hidden group">
              <div className="h-48 relative">
                <Image 
                  src="sheba-natural-process.jpg" 
                  alt="Natural Process" 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-black/20" />
                <Sun className="absolute bottom-4 right-4 text-white w-8 h-8" />
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-stone-900">Natural Process</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  We carefully sort coffee cherries multiple times, selecting only those at peak ripeness. 
                  Intact cherries are laid on raised drying beds to dry naturally under the sun for 
                  approximately 34 days. This allows the fruit to infuse the bean, creating 
                  fruit-forward notes like blueberry, mango, and ripe strawberry.
                </p>
              </CardContent>
            </Card>

            {/* WASHED PROCESS */}
            <Card className="border-none shadow-xl bg-white overflow-hidden group">
              <div className="h-48 relative">
                <Image 
                  src="/sheba-washed-process.jpg" 
                  alt="Washed Process" 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-black/20" />
                <Droplets className="absolute bottom-4 right-4 text-white w-8 h-8" />
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-stone-900">Washed Process</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Cherries are depulped and fermented for 12–48 hours, then washed in controlled channels 
                  where high-quality dense beans settle. They dry slowly on 1,700 raised beds for 
                  exceptional consistency and clarity. Expect a clean, refined cup that highlights 
                  the bean's elegant acidity.
                </p>
              </CardContent>
            </Card>

            {/* HONEY PROCESS */}
            <Card className="border-none shadow-xl bg-white overflow-hidden group">
              <div className="h-48 relative">
                <Image 
                  src="/honey.jpg" 
                  alt="Honey Process" 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-black/20" />
                <Beaker className="absolute bottom-4 right-4 text-white w-8 h-8" />
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-stone-900">Honey Process</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  The cherry peel is removed but the sweet "mucilage" remains while drying. 
                  Depending on how much mucilage is left, we produce varieties from white and 
                  yellow to black honey coffees. This results in a fuller-bodied coffee with a 
                  distinctive, syrupy sweetness reminiscent of honey.
                </p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24 text-center">
        <Container className="max-w-4xl">
          <h2 className="text-4xl lg:text-5xl font-bold text-stone-900 mb-6">
            Because Great Coffee <br /> Should Speak Clearly
          </h2>
          <p className="text-xl text-stone-600 leading-relaxed mb-10">
            Dark roasting masks origin. Our approach allows the coffee’s true identity to remain intact—from 
            the land it was grown on to the cup in your hand. Bright, floral, and aromatic.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-stone-950 hover:bg-stone-800 text-white rounded-full px-12 h-14 text-lg"
          >
            <Link href="/shop">Explore the Collection</Link>
          </Button>
        </Container>
      </section>
    </div>
  );
};

export default RoastingClient;