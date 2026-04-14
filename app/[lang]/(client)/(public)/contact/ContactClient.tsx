"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Container from "@/components/Container";
import { contactConfig } from "@/config/contact";
import {
  CheckCircle,
  Mail,
  MapPin,
  Phone,
  Clock,
  Send,
  MessageCircle,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactClientProps {
  dictionary: any;
}

const ContactClient = ({ dictionary }: ContactClientProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      console.error("Contact form error:", err);
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: dictionary.contact.info.visitUs,
      details: contactConfig.company.address,
      subDetails: contactConfig.company.city,
      color: "text-shop_dark_green",
      bgColor: "bg-shop_dark_green/10",
      href: `https://maps.google.com/?q=${encodeURIComponent(
        `${contactConfig.company.address}, ${contactConfig.company.city}`,
      )}`,
    },
    {
      icon: Phone,
      title: dictionary.contact.info.callUs,
      details: contactConfig.company.phone,
      subDetails: contactConfig.businessHours.weekday,
      color: "text-shop_light_green",
      bgColor: "bg-shop_light_green/10",
      href: `tel:${contactConfig.company.phone.replace(/\D/g, "")}`,
    },
    {
      icon: Mail,
      title: dictionary.contact.info.emailUs,
      details: contactConfig.emails.support,
      subDetails: contactConfig.responseTime.standard,
      color: "text-shop_orange",
      bgColor: "bg-shop_orange/10",
      href: `mailto:${contactConfig.emails.support}`,
    },
    {
      icon: Clock,
      title: dictionary.contact.info.businessHours,
      details: contactConfig.businessHours.weekday,
      subDetails: contactConfig.businessHours.weekend,
      color: "text-purple-600",
      bgColor: "bg-purple-600/10",
    },
  ];

  return (
    <div className="bg-linear-to-b from-shop_light_bg to-white min-h-screen">
      {/* Hero Banner Section */}
      <section className="py-20 bg-linear-to-r from-shop_dark_green to-shop_light_green text-white">
        <Container className="max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              {dictionary.contact.hero.badge}
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              {dictionary.contact.hero.title}
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              {dictionary.contact.hero.description}
            </p>
          </motion.div>
        </Container>
      </section>

      <Container className="px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-shop_dark_green mb-6">
                {dictionary.contact.info.title}
              </h2>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={index}
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
                          target={
                            info.href.startsWith("http") ? "_blank" : "_self"
                          }
                          rel={
                            info.href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                        >
                          {info.details}
                          {info.href.startsWith("http") && (
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          )}
                        </a>
                      ) : (
                        <p className="text-dark-text text-sm mb-1">
                          {info.details}
                        </p>
                      )}
                      <p className="text-light-text text-xs">
                        {info.subDetails}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Additional Info */}
              <div className="mt-8 p-4 bg-shop_light_pink rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-shop_dark_green" />
                  <h4 className="font-semibold text-shop_dark_green">
                    {dictionary.contact.info.quickResponse}
                  </h4>
                </div>
                <p className="text-sm text-dark-text">
                  {dictionary.contact.info.quickResponseText}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-shop_dark_green mb-6">
                {dictionary.contact.form.title}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-shop_dark_green font-medium"
                    >
                      {dictionary.contact.form.name} *
                    </Label>
                    <Input
                      disabled={loading}
                      type="text"
                      id="name"
                      name="name"
                      placeholder={dictionary.contact.form.namePlaceholder}
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
                      {dictionary.contact.form.email} *
                    </Label>
                    <Input
                      disabled={loading}
                      type="email"
                      id="email"
                      name="email"
                      placeholder={dictionary.contact.form.emailPlaceholder}
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="h-12 focus:border-shop_light_green focus:ring-shop_light_green/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="subject"
                    className="text-shop_dark_green font-medium"
                  >
                    {dictionary.contact.form.subject} *
                  </Label>
                  <Input
                    disabled={loading}
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder={dictionary.contact.form.subjectPlaceholder}
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="h-12 focus:border-shop_light_green focus:ring-shop_light_green/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="message"
                    className="text-shop_dark_green font-medium"
                  >
                    {dictionary.contact.form.message} *
                  </Label>
                  <Textarea
                    disabled={loading}
                    id="message"
                    name="message"
                    placeholder={dictionary.contact.form.messagePlaceholder}
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    required
                    className="resize-none focus:border-shop_light_green focus:ring-shop_light_green/20"
                  />
                </div>

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
                      {dictionary.contact.form.sending}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {dictionary.contact.form.sendButton}
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-shop_dark_green mb-4">
              {dictionary.contact.faq.title}
            </h2>
            <p className="text-dark-text max-w-xl mx-auto">
              {dictionary.contact.faq.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dictionary.contact.faq.questions.map((faq: any, index: number) => (
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

      {/* Success Modal */}
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
                  {dictionary.contact.form.successTitle}
                </h3>
                <p className="text-dark-text mb-6">
                  {dictionary.contact.form.successMessage}
                </p>
                <Button
                  onClick={() => setSuccess(false)}
                  className="w-full bg-shop_dark_green hover:bg-shop_light_green text-white h-12 font-semibold rounded-lg transition-all duration-300"
                >
                  {dictionary.contact.form.close}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactClient;
