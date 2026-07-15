"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const MESSAGES = {
  en: {
    title: "Something went wrong",
    description:
      "We hit an unexpected error while loading this page. Please try again.",
    retry: "Try again",
    home: "Back to home",
  },
  es: {
    title: "Algo salió mal",
    description:
      "Ocurrió un error inesperado al cargar esta página. Inténtalo de nuevo.",
    retry: "Reintentar",
    home: "Volver al inicio",
  },
  ar: {
    title: "حدث خطأ ما",
    description: "واجهنا خطأ غير متوقع أثناء تحميل هذه الصفحة. يرجى المحاولة مرة أخرى.",
    retry: "حاول مرة أخرى",
    home: "العودة إلى الرئيسية",
  },
} as const;

type Locale = keyof typeof MESSAGES;

export default function ClientError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const segment = pathname?.split("/")[1];
  const locale: Locale =
    segment === "es" || segment === "ar" ? segment : "en";
  const copy = MESSAGES[locale];

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold text-shop_dark_green">{copy.title}</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {copy.description}
      </p>
      <div className="mt-2 flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-shop_dark_green px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-shop_light_green"
        >
          {copy.retry}
        </button>
        <a
          href={`/${locale}`}
          className="rounded-lg border border-shop_dark_green/20 px-5 py-2.5 text-sm font-semibold text-shop_dark_green transition-colors hover:bg-shop_light_bg hover:text-shop_dark_green"
        >
          {copy.home}
        </a>
      </div>
    </div>
  );
}
