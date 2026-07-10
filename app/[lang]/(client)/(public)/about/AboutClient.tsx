"use client";

import { motion } from "motion/react";
import {
  Heart,
  Users,
  Award,
  ShoppingBag,
  Target,
  Globe,
  Zap,
  Shield,
  ArrowRight,
} from "lucide-react";
import Container from "@/components/Container";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLocalizedPath } from "@/hooks/useLocale";
import Image from "next/image";
import aboutUsHeadshot from "@/images/about-us-headshot.jpg";

const AboutClient = () => {
  const toLocalizedPath = useLocalizedPath();
  const stats = [
    { number: "10K+", label: "Happy Customers", icon: Users },
    { number: "500+", label: "Coffee Products", icon: ShoppingBag },
    { number: "50+", label: "Partner Producers", icon: Award },
    { number: "99%", label: "Satisfaction", icon: Heart },
  ];

  const values = [
    {
      icon: Target,
      title: "Customer First",
      description: "Every decision we make starts with coffee lovers in mind.",
      color: "text-shop_light_green",
    },
    {
      icon: Shield,
      title: "Coffee Quality",
      description: "Every roast is selected and tested to meet our standards.",
      color: "text-shop_dark_green",
    },
    {
      icon: Zap,
      title: "Craft & Innovation",
      description: "We blend tradition and modern brewing for better coffee.",
      color: "text-shop_orange",
    },
    {
      icon: Globe,
      title: "Sustainability",
      description:
        "Committed to responsible sourcing and eco-friendly packaging.",
      color: "text-shop_light_green",
    },
  ];

  const team = [
    {
      name: "Roastery Team",
      role: "Roast & Quality",
      image: "/images/team/ceo.jpg",
      description: "Crafting balanced roasts and consistent flavor profiles.",
    },
    {
      name: "Brew Education Team",
      role: "Brew Guidance",
      image: "/images/team/cto.jpg",
      description: "Helping customers brew better coffee at home and work.",
    },
    {
      name: "Customer Care Team",
      role: "Customer Support",
      image: "/images/team/design.jpg",
      description: "Providing friendly support from order to first sip.",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-shop_light_bg to-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-shop_dark_green to-shop_light_green text-white">
        <Container className="max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              Est. 2025
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              About Sheba Cup Coffee
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              We source, roast, and deliver premium coffee with exceptional
              service, practical brew education, and a deep focus on quality.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-16 -mt-10">
        <Container className="max-w-6xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6">
                    <stat.icon className="w-8 h-8 mx-auto mb-3 text-shop_light_green" />
                    <h3 className="text-3xl font-bold text-shop_dark_green mb-1">
                      {stat.number}
                    </h3>
                    <p className="text-dark-text font-medium">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Story Section */}
      <section className="relative overflow-hidden bg-[#faf8f5] py-20 lg:py-28">
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-shop_orange/5 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-shop_light_green/5 blur-3xl" />

        <Container className="relative max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-5"
            >
              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                <div className="absolute -inset-3 rounded-[1.75rem] bg-linear-to-br from-brand-gold/25 via-transparent to-shop_light_green/20" />

                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-shop_dark_green/10 bg-white shadow-[0_24px_60px_-20px_rgba(61,43,31,0.35)]">
                  <Image
                    src={aboutUsHeadshot}
                    alt="Sheba Cup Coffee founder"
                    fill
                    sizes="(max-width: 1024px) 90vw, 40vw"
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-shop_dark_green/35 via-transparent to-transparent" />
                </div>

                <div className="absolute -bottom-5 -right-2 max-w-[220px] rounded-xl border border-shop_dark_green/10 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm sm:-right-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-shop_light_green">
                    Family Heritage
                  </p>
                  <p className="mt-1 font-serif text-sm leading-snug text-shop_dark_green">
                    30+ years rooted in Ethiopian coffee
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-7"
            >
              <Badge className="mb-4 bg-shop_dark_green text-white hover:bg-shop_btn_dark_green">
                Our Story
              </Badge>

              <h2 className="mb-6 font-serif text-3xl leading-tight text-shop_dark_green md:text-4xl lg:text-5xl">
                From the Farms of Ethiopia
                <br />
                <span className="italic text-shop_orange">
                  to Our First Roastery in the United States
                </span>
              </h2>

              <div className="space-y-5 text-lg leading-relaxed text-dark-text">
                <p>Coffee has always been at the heart of our family story.</p>
                <p>
                  Our coffee story began in Ethiopia, where coffee is part of family,
                  culture, and daily life. For more than 30 years, our family has
                  worked with coffee from the farm level, growing, selecting, and
                  protecting the quality of Ethiopian Arabica coffee.
                </p>
                <p>
                  Our roots began in Sidamo, continued in Guji, and connect deeply to
                  Yirgacheffe, one of Ethiopia&apos;s most respected coffee regions.
                  These places shaped our family, our work, and our respect for
                  coffee.
                </p>
                <p>
                  Sheba Cup Coffee works directly with Birbirsa Coffee Farm. This
                  partnership helps us protect quality, support sustainable farming,
                  and keep our coffee traceable from farm to cup.
                </p>
                <p>
                  For many years, our family focused on farming, selecting, and
                  preparing green coffee. Roasting is our next step. From the New
                  York Metro area, Sheba Cup Coffee begins a new chapter by roasting
                  our family&apos;s Ethiopian coffee for the first time.
                </p>
                <p>
                  Sheba Cup Coffee was created to share authentic Ethiopian specialty
                  coffee while honoring the people, land, and history behind every
                  bean.
                </p>
                <p className="font-medium text-shop_dark_green">
                  Every bag carries our family story, our Ethiopian roots, and our
                  purpose to give back.
                </p>
              </div>

              <Button
                asChild
                className="mt-8 rounded-full bg-shop_dark_green px-6 hover:bg-shop_btn_dark_green"
              >
                <Link href={toLocalizedPath("/contact")}>
                  Get in Touch <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-shop_light_bg">
        <Container className="max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-shop_orange/10 text-shop_orange hover:bg-shop_orange/20">
              Our Values
            </Badge>
            <h2 className="text-4xl font-bold text-shop_dark_green mb-4">
              What We Stand For
            </h2>
            <p className="text-lg text-dark-text max-w-2xl mx-auto">
              These values guide how we source, roast, and serve coffee every
              day.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all group cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <value.icon
                      className={`w-12 h-12 mx-auto mb-4 ${value.color} group-hover:scale-110 transition-transform`}
                    />
                    <h3 className="text-xl font-bold text-shop_dark_green mb-3">
                      {value.title}
                    </h3>
                    <p className="text-dark-text leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <Container className="max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-shop_light_green/10 text-shop_dark_green hover:bg-shop_light_green/20">
              Leadership Team
            </Badge>
            <h2 className="text-4xl font-bold text-shop_dark_green mb-4">
              Meet the Minds Behind Sheba Cup Coffee
            </h2>
            <p className="text-lg text-dark-text max-w-2xl mx-auto">
              Our coffee-focused team works every day to deliver quality,
              consistency, and excellent support.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center hover:shadow-lg transition-all group">
                  <CardContent className="p-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-shop_light_green to-shop_dark_green rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold group-hover:scale-105 transition-transform">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <h3 className="text-xl font-bold text-shop_dark_green mb-1">
                      {member.name}
                    </h3>
                    <Badge className="mb-3 bg-shop_orange/10 text-shop_orange border-none">
                      {member.role}
                    </Badge>
                    <p className="text-dark-text text-sm leading-relaxed">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-shop_dark_green to-shop_light_green text-white">
        <Container className="max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-4">
              Ready to Experience the Difference?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust Sheba&apos;s
              Coffee for their daily brews and essentials.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-shop_dark_green hover:bg-white/90"
              >
                <Link href={toLocalizedPath("/shop")}>
                  Start Shopping <ShoppingBag className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-white text-shop_dark_green hover:bg-white/90"
              >
                <Link href={toLocalizedPath("/contact")}>
                  Contact Us <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  );
};

export default AboutClient;
