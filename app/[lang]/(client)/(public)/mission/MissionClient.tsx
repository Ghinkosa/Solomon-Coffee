"use client";

import { motion } from "framer-motion";
import {
  Heart,
  HandHelping,
  Users,
  Coffee,
  GraduationCap,
  Leaf,
  ArrowRight,
} from "lucide-react";

import Container from "@/components/Container";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import Image from "next/image";

const MissionClient = () => {
  return (
    <div className="bg-gradient-to-b from-stone-100 to-white min-h-screen">
      {/* HERO SECTION - Behind the Coffee / Our Mission */}
      <section className="py-32 bg-stone-950 text-white relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=2000"
          alt="Sheba Cup Coffee - Coffee with a Purpose"
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
              Behind the Coffee
            </Badge>
            <h1 className="text-6xl lg:text-8xl font-bold mb-8 leading-tight tracking-tight">
              Coffee With <br /> <span className="text-amber-500">A Purpose</span>
            </h1>
            <p className="text-xl lg:text-2xl text-stone-300 max-w-3xl mx-auto leading-relaxed font-light">
              At Sheba Cup Coffee, our mission goes beyond coffee. Every bag you buy 
              supports lifesaving care for children battling cancer in Ethiopia.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* OUR MISSION SECTION - Mathiwos Wondu Foundation */}
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
                  src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=1200"
                  alt="Supporting childhood cancer care in Ethiopia"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 to-transparent" />
              </div>
              <div className="relative h-60 rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1488521787991-1111b9b6b7a6?auto=format&fit=crop&q=80&w=800"
                  alt="Children receiving care"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-60 rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800"
                  alt="Community health support"
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
                Our Mission: <br />
                <span className="text-amber-700">Lifesaving Care</span>
              </h2>
              <div className="space-y-6 text-lg text-stone-600 leading-relaxed">
                <p>
                  Every bag you buy supports lifesaving care. A portion of each sale goes to the 
                  <Link href="#" className="text-amber-700 font-medium hover:underline mx-1">
                    Mathiwos Wondu Foundation Ethiopia
                  </Link>
                  , an organization focused on childhood cancer care.
                </p>
                <p>
                  Your purchase helps provide screenings, treatment support, and care for families.
                </p>
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 my-6">
                  <p className="text-amber-800 font-serif text-xl italic text-center">
                    "One bag of coffee helps fund lifesaving support."
                  </p>
                </div>
                <p className="font-medium text-stone-800">
                  Sheba Cup Coffee stands for great coffee with a purpose.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  {[
                    { icon: Heart, text: "Childhood Cancer Care" },
                    { icon: HandHelping, text: "Treatment Support" },
                    { icon: Users, text: "Family Care" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl">
                      <item.icon className="w-5 h-5 text-amber-600" />
                      <span className="text-stone-800 font-medium text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* OUR VISION SECTION - Farm to Cup + 30 Years Experience */}
      <section className="py-24 bg-stone-900 text-white">
        <Container className="max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <Badge className="mb-6 bg-amber-600/20 border-amber-600/50 text-amber-400 hover:bg-amber-600/30">
                Behind the Name
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight">
                Our Vision: <br />
                <span className="text-amber-400">From Farm to Cup</span>
              </h2>
              <div className="space-y-6 text-lg text-stone-300 leading-relaxed">
                <p>
                  Sheba Cup Coffee brings authentic organic Ethiopian specialty Arabica coffee 
                  from farm to cup across the world.
                </p>
                <p>
                  Our family holds more than 30 years of coffee farming experience. We work directly 
                  with <span className="text-amber-400 font-medium">Birbirsa Coffee Farm</span> and{" "}
                  <span className="text-amber-400 font-medium">Shakicha Coffee Farm</span>. These 
                  partnerships support quality, sustainable farming, and Ethiopia's coffee heritage.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-700">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Coffee className="text-amber-400" size={28} />
                      <h3 className="font-serif text-xl">Organic & Sustainable</h3>
                    </div>
                    <p className="text-sm text-stone-400 pl-11">
                      Authentic Ethiopian specialty Arabica
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="text-amber-400" size={28} />
                      <h3 className="font-serif text-xl">Community Growth</h3>
                    </div>
                    <p className="text-sm text-stone-400 pl-11">
                      Education & development programs
                    </p>
                  </div>
                </div>
                <div className="bg-stone-800/50 p-6 rounded-2xl border border-stone-700 mt-6">
                  <p className="text-stone-200 italic leading-relaxed">
                    Our goal reaches beyond coffee. Growth from our business supports education and 
                    development programs for women and children, helping build stronger communities 
                    for the next generation.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4 order-1 lg:order-2"
            >
              <div className="col-span-2 relative h-80 rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=1200"
                  alt="Birbirsa Coffee Farm - Ethiopian coffee farming"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex gap-2 justify-center flex-wrap">
                  <span className="px-3 py-1 bg-amber-600 text-white text-xs rounded-full">30+ Years</span>
                  <span className="px-3 py-1 bg-amber-600 text-white text-xs rounded-full">Birbirsa Farm</span>
                  <span className="px-3 py-1 bg-amber-600 text-white text-xs rounded-full">Shakicha Farm</span>
                </div>
              </div>
              <div className="relative h-60 rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1462917882517-150d6b6e5ed1?auto=format&fit=crop&q=80&w=800"
                  alt="Sustainable coffee farming practices"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-60 rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?auto=format&fit=crop&q=80&w=800"
                  alt="Ethiopian coffee heritage"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* IMPACT HIGHLIGHTS */}
      <section className="py-24 bg-white">
        <Container className="max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-100 text-amber-700 hover:bg-amber-100">Our Impact</Badge>
            <h2 className="text-4xl font-bold text-stone-900">Making a Difference Together</h2>
            <p className="text-stone-500 mt-4 max-w-2xl mx-auto">
              Every purchase directly supports vital programs in Ethiopia
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Childhood Cancer Care */}
            <Card className="border-none shadow-xl bg-white overflow-hidden group">
              <div className="h-48 relative bg-gradient-to-br from-amber-600 to-amber-800">
                <Heart className="absolute inset-0 m-auto w-20 h-20 text-white/30" />
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-stone-900">Childhood Cancer Care</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Supporting the Mathiwos Wondu Foundation Ethiopia in providing critical 
                  screenings, treatment support, and care for children and their families 
                  battling cancer.
                </p>
              </CardContent>
            </Card>

            {/* Education Programs */}
            <Card className="border-none shadow-xl bg-white overflow-hidden group">
              <div className="h-48 relative bg-gradient-to-br from-stone-700 to-stone-900">
                <GraduationCap className="absolute inset-0 m-auto w-20 h-20 text-white/30" />
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-stone-900">Education for All</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Funding development programs that provide educational opportunities for 
                  women and children, helping build stronger communities for the next generation.
                </p>
              </CardContent>
            </Card>

            {/* Sustainable Farming */}
            <Card className="border-none shadow-xl bg-white overflow-hidden group">
              <div className="h-48 relative bg-gradient-to-br from-amber-700 to-stone-800">
                <Leaf className="absolute inset-0 m-auto w-20 h-20 text-white/30" />
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-stone-900">Sustainable Future</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Direct partnerships with Birbirsa and Shakicha Coffee Farms ensure quality, 
                  sustainable farming practices that honor Ethiopia's rich coffee heritage.
                </p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* Mathiwos Wondu Foundation Info Section */}
      <section className="py-24 bg-stone-50">
        <Container className="max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">About Mathiwos Wondu Foundation</h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto"></div>
          </div>
          <Card className="border-none shadow-xl overflow-hidden">
            <div className="h-64 relative">
              <Image
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1200"
                alt="Mathiwos Wondu Foundation Ethiopia"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <h3 className="text-3xl font-bold text-white text-center px-4">Mathiwos Wondu Foundation Ethiopia</h3>
              </div>
            </div>
            <CardContent className="p-8">
              <p className="text-stone-700 leading-relaxed mb-4">
                The Mathiwos Wondu Foundation is dedicated to improving childhood cancer care in Ethiopia. 
                Through screenings, treatment support, and family care programs, they provide critical 
                assistance to children and families battling cancer.
              </p>
              <p className="text-stone-700 leading-relaxed">
                Sheba Cup Coffee is proud to partner with this incredible organization, donating a portion 
                of every sale to support their lifesaving work.
              </p>
              <div className="mt-6 text-center">
                <Button
                  asChild
                  variant="outline"
                  className="border-amber-600 text-amber-700 hover:bg-amber-50 rounded-full"
                >
                  <Link href="#">Learn More About Mathiwos Wondu Foundation</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </Container>
      </section>

      {/* CALL TO ACTION - Link to Roasting Page */}
      <section className="py-24 text-center bg-gradient-to-r from-amber-50 to-stone-100">
        <Container className="max-w-4xl">
          <h2 className="text-4xl lg:text-5xl font-bold text-stone-900 mb-6">
            Great Coffee <br /> With an Even Greater Purpose
          </h2>
          <p className="text-xl text-stone-600 leading-relaxed mb-10">
            Every cup you enjoy helps provide lifesaving care, education, and hope 
            for communities in Ethiopia. Join us in making a difference, one bag at a time.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-amber-700 hover:bg-amber-800 text-white rounded-full px-12 h-14 text-lg"
            >
              <Link href="/shop">Shop Coffee, Make an Impact</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-stone-300 text-stone-700 hover:bg-stone-100 rounded-full px-12 h-14 text-lg"
            >
              <Link href="/roasting">Discover Our Roasting Process →</Link>
            </Button>
          </div>
          <p className="mt-8 text-stone-500 text-sm">
            Learn how we bring authentic Ethiopian farm flavor into every cup
          </p>
        </Container>
      </section>
    </div>
  );
};

export default MissionClient;