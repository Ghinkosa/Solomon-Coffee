"use client";

import { motion } from "motion/react";
import {
  FileText,
  ShoppingCart,
  Shield,
  CreditCard,
  Truck,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Mail,
  Scale,
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

const quickLinkIcons = [ShoppingCart, CreditCard, Truck, Shield, Scale];
const sectionIcons = [
  CheckCircle2,
  ShoppingCart,
  CreditCard,
  Truck,
  Shield,
  AlertCircle,
  FileText,
  Scale,
];

interface TermsClientProps {
  dictionary: any;
}

const TermsClient = ({ dictionary }: TermsClientProps) => {
  const toLocalizedPath = useLocalizedPath();
  const page = dictionary?.termsPage ?? {};
  const hero = page.hero ?? {};
  const quickNav = page.quickNav ?? {};
  const contact = page.contact ?? {};
  const footer = page.footer ?? {};

  const quickLinks = (quickNav.links ?? []).map(
    (link: { title: string; href: string }, index: number) => ({
      ...link,
      icon: quickLinkIcons[index],
    })
  );

  const termsData = (page.sections ?? []).map(
    (section: { id: string; title: string; content: string[] }, index: number) => ({
      ...section,
      icon: sectionIcons[index] ?? FileText,
    })
  );

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
            <FileText className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              {hero.title ?? "Terms of Service"}
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              {hero.description ??
                "Please read these terms carefully before using our services. They outline your rights and responsibilities as a Sheba Cup Coffee user."}
            </p>
            <Badge className="mt-6 bg-white/20 text-white border-white/30">
              {hero.lastUpdated ?? "Last updated: January 2024"}
            </Badge>
          </motion.div>
        </Container>
      </section>

      {/* Quick Navigation */}
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
                  {quickNav.title ?? "Quick Navigation"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {quickLinks.map((link: { title: string; href: string; icon: typeof ShoppingCart }, index: number) => (
                    <motion.a
                      key={index}
                      href={link.href}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex flex-col items-center p-4 rounded-lg hover:bg-shop_light_green/5 transition-colors group"
                    >
                      <link.icon className="w-8 h-8 text-shop_light_green mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium text-center text-dark-text group-hover:text-shop_dark_green">
                        {link.title}
                      </span>
                    </motion.a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <Container className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            <Accordion type="single" collapsible className="space-y-4">
              {termsData.map((section: { id: string; title: string; content: string[]; icon: typeof CheckCircle2 }, index: number) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <AccordionItem value={section.id} id={section.id}>
                    <Card className="overflow-hidden">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-shop_light_bg/50 transition-colors">
                        <div className="flex items-center gap-4 text-left">
                          <div className="p-2 bg-shop_light_green/10 rounded-lg">
                            <section.icon className="w-5 h-5 text-shop_dark_green" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-shop_dark_green">
                              {index + 1}. {section.title}
                            </h3>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        <Separator className="mb-4" />
                        <div className="space-y-4">
                          {section.content.map((paragraph: string, pIndex: number) => (
                            <p
                              key={pIndex}
                              className="text-dark-text leading-relaxed"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
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
                <Mail className="w-12 h-12 mx-auto mb-4 text-shop_light_green" />
                <h3 className="text-2xl font-bold text-shop_dark_green mb-4">
                  {contact.title ?? "Questions About Our Terms?"}
                </h3>
                <p className="text-dark-text mb-6 max-w-2xl mx-auto">
                  {contact.description ??
                    "If you have any questions about these Terms of Service or need clarification on any section, our legal team is here to help."}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    className="bg-shop_dark_green hover:bg-shop_btn_dark_green"
                  >
                    <Link href={toLocalizedPath("/contact")}>
                      {contact.contactLegal ?? "Contact Legal Team"}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-shop_light_green text-shop_light_green hover:bg-shop_light_green/5"
                  >
                    <Link href={toLocalizedPath("/faq")}>
                      {contact.viewFaq ?? "View FAQ"}
                    </Link>
                  </Button>
                </div>
                <p className="text-sm text-light-text mt-6">
                  {contact.emailPrefix ?? "For immediate assistance, email us at"}{" "}
                  <a
                    href={`mailto:${contact.email ?? "legal@shebascoffee.com"}`}
                    className="text-shop_light_green hover:underline"
                  >
                    {contact.email ?? "legal@shebascoffee.com"}
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
              <Calendar className="w-4 h-4 text-shop_light_green" />
              <p className="text-sm text-light-text">
                {footer.lastUpdated ?? "These terms were last updated on January 15, 2024"}
              </p>
            </div>
            <p className="text-xs text-light-text">
              {footer.notice ??
                "By continuing to use Sheba Cup Coffee, you agree to the most current version of these terms."}
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default TermsClient;
