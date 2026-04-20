"use client";

import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

const AuthLoading = () => {
  const params = useParams();
  const lang = (params?.lang as string) || "en";

  const defaultLoadingData: Record<string, any> = {
    en: {
      title: "Loading Authentication...",
      description: "Please wait while we prepare your sign-in experience.",
    },
    it: {
      title: "Caricamento autenticazione...",
      description: "Attendi mentre prepariamo la tua esperienza di accesso.",
    },
    fr: {
      title: "Chargement de l'authentification...",
      description:
        "Veuillez patienter pendant que nous préparons votre expérience de connexion.",
    },
    hi: {
      title: "प्रमाणीकरण लोड हो रहा है...",
      description:
        "कृपया प्रतीक्षा करें जब हम आपके साइन-इन अनुभव को तैयार करते हैं।",
    },
    ar: {
      title: "جاري تحميل المصادقة...",
      description: "يرجى الانتظار بينما نجهز تجربة تسجيل الدخول الخاصة بك.",
    },
  };

  const t = defaultLoadingData[lang] || defaultLoadingData.en;

  return (
    <div className="min-h-screen bg-linear-to-br from-shop_light_bg via-white to-shop_light_pink flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-shop_dark_green animate-spin mx-auto mb-4" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-shop_light_green/30 rounded-full animate-pulse mx-auto"></div>
        </div>
        <h2 className="text-xl font-semibold text-shop_dark_green mb-2">
          {t.title}
        </h2>
        <p className="text-dark-text">{t.description}</p>
      </div>
    </div>
  );
};

export default AuthLoading;
