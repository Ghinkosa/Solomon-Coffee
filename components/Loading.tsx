"use client";
import Logo from "./common/Logo";
import { motion } from "motion/react";
import { ShoppingBag, Package, Truck, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

import { useParams } from "next/navigation";

const Loading = ({ dictionary }: { dictionary?: any }) => {
  const params = useParams();
  const lang = (params?.lang as string) || "en";

  const defaultLoadingData: Record<string, any> = {
    en: {
      step1: "Preparing your coffee experience...",
      step2: "Loading products...",
      step3: "Setting up delivery options...",
      step4: "Almost ready!",
      description: "Please wait while we set up everything for you",
      complete: "Complete",
    },
    it: {
      step1: "Preparazione della tua esperienza caffè...",
      step2: "Caricamento prodotti...",
      step3: "Configurazione delle opzioni di consegna...",
      step4: "Quasi pronto!",
      description: "Attendi mentre configuriamo tutto per te",
      complete: "Completato",
    },
    fr: {
      step1: "Préparation de votre expérience café...",
      step2: "Chargement des produits...",
      step3: "Configuration des options de livraison...",
      step4: "Presque prêt !",
      description:
        "Veuillez patienter pendant que nous préparons tout pour vous",
      complete: "Terminé",
    },
    hi: {
      step1: "आपके कॉफी अनुभव की तैयारी हो रही है...",
      step2: "उत्पाद लोड हो रहे हैं...",
      step3: "डिलिवरी विकल्प सेट किए जा रहे हैं...",
      step4: "बस तैयार है!",
      description: "कृपया प्रतीक्षा करें जब हम आपके लिए सब कुछ सेट अप करते हैं",
      complete: "पूरा हुआ",
    },
    ar: {
      step1: "جاري تجهيز تجربة القهوة الخاصة بك...",
      step2: "جاري تحميل المنتجات...",
      step3: "جاري إعداد خيارات التوصيل...",
      step4: "أوشكنا على الانتهاء!",
      description: "يرجى الانتظار بينما نقوم بإعداد كل شيء لك",
      complete: "مكتمل",
    },
  };

  const t =
    dictionary?.loading?.main ||
    defaultLoadingData[lang] ||
    defaultLoadingData.en;

  const [currentStep, setCurrentStep] = useState(0);
  const [loadingText, setLoadingText] = useState(t.step1);

  const loadingSteps = [
    {
      icon: ShoppingBag,
      text: t.step1,
      color: "text-shop_dark_green",
    },
    {
      icon: Package,
      text: t.step2,
      color: "text-shop_light_green",
    },
    {
      icon: Truck,
      text: t.step3,
      color: "text-shop_orange",
    },
    {
      icon: CheckCircle,
      text: t.step4,
      color: "text-shop_light_green",
    },
  ];

  useEffect(() => {
    setLoadingText(loadingSteps[currentStep].text);
  }, [t, currentStep]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % loadingSteps.length);
    }, 1200);

    return () => clearInterval(interval);
  }, [loadingSteps.length]);

  const CurrentIcon = loadingSteps[currentStep].icon;

  return (
    <div className="fixed min-h-screen w-full bg-shop_light_bg left-0 top-0 flex items-center justify-center z-50">
      <div className="flex flex-col justify-center items-center gap-8 max-w-md mx-auto px-6">
        {/* Logo with enhanced animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Logo />
        </motion.div>

        {/* Progress Dots */}
        <div className="flex space-x-3">
          {loadingSteps.map((_, index) => (
            <motion.div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentStep
                  ? "bg-shop_orange shadow-lg"
                  : index < currentStep
                    ? "bg-shop_light_green"
                    : "bg-gray-300"
              }`}
              animate={{
                scale: index === currentStep ? [1, 1.3, 1] : 1,
                opacity: index <= currentStep ? 1 : 0.5,
              }}
              transition={{
                duration: 0.6,
                repeat: index === currentStep ? Infinity : 0,
                repeatDelay: 0.3,
              }}
            />
          ))}
        </div>

        {/* Main Loading Content */}
        <div className="text-center space-y-6">
          {/* Animated Icon */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div
              className={`p-4 rounded-full bg-white shadow-lg border-2 border-shop_light_green/20`}
            >
              <CurrentIcon
                className={`w-8 h-8 ${loadingSteps[currentStep].color}`}
                strokeWidth={2}
              />
            </div>
          </motion.div>

          {/* Loading Text */}
          <motion.div
            key={loadingText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="space-y-2"
          >
            <h2 className="text-xl font-semibold text-shop_dark_green">
              {loadingText}
            </h2>
            <p className="text-sm text-gray-600">{t.description}</p>
          </motion.div>

          {/* Progress Bar */}
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-shop_light_green to-shop_orange rounded-full"
              initial={{ width: "0%" }}
              animate={{
                width: `${((currentStep + 1) / loadingSteps.length) * 100}%`,
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
          </div>

          {/* Percentage */}
          <motion.p
            className="text-sm font-medium text-shop_dark_green"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {Math.round(((currentStep + 1) / loadingSteps.length) * 100)}%{" "}
            {t.complete}
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
