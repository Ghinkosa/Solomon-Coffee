import { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";
import { localizedUrl } from "@/lib/seo";
import { i18n } from "@/i18n-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await client.fetch(`
    *[_type == "product" && defined(slug.current)] {
      "slug": slug.current,
      _updatedAt
    }
  `);

  const categories = await client.fetch(`
    *[_type == "category" && defined(slug.current)] {
      "slug": slug.current,
      _updatedAt
    }
  `);

  const brands = await client.fetch(`
    *[_type == "brand" && defined(slug.current)] {
      "slug": slug.current,
      _updatedAt
    }
  `);

  const staticPaths = ["", "/shop", "/category", "/brands", "/blog"];

  const staticPages = i18n.locales.flatMap((locale) =>
    staticPaths.map((path) => {
      const changeFrequency: "daily" | "weekly" =
        path === "" || path === "/shop" ? "daily" : "weekly";

      return {
        url:
          path === ""
            ? localizedUrl("/", locale)
            : localizedUrl(path, locale),
        lastModified: new Date(),
        changeFrequency,
        priority: path === "" ? 1 : path === "/shop" ? 0.9 : 0.6,
      };
    }),
  );

  const productPages = i18n.locales.flatMap((locale) =>
    products.map((product: { slug: string; _updatedAt: string }) => ({
      url: localizedUrl(`/product/${product.slug}`, locale),
      lastModified: new Date(product._updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  );

  const categoryPages = i18n.locales.flatMap((locale) =>
    categories.map((category: { slug: string; _updatedAt: string }) => ({
      url: localizedUrl(`/category/${category.slug}`, locale),
      lastModified: new Date(category._updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  );

  const brandPages = i18n.locales.flatMap((locale) =>
    brands.map((brand: { slug: string; _updatedAt: string }) => ({
      url: localizedUrl(`/brands/${brand.slug}`, locale),
      lastModified: new Date(brand._updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  );

  return [...staticPages, ...productPages, ...categoryPages, ...brandPages];
}
