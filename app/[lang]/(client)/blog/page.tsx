import Container from "@/components/Container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Blog } from "@/sanity.types";

/** Matches GET_ALL_BLOG `blogcategories[]->{ title }` */
type BlogListItem = Omit<Blog, "blogcategories"> & {
  blogcategories?: Array<{ title?: string }>;
};
import { urlFor } from "@/sanity/lib/image";
import { getAllBlogs } from "@/sanity/queries";
import dayjs from "dayjs";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

const BLOG_HERO_IMAGE =
  "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format";

export const metadata: Metadata = {
  title: "Blog",
  description: "Read our latest insights, stories, and tips.",
};

interface Props {
  params: Promise<{ lang: Locale }>;
}

const BlogPage = async ({ params }: Props) => {
  const { lang } = await params;
  const [blogs, dictionary] = await Promise.all([
    getAllBlogs(12) as Promise<BlogListItem[]>,
    getDictionary(lang),
  ]);

  // Calculate reading time (mock calculation based on title length)
  const calculateReadingTime = (title: string) => {
    const wordsPerMinute = 200;
    const wordCount = title.split(" ").length * 20; // Estimate based on title
    return Math.ceil(wordCount / wordsPerMinute);
  };

  // Extract description from blog body
  const extractDescription = (
    body: Blog["body"],
    maxLength: number = 150,
  ) => {
    if (!body || !Array.isArray(body))
      return "Discover insights and stories that matter.";

    let description = "";
    for (const block of body) {
      if (block._type === "block" && block.children) {
        for (const child of block.children) {
          if (child.text && child._type === "span") {
            description += child.text + " ";
            if (description.length > maxLength) {
              return description.substring(0, maxLength).trim() + "...";
            }
          }
        }
      }
    }

    return (
      description.trim() ||
      "Read our latest insights and discover new perspectives."
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-shop_light_bg to-white">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-stone-900">
        <Image
          src={BLOG_HERO_IMAGE}
          alt="Coffee journal and stories"
          fill
          priority
          className="object-cover opacity-40"
        />
        <Container className="relative z-10 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-amber-600/20 text-amber-400 border-amber-600/50">
              <span className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {dictionary.blog.hero.badge}
              </span>
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              {dictionary.blog.hero.title}
            </h1>
            <div className="w-24 h-1 bg-amber-500 mx-auto my-8 rounded-full" />
            <p className="text-lg md:text-xl text-stone-300 max-w-2xl mx-auto">
              {dictionary.blog.hero.description}
            </p>
          </div>
        </Container>
      </section>

      {/* Blog Grid */}
      <Container className="py-8 sm:py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-shop_dark_green mb-2">
                {dictionary.blog.list.title}
              </h2>
              <p className="text-gray-600">
                {dictionary.blog.list.description}
              </p>
            </div>
          </div>
        </div>

        {blogs && blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {blogs.map((blog, index) => (
              <Card
                key={blog?._id}
                className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-0 shadow-lg ${
                  index === 0 ? "md:col-span-2 lg:col-span-2" : ""
                }`}
              >
                {blog?.mainImage && (
                  <div className="relative overflow-hidden">
                    <Image
                      src={urlFor(blog.mainImage).url()}
                      alt={blog?.title || "Blog image"}
                      width={500}
                      height={300}
                      className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                        index === 0 ? "h-64 md:h-80" : "h-48 md:h-56"
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <Link
                      href={`/blog/${blog?.slug?.current}`}
                      className="absolute inset-0"
                    />

                    {/* Category Badge */}
                    {blog?.blogcategories && blog.blogcategories.length > 0 && (
                      <Badge className="absolute top-4 left-4 bg-shop_dark_green hover:bg-shop_light_green">
                        {blog.blogcategories[0]?.title}
                      </Badge>
                    )}
                  </div>
                )}

                <CardContent className="p-4 sm:p-6">
                  {/* Meta Information */}
                  <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {dayjs(blog.publishedAt).format("MMM D, YYYY")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {calculateReadingTime(blog?.title || "")}{" "}
                      {dictionary.blog.list.minRead}
                    </div>
                  </div>

                  {/* Title */}
                  <Link
                    href={`/blog/${blog?.slug?.current}`}
                    className="block group/title"
                  >
                    <h3
                      className={`font-bold text-shop_dark_green group-hover/title:text-shop_light_green transition-colors duration-200 line-clamp-2 leading-tight ${
                        index === 0
                          ? "text-lg sm:text-xl md:text-2xl mb-3"
                          : "text-base sm:text-lg mb-2"
                      }`}
                    >
                      {blog?.title}
                    </h3>
                  </Link>

                  {/* Description for all posts */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {extractDescription(blog?.body || [])}
                  </p>

                  <Separator className="my-3" />

                  {/* Read More Link */}
                  <Link
                    href={`/blog/${blog?.slug?.current}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-shop_light_green hover:text-shop_dark_green transition-colors duration-200 group/link"
                  >
                    {dictionary.blog.list.readMore}
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-200 group-hover/link:translate-x-1"
                    />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 sm:p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {dictionary.blog.list.noPosts.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  {dictionary.blog.list.noPosts.description}
                </p>
                <Button asChild>
                  <Link href="/">{dictionary.blog.list.noPosts.button}</Link>
                </Button>
              </div>
            </div>
          </Card>
        )}
      </Container>

      {/* Newsletter Section */}
      <Container className="py-8 sm:py-12">
        <Card className="bg-gradient-to-r from-shop_light_pink to-light-orange/20 border-0">
          <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
            <div className="max-w-2xl mx-auto">
              <BookOpen className="w-12 h-12 text-shop_dark_green mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-shop_dark_green mb-4">
                {dictionary.blog.newsletter.title}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                {dictionary.blog.newsletter.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
                <Button
                  size="lg"
                  className="bg-shop_dark_green hover:bg-shop_light_green w-full sm:w-auto"
                >
                  {dictionary.blog.newsletter.subscribe}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-shop_dark_green text-shop_dark_green hover:bg-shop_dark_green hover:text-white w-full sm:w-auto"
                >
                  {dictionary.blog.newsletter.browse}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default BlogPage;
