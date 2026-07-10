"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Mail,
  Phone,
  MessageSquare,
  Clock,
  ChevronRight,
  Search,
  ShoppingBag,
  CreditCard,
  Truck,
  RotateCcw,
  Shield,
  BookOpen,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useLocalizedPath } from "@/hooks/useLocale";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const helpCategoryMeta = [
  { icon: BookOpen, color: "from-shop_light_green to-shop_dark_green", hrefs: ["/faq#account-1", "/faq#shopping-1", "/faq#payment-1", "/faq#account-3"] },
  { icon: ShoppingBag, color: "from-shop_orange to-shop_light_orange", hrefs: ["/faq#shopping-1", "/faq#shopping-2", "/faq#shopping-3", "/faq#shopping-4"] },
  { icon: CreditCard, color: "from-light-blue to-dark-blue", hrefs: ["/faq#payment-1", "/faq#payment-2", "/faq#payment-3", "/faq#payment-4"] },
  { icon: Truck, color: "from-shop_light_green to-light-green", hrefs: ["/faq#shipping-1", "/faq#shipping-2", "/faq#shipping-3", "/faq#shipping-4"] },
  { icon: RotateCcw, color: "from-dark-red to-light-orange", hrefs: ["/faq#returns-1", "/faq#returns-2", "/faq#returns-3", "/faq#returns-4"] },
  { icon: Shield, color: "from-shop_dark_green to-shop_btn_dark_green", hrefs: ["/faq#account-1", "/faq#account-2", "/faq#account-3", "/faq#account-4"] },
];

const quickActionMeta = [
  { icon: Search, href: "/orders", color: "bg-shop_light_green" },
  { icon: MessageSquare, href: "/contact", color: "bg-shop_orange" },
  { icon: RotateCcw, href: "/orders", color: "bg-dark-blue" },
];

const supportChannelMeta = [
  { icon: MessageSquare, color: "border-shop_light_green text-shop_light_green hover:bg-shop_light_green" },
  { icon: Mail, href: "/contact", color: "border-shop_orange text-shop_orange hover:bg-shop_orange" },
  { icon: Phone, color: "border-dark-blue text-dark-blue hover:bg-dark-blue", phone: "+1 (555) 123-4567" },
];

interface HelpClientProps {
  dictionary: any;
}

const HelpClient = ({ dictionary }: HelpClientProps) => {
  const toLocalizedPath = useLocalizedPath();
  const page = dictionary?.helpPage ?? {};
  const hero = page.hero ?? {};
  const search = page.search ?? {};
  const quickActionsData = page.quickActions ?? {};
  const categoriesData = page.categories ?? {};
  const supportData = page.support ?? {};
  const resources = page.resources ?? {};

  const helpCategories = (categoriesData.items ?? []).map(
    (item: { title: string; description: string; links: string[] }, index: number) => ({
      ...item,
      ...helpCategoryMeta[index],
      links: (item.links ?? []).map((title: string, linkIndex: number) => ({
        title,
        href: helpCategoryMeta[index]?.hrefs?.[linkIndex] ?? "/faq",
      })),
    })
  );

  const quickActions = (quickActionsData.items ?? []).map(
    (item: { title: string; description: string; action: string }, index: number) => ({
      ...item,
      ...quickActionMeta[index],
    })
  );

  const supportChannels = (supportData.channels ?? []).map(
    (
      channel: { title: string; description: string; availability: string; response: string; action: string },
      index: number
    ) => ({
      ...channel,
      ...supportChannelMeta[index],
    })
  );

  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="bg-gradient-to-b from-shop_light_bg to-white min-h-screen">
      {/* Hero Banner Section */}
      <section className="py-20 bg-gradient-to-r from-shop_dark_green to-shop_light_green text-white">
        <Container className="max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              {hero.badge ?? "24/7 Support"}
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              {hero.title ?? "Help Center"}
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              {hero.description ??
                "Find answers, get support, and resolve issues quickly. We're here to help you enjoy the best coffee experience."}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Main Content */}
      <Container className="py-12 lg:py-16">
        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <Input
              type="text"
              placeholder={search.placeholder ?? "Search for help topics, orders, or issues..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 py-6 text-lg border-2 border-gray-200 focus:border-shop_light_green rounded-xl shadow-sm"
            />
            <Button
              className="absolute right-2 top-2 bg-shop_light_green hover:bg-shop_dark_green"
              size="lg"
            >
              {search.button ?? "Search"}
            </Button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-shop_dark_green mb-8 text-center">
            {quickActionsData.title ?? "Quick Actions"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action: { title: string; description: string; action: string; icon: typeof Search; href: string; color: string }, index: number) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  <Link href={action.href}>
                    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white/70 backdrop-blur-sm">
                      <CardContent className="p-6 text-center">
                        <div
                          className={`inline-flex items-center justify-center w-16 h-16 ${action.color} rounded-full mb-4`}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-shop_dark_green mb-2">
                          {action.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {action.description}
                        </p>
                        <Button
                          variant="outline"
                          className="border-shop_light_green text-shop_light_green hover:bg-shop_light_green hover:text-white"
                        >
                          {action.action}
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Help Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-shop_dark_green mb-8 text-center">
            {categoriesData.title ?? "Browse Help Topics"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category: { title: string; description: string; icon: typeof BookOpen; color: string; links: { title: string; href: string }[] }, index: number) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * index }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${category.color} rounded-lg mb-3`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-shop_dark_green">
                        {category.title}
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {category.links.map((link: { title: string; href: string }, linkIndex: number) => (
                        <Link
                          key={linkIndex}
                          href={link.href}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                        >
                          <span className="text-sm text-gray-700 group-hover:text-shop_dark_green">
                            {link.title}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-shop_light_green" />
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Support Channels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-shop_dark_green mb-8 text-center">
            {supportData.title ?? "Get Personal Support"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportChannels.map((channel: { title: string; description: string; availability: string; response: string; action: string; icon: typeof MessageSquare; color: string; href?: string }, index: number) => {
              const Icon = channel.icon;
              return (
                <motion.div
                  key={channel.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  <Card className="h-full text-center hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                      <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-4 mx-auto">
                        <Icon className="w-7 h-7 text-gray-600" />
                      </div>
                      <CardTitle className="text-shop_dark_green">
                        {channel.title}
                      </CardTitle>
                      <CardDescription className="mb-4">
                        {channel.description}
                      </CardDescription>
                      <div className="space-y-1">
                        <div className="text-sm text-gray-600">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {channel.availability}
                        </div>
                        <div className="text-sm text-gray-600">
                          {supportData.responseLabel ?? "Response:"} {channel.response}
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter>
                      <Link
                        href={channel.href || "/contact"}
                        className="w-full"
                      >
                        <Button
                          variant="outline"
                          className={`w-full ${channel.color} hover:text-white transition-all duration-200`}
                        >
                          {channel.action}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-shop_light_green to-shop_dark_green text-white shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">
                {resources.title ?? "Need More Help?"}
              </CardTitle>
              <CardDescription className="text-white/80">
                {resources.description ??
                  "Explore our comprehensive resources and documentation"}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <Link href={toLocalizedPath("/faq")}>
                  <Button
                    variant="secondary"
                    className="w-full bg-white text-shop_dark_green hover:bg-gray-100"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    {resources.viewFaq ?? "View FAQ"}
                  </Button>
                </Link>
                <Link href={toLocalizedPath("/contact")}>
                  <Button
                    variant="outline"
                    className="w-full border-white text-white hover:bg-white/10"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {resources.contactUs ?? "Contact Us"}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full border-white text-white hover:bg-white/10"
                >
                  <Video className="w-4 h-4 mr-2" />
                  {resources.videoGuides ?? "Video Guides"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </div>
  );
};
export default HelpClient;
