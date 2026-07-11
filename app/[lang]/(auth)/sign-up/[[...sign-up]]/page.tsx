"use client";

import { SignUp } from "@clerk/nextjs";
import { motion } from "motion/react";
import Link from "next/link";
import { useLocalizedPath } from "@/hooks/useLocale";
import Logo from "@/components/common/Logo";
import {
  ArrowLeft,
  Gift,
  ShoppingBag,
  Truck,
  CreditCard,
  Loader2,
} from "lucide-react";
import { contactConfig } from "@/config/contact";
import Container from "@/components/Container";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";

const SignUpContent = () => {
  const searchParams = useSearchParams();
  const toLocalizedPath = useLocalizedPath();
  const dictionary = useDictionary();
  const redirectTo = searchParams.get("redirectTo");
  const company = contactConfig.company.name;

  const benefits = [
    {
      icon: Gift,
      title: t(
        dictionary,
        "authPages.signUp.benefits.welcome.title",
        "Welcome Bonus",
      ),
      description: t(
        dictionary,
        "authPages.signUp.benefits.welcome.description",
        "Get 10% off your first order when you sign up",
      ),
    },
    {
      icon: ShoppingBag,
      title: t(
        dictionary,
        "authPages.signUp.benefits.deals.title",
        "Exclusive Deals",
      ),
      description: t(
        dictionary,
        "authPages.signUp.benefits.deals.description",
        "Access member-only discounts and early sales",
      ),
    },
    {
      icon: Truck,
      title: t(
        dictionary,
        "authPages.signUp.benefits.shipping.title",
        "Free Shipping",
      ),
      description: t(
        dictionary,
        "authPages.signUp.benefits.shipping.description",
        "Enjoy free shipping on orders over $50",
      ),
    },
    {
      icon: CreditCard,
      title: t(
        dictionary,
        "authPages.signUp.benefits.payments.title",
        "Secure Payments",
      ),
      description: t(
        dictionary,
        "authPages.signUp.benefits.payments.description",
        "Multiple payment options with bank-level security",
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-shop_orange/5 via-shop_light_bg to-shop_light_pink/60 relative overflow-hidden">
      <Container>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(251,108,8,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(59,156,60,0.08)_0%,transparent_50%),radial-gradient(circle_at_60%_80%,rgba(252,240,228,0.4)_0%,transparent_50%)]"></div>

        <header className="relative z-10 px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              href={toLocalizedPath("/")}
              className="flex items-center gap-2 text-shop_dark_green hover:text-shop_light_green transition-colors duration-200 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">
                {t(dictionary, "authPages.backToHome", "Back to Home")}
              </span>
            </Link>
            <Logo />
          </div>
        </header>

        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-120px)]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12"
          >
            <div className="max-w-md mx-auto lg:max-w-lg lg:mx-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h1 className="text-3xl sm:text-4xl font-bold text-shop_dark_green mb-4">
                  {t(
                    dictionary,
                    "authPages.signUp.title",
                    "Join {company}",
                  ).replace("{company}", company)}
                </h1>
                <p className="text-lg text-dark-text mb-8 leading-relaxed">
                  {t(
                    dictionary,
                    "authPages.signUp.description",
                    "Create your account today and unlock exclusive benefits, personalized recommendations, and seamless shopping experiences.",
                  )}
                </p>
              </motion.div>

              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="p-2 bg-shop_orange/10 rounded-lg flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-shop_orange" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-shop_dark_green mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-dark-text">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-8 p-6 bg-white/85 backdrop-blur-md rounded-xl border border-shop_orange/20 shadow-sm"
              >
                <div className="text-center">
                  <p className="text-sm text-dark-text mb-3">
                    <strong className="text-shop_dark_green text-base">
                      {t(
                        dictionary,
                        "authPages.signUp.trustCustomers",
                        "Trusted by 50,000+ customers",
                      )}
                    </strong>
                  </p>
                  <div className="flex justify-center items-center gap-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-5 h-5 text-yellow-400 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-dark-text font-medium">
                      {t(
                        dictionary,
                        "authPages.signUp.trustRating",
                        "4.8/5 average rating",
                      )}
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="mt-6 text-center"
              >
                <p className="text-sm text-dark-text">
                  {t(
                    dictionary,
                    "authPages.questionsPrompt",
                    "Questions? Contact us at",
                  )}{" "}
                  <a
                    href={`mailto:${contactConfig.emails.support}`}
                    className="text-shop_light_green hover:text-shop_dark_green font-medium transition-colors duration-200"
                  >
                    {contactConfig.emails.support}
                  </a>
                </p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12"
          >
            <div className="w-full max-w-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100/50 p-8"
              >
                <div className="clerk-sign-up">
                  <SignUp
                    signInUrl={`/sign-in${
                      redirectTo
                        ? `?redirectTo=${encodeURIComponent(redirectTo)}`
                        : ""
                    }`}
                    forceRedirectUrl={redirectTo || "/user/dashboard"}
                    fallbackRedirectUrl={redirectTo || "/user/dashboard"}
                  />
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    {t(
                      dictionary,
                      "authPages.signUp.hasAccount",
                      "Already have an account?",
                    )}{" "}
                    <Link
                      href={`/sign-in${
                        redirectTo
                          ? `?redirectTo=${encodeURIComponent(redirectTo)}`
                          : ""
                      }`}
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                    >
                      {t(
                        dictionary,
                        "authPages.signUp.signInLink",
                        "Sign in here",
                      )}
                    </Link>
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Container>
    </div>
  );
};

const SignUpPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-shop_orange" />
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
};

export default SignUpPage;
