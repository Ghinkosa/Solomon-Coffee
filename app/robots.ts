import { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/seo";
import { i18n } from "@/i18n-config";

const PRIVATE_PATHS = [
  "/api/",
  "/admin/",
  "/employee/",
  "/user/",
  "/dashboard/",
  "/studio/",
  "/_next/",
  "/checkout/",
  "/cart/",
  "/sign-in",
  "/sign-up",
];

function localeDisallows(): string[] {
  const paths: string[] = [...PRIVATE_PATHS];
  for (const locale of i18n.locales) {
    for (const path of PRIVATE_PATHS) {
      // Skip /api and /_next — not under locale prefixes
      if (path === "/api/" || path === "/_next/") continue;
      paths.push(`/${locale}${path}`);
    }
  }
  return paths;
}

export default function robots(): MetadataRoute.Robots {
  const disallow = localeDisallows();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
