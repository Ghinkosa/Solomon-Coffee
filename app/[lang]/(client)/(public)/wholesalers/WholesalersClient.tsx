"use client";

import { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Coffee,
  ExternalLink,
  Loader2,
  Mail,
  MessageCircle,
  Send,
  Store,
  Truck,
} from "lucide-react";
import Container from "@/components/Container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactConfig } from "@/config/contact";

interface FormData {
  name: string;
  email: string;
  businessName: string;
  phone: string;
  businessType: string;
  estimatedOrderQuantity: string;
  message: string;
}

interface WholesalersClientProps {
  dictionary: {
    wholesalers: {
      hero: { badge: string; title: string; description: string };
      info: {
        title: string;
        salesTitle: string;
        quickResponse: string;
        quickResponseText: string;
      };
      benefits: {
        items: Array<{ title: string; description: string }>;
      };
      form: {
        title: string;
        subtitle: string;
        name: string;
        namePlaceholder: string;
        email: string;
        emailPlaceholder: string;
        businessName: string;
        businessNamePlaceholder: string;
        phone: string;
        phonePlaceholder: string;
        businessType: string;
        businessTypePlaceholder: string;
        estimatedOrderQuantity: string;
        estimatedOrderQuantityPlaceholder: string;
        message: string;
        messagePlaceholder: string;
        sendButton: string;
        sending: string;
        successTitle: string;
        successMessage: string;
        close: string;
        privacyNote: string;
      };
      faq: {
        title: string;
        description: string;
        questions: Array<{ q: string; a: string }>;
      };
    };
  };
}

const benefitIcons = [Coffee, Truck, Building2, Store];
const benefitStyles = [
  { color: "text-shop_dark_green", bgColor: "bg-shop_dark_green/10" },
  { color: "text-shop_light_green", bgColor: "bg-shop_light_green/10" },
  { color: "text-shop_orange", bgColor: "bg-shop_orange/10" },
  { color: "text-purple-600", bgColor: "bg-purple-600/10" },
];

const WholesalersClient = ({ dictionary }: WholesalersClientProps) => {
  const t = dictionary.wholesalers;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    businessName: "",
    phone: "",
    businessType: "",
    estimatedOrderQuantity: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/wholesalers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          businessName: "",
          phone: "",
          businessType: "",
          estimatedOrderQuantity: "",
          message: "",
        });
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const programInfo = [
    {
      icon: Mail,
      title: t.info.salesTitle,
      details: contactConfig.emails.sales,
      subDetails: contactConfig.responseTime.standard,
      color: "text-shop_orange",
      bgColor: "bg-shop_orange/10",
      href: `mailto:${contactConfig.emails.sales}`,
    },
    ...t.benefits.items.map((item, index) => {
      const Icon = benefitIcons[index % benefitIcons.length];
      const style = benefitStyles[index % benefitStyles.length];
      return {
        icon: Icon,
        title: item.title,
        details: item.description,
        subDetails: "",
        color: style.color,
        bgColor: style.bgColor,
        href: undefined as string | undefined,
      };
    }),
  ];

  return (
    <motion.div className="min-h-screen bg-linear-to-b from-shop_light_bg to-white">
      {/* Hero — matches Contact page */}
      <Container className="py-8 sm:py-12">
        <Card className="border-0 bg-gradient-to-r from-shop_dark_green to-shop_light_green text-white shadow-xl overflow-hidden">
          <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
                {t.hero.badge}
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                {t.hero.title}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                {t.hero.description}
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </Container>

      <Container className="px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Program details sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-shop_dark_green mb-6">
                {t.info.title}
              </h2>

              <div className="space-y-6">
                {programInfo.map((info, index) => (
                  <motion.div
                    key={info.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className="flex items-start gap-4"
                  >
                    <div className={`p-3 rounded-lg ${info.bgColor}`}>
                      <info.icon className={`w-5 h-5 ${info.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-shop_dark_green mb-1">
                        {info.title}
                      </h3>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-dark-text text-sm mb-1 hover:text-shop_dark_green transition-colors duration-200 flex items-center gap-1 group"
                        >
                          {info.details}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </a>
                      ) : (
                        <p className="text-dark-text text-sm leading-relaxed">
                          {info.details}
                        </p>
                      )}
                      {info.subDetails ? (
                        <p className="text-light-text text-xs mt-1">
                          {info.subDetails}
                        </p>
                      ) : null}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-shop_light_pink rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-shop_dark_green" />
                  <h4 className="font-semibold text-shop_dark_green">
                    {t.info.quickResponse}
                  </h4>
                </div>
                <p className="text-sm text-dark-text">
                  {t.info.quickResponseText}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Inquiry form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-shop_dark_green mb-2">
                {t.form.title}
              </h2>
              <p className="text-dark-text mb-6">{t.form.subtitle}</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-shop_dark_green font-medium"
                    >
                      {t.form.name} *
                    </Label>
                    <Input
                      disabled={loading}
                      type="text"
                      id="name"
                      name="name"
                      placeholder={t.form.namePlaceholder}
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="h-12 focus:border-shop_light_green focus:ring-shop_light_green/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-shop_dark_green font-medium"
                    >
                      {t.form.email} *
                    </Label>
                    <Input
                      disabled={loading}
                      type="email"
                      id="email"
                      name="email"
                      placeholder={t.form.emailPlaceholder}
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="h-12 focus:border-shop_light_green focus:ring-shop_light_green/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-shop_dark_green font-medium">
                      {t.form.businessName}
                    </Label>
                    <Input
                      disabled={loading}
                      type="text"
                      id="businessName"
                      name="businessName"
                      placeholder={t.form.businessNamePlaceholder}
                      value={formData.businessName}
                      onChange={handleChange}
                      className="h-12 focus:border-shop_light_green focus:ring-shop_light_green/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-shop_dark_green font-medium">
                      {t.form.phone}
                    </Label>
                    <Input
                      disabled={loading}
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder={t.form.phonePlaceholder}
                      value={formData.phone}
                      onChange={handleChange}
                      className="h-12 focus:border-shop_light_green focus:ring-shop_light_green/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType" className="text-shop_dark_green font-medium">
                      {t.form.businessType}
                    </Label>
                    <select
                      id="businessType"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      disabled={loading}
                      className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-shop_light_green focus:ring-shop_light_green/20"
                    >
                      <option value="">{t.form.businessTypePlaceholder}</option>
                      <option value="cafe">Café</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="hotel">Hotel / Hospitality</option>
                      <option value="retail">Retail</option>
                      <option value="office">Office</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedOrderQuantity" className="text-shop_dark_green font-medium">
                      {t.form.estimatedOrderQuantity}
                    </Label>
                    <Input
                      disabled={loading}
                      type="text"
                      id="estimatedOrderQuantity"
                      name="estimatedOrderQuantity"
                      placeholder={t.form.estimatedOrderQuantityPlaceholder}
                      value={formData.estimatedOrderQuantity}
                      onChange={handleChange}
                      className="h-12 focus:border-shop_light_green focus:ring-shop_light_green/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-shop_dark_green font-medium">
                    {t.form.message}
                  </Label>
                  <Textarea
                    disabled={loading}
                    id="message"
                    name="message"
                    placeholder={t.form.messagePlaceholder}
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="focus:border-shop_light_green focus:ring-shop_light_green/20"
                  />
                </div>

                <p className="text-xs text-light-text">{t.form.privacyNote}</p>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <AlertCircle className="shrink-0 w-5 h-5 text-red-600" />
                      <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-shop_dark_green hover:bg-shop_light_green text-white h-12 px-8 font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t.form.sending}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {t.form.sendButton}
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* FAQ — matches Contact page */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-shop_dark_green mb-4">
              {t.faq.title}
            </h2>
            <p className="text-dark-text max-w-xl mx-auto">
              {t.faq.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {t.faq.questions.map((faq, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
              >
                <h3 className="font-semibold text-shop_dark_green mb-2">
                  {faq.q}
                </h3>
                <p className="text-dark-text text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </Container>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4"
            onClick={() => setSuccess(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                    stiffness: 200,
                    damping: 10,
                  }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-shop_dark_green mb-2">
                  {t.form.successTitle}
                </h3>
                <p className="text-dark-text mb-6">{t.form.successMessage}</p>
                <Button
                  onClick={() => setSuccess(false)}
                  className="w-full bg-shop_dark_green hover:bg-shop_light_green text-white h-12 font-semibold rounded-lg transition-all duration-300"
                >
                  {t.form.close}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WholesalersClient;
