"use client";

import { motion } from "motion/react";
import {
  Shield,
  Eye,
  Lock,
  Cookie,
  Database,
  UserCheck,
  AlertTriangle,
  Download,
  Trash2,
  Settings,
  Mail,
  Clock,
} from "lucide-react";
import Container from "@/components/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { useLocalizedPath } from "@/hooks/useLocale";

const privacyHighlightIcons = [Shield, Eye, UserCheck, Lock];
const privacyHighlightColors = [
  "text-shop_dark_green",
  "text-shop_light_green",
  "text-shop_orange",
  "text-shop_dark_green",
];
const dataTypeIcons = [UserCheck, Database, Eye, Settings];
const userRightIcons = [Download, Settings, Trash2, Mail];

interface PrivacyClientProps {
  dictionary: any;
}

const PrivacyClient = ({ dictionary }: PrivacyClientProps) => {
  const toLocalizedPath = useLocalizedPath();
  const page = dictionary?.privacyPage ?? {};
  const hero = page.hero ?? {};
  const highlights = page.highlights ?? {};
  const dataCollection = page.dataCollection ?? {};
  const policy = page.policy ?? {};
  const rights = page.rights ?? {};
  const contact = page.contact ?? {};
  const footer = page.footer ?? {};

  const privacyHighlights = (highlights.items ?? []).map(
    (item: { title: string; description: string }, index: number) => ({
      ...item,
      icon: privacyHighlightIcons[index],
      color: privacyHighlightColors[index],
    })
  );

  const dataTypes = (dataCollection.categories ?? []).map(
    (category: { category: string; items: string[] }, index: number) => ({
      ...category,
      icon: dataTypeIcons[index],
    })
  );

  const userRights = (rights.items ?? []).map(
    (right: { right: string; description: string; action: string }, index: number) => ({
      ...right,
      icon: userRightIcons[index],
    })
  );

  const policySections = policy.sections ?? [];

  return (
    <div className="bg-gradient-to-b from-shop_light_bg to-white min-h-screen">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-shop_dark_green to-shop_light_green text-white">
        <Container className="max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Shield className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              {hero.title ?? "Privacy Policy"}
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              {hero.description ??
                "Your privacy is fundamental to how we operate. Learn how we collect, use, and protect your personal information."}
            </p>
            <Badge className="mt-6 bg-white/20 text-white border-white/30">
              {hero.lastUpdated ?? "Last updated: January 2024"}
            </Badge>
          </motion.div>
        </Container>
      </section>

      {/* Privacy Highlights */}
      <section className="py-12 -mt-8">
        <Container className="max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-center text-shop_dark_green">
                  {highlights.title ?? "Our Privacy Commitments"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {privacyHighlights.map((item: { title: string; description: string; icon: typeof Shield; color: string }, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="text-center group"
                    >
                      <div className="p-3 bg-shop_light_green/10 rounded-lg w-fit mx-auto mb-3 group-hover:bg-shop_light_green/20 transition-colors">
                        <item.icon
                          className={`w-8 h-8 ${item.color} group-hover:scale-110 transition-transform`}
                        />
                      </div>
                      <h3 className="font-semibold text-shop_dark_green mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-dark-text">
                        {item.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </section>

      {/* Data Collection */}
      <section className="py-12">
        <Container className="max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-shop_light_green/10 text-shop_dark_green hover:bg-shop_light_green/20">
              {dataCollection.badge ?? "Data We Collect"}
            </Badge>
            <h2 className="text-3xl font-bold text-shop_dark_green mb-4">
              {dataCollection.title ?? "Types of Information We Process"}
            </h2>
            <p className="text-lg text-dark-text max-w-3xl mx-auto">
              {dataCollection.description ??
                "We collect different types of information to provide you with the best coffee shopping experience while respecting your privacy."}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {dataTypes.map((category: { category: string; items: string[]; icon: typeof UserCheck }, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-shop_dark_green">
                      <div className="p-2 bg-shop_light_green/10 rounded-lg">
                        <category.icon className="w-5 h-5 text-shop_light_green" />
                      </div>
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.items.map((item: string, itemIndex: number) => (
                        <li key={itemIndex} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-shop_light_green rounded-full mt-2 flex-shrink-0" />
                          <span className="text-dark-text text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Detailed Privacy Policy */}
      <section className="py-12 bg-shop_light_bg">
        <Container className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-shop_dark_green mb-4">
              {policy.title ?? "Detailed Privacy Policy"}
            </h2>
            <p className="text-lg text-dark-text">
              {policy.description ?? "Complete information about how we handle your data"}
            </p>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-4">
            {policySections.map(
              (
                section: {
                  id: string;
                  title: string;
                  intro: string;
                  items: string[];
                  footer?: string;
                },
                index: number
              ) => {
                const sectionIcons = [Database, Shield, Lock, Cookie];
                const SectionIcon = sectionIcons[index] ?? Database;
                return (
                  <AccordionItem key={section.id} value={section.id}>
                    <Card>
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-white/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <SectionIcon className="w-5 h-5 text-shop_light_green" />
                          <span className="text-lg font-semibold text-shop_dark_green">
                            {section.title}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <Separator className="mb-4" />
                        <div className="space-y-4 text-dark-text">
                          <p>{section.intro}</p>
                          <ul className="space-y-2 pl-4">
                            {(section.items ?? []).map((item: string, itemIndex: number) => (
                              <li key={itemIndex}>• {item}</li>
                            ))}
                          </ul>
                          {section.footer && <p className="mt-4">{section.footer}</p>}
                        </div>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                );
              }
            )}
          </Accordion>
        </Container>
      </section>

      {/* Your Rights */}
      <section className="py-16">
        <Container className="max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-shop_orange/10 text-shop_orange hover:bg-shop_orange/20">
              {rights.badge ?? "Your Privacy Rights"}
            </Badge>
            <h2 className="text-3xl font-bold text-shop_dark_green mb-4">
              {rights.title ?? "Control Your Data"}
            </h2>
            <p className="text-lg text-dark-text max-w-3xl mx-auto">
              {rights.description ??
                "You have the right to control how your personal information is collected, used, and shared. Here's what you can do:"}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {userRights.map((right: { right: string; description: string; action: string; icon: typeof Download }, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-2 bg-shop_light_green/10 rounded-lg group-hover:bg-shop_light_green/20 transition-colors">
                        <right.icon className="w-5 h-5 text-shop_light_green" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-shop_dark_green mb-2">
                          {right.right}
                        </h3>
                        <p className="text-dark-text text-sm mb-4">
                          {right.description}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-shop_light_green text-shop_light_green hover:bg-shop_light_green/5"
                        >
                          {right.action}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-shop_light_bg">
        <Container className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="text-center">
              <CardContent className="p-8">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-shop_orange" />
                <h3 className="text-2xl font-bold text-shop_dark_green mb-4">
                  {contact.title ?? "Privacy Questions or Concerns?"}
                </h3>
                <p className="text-dark-text mb-6 max-w-2xl mx-auto">
                  {contact.description ??
                    "Our privacy team is here to help you understand your rights and assist with any data-related requests or concerns."}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    className="bg-shop_dark_green hover:bg-shop_btn_dark_green"
                  >
                    <Link href={toLocalizedPath("/contact")}>
                      {contact.contactTeam ?? "Contact Privacy Team"}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-shop_light_green text-shop_light_green hover:bg-shop_light_green/5"
                  >
                    <Link href={toLocalizedPath("/faq")}>
                      {contact.privacyFaq ?? "Privacy FAQ"}
                    </Link>
                  </Button>
                </div>
                <p className="text-sm text-light-text mt-6">
                  {contact.emailPrefix ?? "Email us directly at"}{" "}
                  <a
                    href={`mailto:${contact.email ?? "privacy@shebascoffee.com"}`}
                    className="text-shop_light_green hover:underline"
                  >
                    {contact.email ?? "privacy@shebascoffee.com"}
                  </a>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </section>

      {/* Footer Note */}
      <section className="py-8 border-t border-gray-200">
        <Container className="max-w-4xl">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-shop_light_green" />
              <p className="text-sm text-light-text">
                {footer.lastUpdated ??
                  "This privacy policy was last updated on January 15, 2024"}
              </p>
            </div>
            <p className="text-xs text-light-text">
              {footer.notice ??
                "We may update this policy periodically. We'll notify you of significant changes via email or website notice."}
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default PrivacyClient;
