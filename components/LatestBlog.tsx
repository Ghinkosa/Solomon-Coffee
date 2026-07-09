import Container from "./Container";
import HomeSectionHeader, { homeOutlineButtonClass } from "./HomeSectionHeader";
import { getLatestBlogs } from "@/sanity/queries";
import type { Blog } from "@/sanity.types";

/** Matches LATEST_BLOG_QUERY `blogcategories[]->{ title }` */
type LatestBlogItem = Omit<Blog, "blogcategories"> & {
  blogcategories?: Array<{ title?: string }>;
};
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import dayjs from "dayjs";
import { Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

const LatestBlog = async ({ dictionary }: { dictionary?: any }) => {
  const blogs = (await getLatestBlogs()) as LatestBlogItem[];

  return (
    <Container>
      <HomeSectionHeader
        title={dictionary?.title || "Latest Blog Posts"}
        description={
          dictionary?.description ||
          "Stay updated with our latest insights, tips, and industry news"
        }
        className="mb-6 lg:mb-8"
      />
      <div className="mb-10 text-center lg:mb-12">
        <Link
          href={"/blog"}
          className={`${homeOutlineButtonClass} group`}
        >
          {dictionary?.viewAll || "View All Posts"}
          <ArrowRight size={18} className="group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {blogs?.map((blog, index) => (
          <div
            key={blog?._id}
            className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 hover:border-shop_light_green hoverEffect transform hover:-translate-y-2"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Image Container */}
            {blog?.mainImage && (
              <div className="relative overflow-hidden">
                <Link href={`/blog/${blog?.slug?.current}`}>
                  <Image
                    src={urlFor(blog?.mainImage).url()}
                    alt={blog?.title || "Blog image"}
                    width={500}
                    height={300}
                    className="w-full h-48 object-cover group-hover:scale-110 hoverEffect"
                  />
                </Link>
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 hoverEffect"></div>
              </div>
            )}

            {/* Content Container */}
            <div className="p-6">
              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {blog?.blogcategories?.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-shop_light_pink text-shop_dark_green border border-shop_light_green/20 md:text-sm"
                  >
                    {item?.title}
                  </span>
                ))}
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-sm text-light-color mb-3 font-medium">
                <Calendar size={14} className="text-shop_light_green" />
                <span>{dayjs(blog.publishedAt).format("MMMM D, YYYY")}</span>
              </div>

              {/* Title */}
              <Link href={`/blog/${blog?.slug?.current}`} className="block">
                <h3 className="font-serif text-lg font-bold text-dark-color line-clamp-2 group-hover:text-shop_dark_green hoverEffect leading-tight mb-4 md:text-xl">
                  {blog?.title}
                </h3>
              </Link>

              {/* Read More Button */}
              <div className="pt-4 border-t border-gray-50">
                <Link
                  href={`/blog/${blog?.slug?.current}`}
                  className="inline-flex items-center gap-2 text-base font-medium text-shop_dark_green hover:text-shop_light_green hoverEffect group/btn"
                >
                  {dictionary?.readMore || "Read More"}
                  <ArrowRight
                    size={16}
                    className="group-hover/btn:translate-x-1 hoverEffect"
                  />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      {blogs && blogs.length > 0 && (
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-linear-to-r from-shop_light_pink to-shop_light_bg rounded-2xl border border-shop_light_green/20 shadow-sm">
            <div className="w-2 h-2 bg-shop_light_green rounded-full animate-pulse"></div>
            <span className="text-dark-color font-medium text-base">
              {dictionary?.discoverMore ||
                "Discover more insights and stories in our blog section"}
            </span>
            <div className="w-2 h-2 bg-shop_light_green rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default LatestBlog;
