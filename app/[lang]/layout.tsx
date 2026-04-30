import { ReactNode } from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { UserDataProvider } from "@/contexts/UserDataContext";
import "../globals.css";
import { i18n } from "@/i18n-config";

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
    template: "%s | Sheba Cup Coffee",
    default: "Sheba Cup Coffee - Premium Coffee & Essentials",
  },
  description:
    "Discover premium coffee, accessories, and curated essentials from Sheba Cup Coffee with exceptional quality and service.",
  keywords: [
    "specialty coffee",
    "single-origin coffee",
    "coffee beans",
    "coffee brewing",
    "espresso",
    "coffee accessories",
    "fresh roast",
    "coffee shop",
    "Sheba Cup Coffee",
  ],
  authors: [{ name: "Sheba Cup Coffee" }],
  creator: "Sheba Cup Coffee",
  publisher: "Sheba Cup Coffee",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Sheba Cup Coffee",
    title: "Sheba Cup Coffee - Premium Coffee & Essentials",
    description:
      "Discover premium coffee, accessories, and curated essentials from Sheba Cup Coffee.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sheba Cup Coffee Online Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sheba Cup Coffee - Premium Coffee & Essentials",
    description:
      "Discover premium coffee, accessories, and curated essentials from Sheba Cup Coffee.",
    images: ["/og-image.jpg"],
    creator: "@shebascoffee",
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

  return (
    <ClerkProvider>
      <html lang={lang} suppressHydrationWarning>
        <body
          className={`${poppins.variable} ${raleway.variable} ${opensans.variable} antialiased`}
        >
          <UserDataProvider>{children}</UserDataProvider>
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
