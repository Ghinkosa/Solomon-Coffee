import Container from "./Container";
import Title from "./Title";
import { getLatestBlogs } from "@/sanity/queries";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import dayjs from "dayjs";
import { Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

const LatestBlog = async ({ dictionary }: { dictionary?: any }) => {
  const blogs = await getLatestBlogs();

  return (
    <Container className="mt-16 lg:mt-24">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="h-1 w-12 bg-linear-to-r from-shop_light_green to-shop_dark_green rounded-full"></div>
          <h2 className="text-3xl lg:text-4xl font-bold text-dark-color">
            {dictionary?.title || "Latest Blog Posts"}
          </h2>
          <div className="h-1 w-12 bg-linear-to-l from-shop_light_green to-shop_dark_green rounded-full"></div>
        </div>
        <p className="text-light-color text-lg max-w-2xl mx-auto">
          {dictionary?.description ||
            "Stay updated with our latest insights, tips, and industry news"}
        </p>
        <Link
          href={"/blog"}
          className="inline-flex items-center gap-2 group text-shop_dark_green font-bold px-6 py-2 border-2 border-shop_light_green rounded-full hover:bg-shop_dark_green hover:text-white hoverEffect"
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
                    className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-shop_light_pink text-shop_dark_green border border-shop_light_green/20"
                  >
                    {item?.title}
                  </span>
                ))}
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-xs text-light-color mb-3 font-medium">
                <Calendar size={14} className="text-shop_light_green" />
                <span>{dayjs(blog.publishedAt).format("MMMM D, YYYY")}</span>
              </div>

              {/* Title */}
              <Link href={`/blog/${blog?.slug?.current}`} className="block">
                <h3 className="text-lg font-bold text-dark-color line-clamp-2 group-hover:text-shop_dark_green hoverEffect leading-tight mb-4">
                  {blog?.title}
                </h3>
              </Link>

              {/* Read More Button */}
              <div className="pt-4 border-t border-gray-50">
                <Link
                  href={`/blog/${blog?.slug?.current}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-shop_dark_green hover:text-shop_light_green hoverEffect group/btn"
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
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-linear-to-r from-shop_light_pink to-shop_light_bg rounded-2xl border border-shop_light_green/20 shadow-sm">
            <div className="w-2 h-2 bg-shop_light_green rounded-full animate-pulse"></div>
            <span className="text-dark-color font-semibold text-sm sm:text-base">
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
