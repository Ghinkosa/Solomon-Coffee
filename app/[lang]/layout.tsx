import { ReactNode } from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { UserDataProvider } from "@/contexts/UserDataContext";
import PremiumFloatingButton from "@/components/PremiumFloatingButton";
import InitialVisitModal from "@/components/InitialVisitModal";
import "../globals.css";
import { getDictionary } from "@/lib/dictionary";
import { i18n, type Locale } from "@/i18n-config";

const poppins = localFont({
  src: "../fonts/Poppins.woff2",
  variable: "--font-poppins",
  weight: "400",
  preload: false,
});
const raleway = localFont({
  src: "../fonts/Raleway.woff2",
  variable: "--font-raleway",
  weight: "100 900",
});

const opensans = localFont({
  src: "../fonts/Open Sans.woff2",
  variable: "--font-open-sans",
  weight: "100 800",
});

import { BASE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: "%s | ShopCart - Premium Online Shopping",
    default: "ShopCart - Your Trusted Online Shopping Destination",
  },
  description:
    "Discover amazing products at ShopCart, your trusted online shopping destination for quality items and exceptional customer service. Shop electronics, fashion, home goods and more with fast delivery.",
  keywords: [
    "online shopping",
    "e-commerce",
    "buy online",
    "shop online",
    "electronics",
    "fashion",
    "home goods",
    "deals",
    "discounts",
    "ShopCart",
  ],
  authors: [{ name: "ShopCart" }],
  creator: "ShopCart",
  publisher: "ShopCart",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "ShopCart",
    title: "ShopCart - Your Trusted Online Shopping Destination",
    description:
      "Discover amazing products at ShopCart, your trusted online shopping destination for quality items and exceptional customer service.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ShopCart Online Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShopCart - Your Trusted Online Shopping Destination",
    description:
      "Discover amazing products at ShopCart, your trusted online shopping destination for quality items and exceptional customer service.",
    images: ["/og-image.jpg"],
    creator: "@shopcart",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    // Add other verification codes as needed
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  return (
    <ClerkProvider>
      <html lang={lang} suppressHydrationWarning>
        <body
          className={`${poppins.variable} ${raleway.variable} ${opensans.variable} antialiased`}
        >
          <UserDataProvider>{children}</UserDataProvider>
          <PremiumFloatingButton dictionary={dictionary} />
          <InitialVisitModal />
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: "#ffffff",
                color: "#1f2937",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
              },
              className: "sonner-toast",
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
