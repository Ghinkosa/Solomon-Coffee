"use client";

import { FormEvent, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Send,
  Store,
} from "lucide-react";
import Container from "../Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { translateGuestValidationError } from "@/lib/checkout-guest-validation-i18n";
import type { Dictionary } from "@/lib/dictionary-context";
import { cn } from "@/lib/utils";
import {
  formatPhoneInput,
  validateShippingAddressField,
} from "@/lib/shipping-address-validation";

interface FormData {
  name: string;
  email: string;
  businessName: string;
  phone: string;
  businessType: string;
  estimatedOrderQuantity: string;
  message: string;
}

interface ShopWholesaleSectionProps {
  dictionary: Dictionary;
}

const emptyForm: FormData = {
  name: "",
  email: "",
  businessName: "",
  phone: "",
  businessType: "",
  estimatedOrderQuantity: "",
  message: "",
};

const ShopWholesaleSection = ({ dictionary }: ShopWholesaleSectionProps) => {
  const t = (dictionary.wholesalers as {
    hero: { badge: string; title: string; description: string };
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
      privacyNote: string;
    };
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [showPhoneErrors, setShowPhoneErrors] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  const phoneValidationError = useMemo(
    () => validateShippingAddressField("phone", formData.phone),
    [formData.phone],
  );
  const phoneErrorMessage = translateGuestValidationError(
    dictionary,
    phoneValidationError,
  );
  const shouldShowPhoneError = Boolean(
    phoneValidationError && (showPhoneErrors || phoneTouched),
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    const nextValue = name === "phone" ? formatPhoneInput(value) : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    if (error) setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setShowPhoneErrors(true);

    if (phoneValidationError) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/wholesalers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData(emptyForm);
        setPhoneTouched(false);
        setShowPhoneErrors(false);
      } else if (data.field === "phone") {
        setShowPhoneErrors(true);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="wholesale" className="scroll-mt-24 bg-shop_light_bg border-t border-gray-200">
      <Container className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-shop_dark_green/10 px-4 py-1.5 text-sm font-medium text-shop_dark_green mb-4">
              <Store className="h-4 w-4" />
              {t.hero.badge}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-shop_dark_green mb-3">
              {t.hero.title}
            </h2>
            <p className="text-dark-text max-w-2xl mx-auto">{t.hero.description}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
            <h3 className="text-xl font-bold text-shop_dark_green mb-1">
              {t.form.title}
            </h3>
            <p className="text-dark-text text-sm mb-6">{t.form.subtitle}</p>

            {success ? (
              <div className="flex flex-col items-center text-center py-8">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-shop_dark_green mb-2">
                  {t.form.successTitle}
                </h4>
                <p className="text-dark-text max-w-md">{t.form.successMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="wholesale-name">{t.form.name} *</Label>
                    <Input
                      id="wholesale-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t.form.namePlaceholder}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wholesale-email">{t.form.email} *</Label>
                    <Input
                      id="wholesale-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t.form.emailPlaceholder}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wholesale-business">{t.form.businessName}</Label>
                    <Input
                      id="wholesale-business"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder={t.form.businessNamePlaceholder}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wholesale-phone">{t.form.phone}</Label>
                    <Input
                      id="wholesale-phone"
                      type="tel"
                      name="phone"
                      inputMode="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={() => setPhoneTouched(true)}
                      placeholder={t.form.phonePlaceholder}
                      disabled={loading}
                      aria-invalid={shouldShowPhoneError}
                      aria-describedby={
                        shouldShowPhoneError ? "wholesale-phone-error" : undefined
                      }
                      className={cn(
                        shouldShowPhoneError &&
                          "border-red-500 focus-visible:ring-red-500",
                      )}
                    />
                    {shouldShowPhoneError ? (
                      <p
                        id="wholesale-phone-error"
                        className="text-sm text-red-600"
                      >
                        {phoneErrorMessage}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wholesale-type">{t.form.businessType}</Label>
                    <select
                      id="wholesale-type"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      disabled={loading}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shop_light_green/20 focus-visible:border-shop_light_green"
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
                    <Label htmlFor="wholesale-quantity">
                      {t.form.estimatedOrderQuantity}
                    </Label>
                    <Input
                      id="wholesale-quantity"
                      name="estimatedOrderQuantity"
                      value={formData.estimatedOrderQuantity}
                      onChange={handleChange}
                      placeholder={t.form.estimatedOrderQuantityPlaceholder}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wholesale-message">{t.form.message}</Label>
                  <Textarea
                    id="wholesale-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t.form.messagePlaceholder}
                    rows={4}
                    disabled={loading}
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
                  className="bg-shop_dark_green hover:bg-shop_light_green text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t.form.sending}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {t.form.sendButton}
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default ShopWholesaleSection;
