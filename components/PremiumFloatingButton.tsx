"use client";

import { useState } from "react";
import {
  Crown,
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface PremiumFloatingButtonProps {
  dictionary: any;
}

export default function PremiumFloatingButton({
  dictionary,
}: PremiumFloatingButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const upgradeUrl =
    process.env.NEXT_PUBLIC_PAID_VERSION ||
    "https://shebascoffee.com";

  // Fallback if dictionary is not loaded yet
  const t = dictionary?.premium || {
    title: "Go Premium",
    subtitle: "Unlock All Premium Features",
    cta: "Upgrade to Premium Now",
    tooltip: "Upgrade to Premium",
    footer: {
      oneTime: "One-time payment",
      lifetime: "Lifetime access",
      updates: "All updates included",
      secure: "Secure Payment",
      support: "Premium Support",
    },
    features: {},
  };

  const featuresList = [
    { icon: "�", key: "analytics" },
    { icon: "👥", key: "employees" },
    { icon: "�", key: "reviews" },
    { icon: "📬", key: "subscription" },
    { icon: "📈", key: "insights" },
    { icon: "📥", key: "export" },
    { icon: "🎨", key: "branding" },
    { icon: "🚀", key: "support" },
  ];

  const premiumFeatures = featuresList.map((item) => ({
    icon: item.icon,
    title: t.features?.[item.key]?.title || "",
    description: t.features?.[item.key]?.description || "",
  }));

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-60">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-20 right-0 w-[400px] max-w-[calc(100vw-2rem)] max-h-[85vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 ring-1 ring-black/5"
            >
              {/* Decorative Header Background */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-br from-violet-600 via-purple-600 to-indigo-600">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute inset-0 bg-linear-to-t from-white/10 to-transparent" />

                {/* Floating Shapes */}
                <motion.div
                  animate={{ y: [0, -10, 0], opacity: [0.5, 0.8, 0.5] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-4 right-8 w-16 h-16 bg-white/10 rounded-full blur-2xl"
                />
                <motion.div
                  animate={{ y: [0, 10, 0], opacity: [0.3, 0.6, 0.3] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="absolute bottom-4 left-8 w-24 h-24 bg-white/10 rounded-full blur-3xl"
                />
              </div>

              <div className="relative flex flex-col flex-1 overflow-hidden">
                {/* Close button */}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10 backdrop-blur-md"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="p-6 pt-24 pb-4 overflow-y-auto custom-scrollbar flex-1">
                  {/* Header Content */}
                  <div className="text-center mb-6 relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.1 }}
                      className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-xl flex items-center justify-center mb-4 relative z-10"
                    >
                      <Crown className="w-8 h-8 text-purple-600 fill-purple-100" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {t.title}
                    </h3>
                    <p className="text-sm font-medium text-purple-600 bg-purple-50 inline-block px-3 py-1 rounded-full border border-purple-100">
                      {t.subtitle}
                    </p>
                  </div>

                  {/* Features Scroll Area */}
                  <div className="space-y-3 pr-2 mb-6">
                    {premiumFeatures.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group"
                      >
                        <span className="text-xl bg-gray-50 w-10 h-10 flex items-center justify-center rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                          {feature.icon}
                        </span>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <h4 className="text-gray-900 font-semibold text-sm mb-0.5">
                            {feature.title}
                          </h4>
                          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                            {feature.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA Section */}
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <Link
                      href={upgradeUrl}
                      className="relative block w-full group overflow-hidden rounded-xl"
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-violet-600 to-indigo-600 transition-all duration-300 group-hover:scale-105" />
                      <div className="relative px-6 py-4 flex items-center justify-center gap-2 text-white font-bold text-sm">
                        <Zap className="w-4 h-4 fill-yellow-300 text-yellow-300 animate-pulse" />
                        <span>{t.cta}</span>
                        <Sparkles className="w-4 h-4 text-purple-200" />
                      </div>
                    </Link>

                    {/* Trust Badges */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-center gap-4 text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          {t.footer.oneTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          {t.footer.lifetime}
                        </span>
                      </div>

                      <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400 bg-gray-50 py-2 rounded-lg">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3 h-3" />
                          {t.footer.secure}
                        </span>
                        <span className="w-px h-3 bg-gray-300" />
                        <span>{t.footer.support}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimized Floating Button */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative group outline-none"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={t.tooltip}
        >
          {/* Outer glow */}
          <div className="absolute -inset-2 bg-purple-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative w-14 h-14 bg-linear-to-br from-violet-600 to-indigo-600 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center overflow-hidden border border-white/10">
            {/* Inner sheen effect */}
            <div className="absolute inset-0 bg-linear-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              {isExpanded ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Crown className="w-6 h-6 text-white fill-yellow-400" />
              )}
            </motion.div>
          </div>

          {/* Tooltip */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-xl opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none">
            {t.tooltip}
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        </motion.button>
      </div>
    </>
  );
}
