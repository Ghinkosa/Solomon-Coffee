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
  Star,
  ArrowRight,
} from "lucide-react";
import Container from "@/components/Container";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const AboutClient = () => {
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
              About Sheba&apos;s Coffee
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
      <section className="py-20">
        <Container className="max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-shop_light_green/10 text-shop_dark_green hover:bg-shop_light_green/20">
                Our Story
              </Badge>
              <h2 className="text-4xl font-bold text-shop_dark_green mb-6">
                Building a Better Coffee Experience
              </h2>
              <p className="text-lg text-dark-text mb-6 leading-relaxed">
                Founded with a simple mission: make great coffee approachable,
                consistent, and enjoyable for everyone. What started as a small
                team has grown into a trusted destination for coffee lovers.
              </p>
              <p className="text-lg text-dark-text mb-8 leading-relaxed">
                We believe every cup should feel intentional, not routine.
                That&apos;s why we carefully curate beans, partner with
                responsible producers, and continuously improve how we serve you.
              </p>
              <Button
                asChild
                className="bg-shop_dark_green hover:bg-shop_btn_dark_green"
              >
                <Link href="/contact">
                  Get in Touch <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-shop_light_green to-shop_dark_green rounded-2xl p-8 text-white">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <Star className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-semibold">Freshly Roasted</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <Shield className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-semibold">Trusted Service</p>
                  </div>
                </div>
                <blockquote className="text-lg italic">
                  &quot;Great coffee should be simple to discover, brew, and
                  enjoy every day.&quot;
                </blockquote>
                <p className="mt-4 font-semibold">- Sheba&apos;s Coffee Team</p>
              </div>
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
              Meet the Minds Behind Sheba&apos;s Coffee
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
                <Link href="/shop">
                  Start Shopping <ShoppingBag className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-white text-shop_dark_green hover:bg-white/90"
              >
                <Link href="/contact">
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
