import { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";
import { localizedUrl } from "@/lib/seo";
import { i18n } from "@/i18n-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, blogs] = await Promise.all([
    client.fetch(`
      *[_type == "product" && defined(slug.current) && (!defined(isArchived) || isArchived != true)] {
        "slug": slug.current,
        _updatedAt
      }
    `),
    client.fetch(`
      *[_type == "category" && defined(slug.current)] {
        "slug": slug.current,
        _updatedAt
      }
    `),
    client.fetch(`
      *[_type == "blog" && defined(slug.current)] {
        "slug": slug.current,
        _updatedAt,
        publishedAt
      }
    `),
  ]);

  const marketingPaths: Array<{
    path: string;
    changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
    priority: number;
  }> = [
    { path: "", changeFrequency: "daily", priority: 1 },
    { path: "/shop", changeFrequency: "daily", priority: 0.9 },
    { path: "/category", changeFrequency: "weekly", priority: 0.8 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
    { path: "/deal", changeFrequency: "weekly", priority: 0.7 },
    { path: "/about", changeFrequency: "monthly", priority: 0.6 },
    { path: "/mission", changeFrequency: "monthly", priority: 0.5 },
    { path: "/our-coffee", changeFrequency: "monthly", priority: 0.6 },
    { path: "/education", changeFrequency: "monthly", priority: 0.5 },
    { path: "/wholesalers", changeFrequency: "monthly", priority: 0.5 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
    { path: "/faqs", changeFrequency: "monthly", priority: 0.4 },
    { path: "/help", changeFrequency: "monthly", priority: 0.4 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  ];

  const staticPages = i18n.locales.flatMap((locale) =>
    marketingPaths.map(({ path, changeFrequency, priority }) => ({
      url: path === "" ? localizedUrl("/", locale) : localizedUrl(path, locale),
      lastModified: new Date(),
      changeFrequency,
      priority,
    })),
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

  const blogPages = i18n.locales.flatMap((locale) =>
    blogs.map(
      (blog: {
        slug: string;
        _updatedAt?: string;
        publishedAt?: string;
      }) => ({
        url: localizedUrl(`/blog/${blog.slug}`, locale),
        lastModified: new Date(
          blog._updatedAt || blog.publishedAt || Date.now(),
        ),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }),
    ),
  );

  return [...staticPages, ...productPages, ...categoryPages, ...blogPages];
}
