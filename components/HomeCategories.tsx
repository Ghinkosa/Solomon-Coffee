import { Category } from "@/sanity.types";
import Container from "./Container";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { ArrowRight } from "lucide-react";
import HomeSectionHeader, {
  homeActionLinkClass,
  homeSubheadingClass,
} from "./HomeSectionHeader";

type CategoryWithCount = Category & { productCount?: number };

interface HomeCategoriesDictionary {
  title?: string;
  description?: string;
  browseAll?: string;
  productsLabel?: string;
}

interface Props {
  categories: CategoryWithCount[];
  dictionary?: HomeCategoriesDictionary;
  lang?: string;
}

const HomeCategories = ({ categories, dictionary, lang = "en" }: Props) => {
  if (!categories?.length) return null;

  const productsLabel = dictionary?.productsLabel || "coffees";

  return (
    <section className="border-y border-shop_dark_green/10 bg-[#f3ede6] py-16 lg:py-20">
      <Container>
        <HomeSectionHeader
          title={dictionary?.title || "Popular Categories"}
          description={
            dictionary?.description || "Browse our core coffee collections."
          }
        />

        <ul className="mx-auto grid max-w-3xl gap-0 sm:max-w-4xl sm:grid-cols-2 sm:gap-x-12 lg:gap-x-16">
          {categories.map((category) => {
            const productCount = category.productCount ?? 0;
            const initial = category.title?.charAt(0)?.toUpperCase() || "C";

            return (
              <li key={category._id} className="border-b border-shop_dark_green/10">
                <Link
                  href={`/${lang}/category/${category.slug?.current || ""}`}
                  className="group flex items-center gap-4 py-4 sm:py-5"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-shop_dark_green/5 sm:h-16 sm:w-16">
                    {category.image ? (
                      <Image
                        src={urlFor(category.image).width(128).height(128).url()}
                        alt={category.title || "Coffee category"}
                        fill
                        sizes="64px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-shop_light_green">
                        {initial}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 text-left">
                    <h3 className={`truncate transition-colors group-hover:text-shop_light_green ${homeSubheadingClass}`}>
                      {category.title}
                    </h3>
                    {productCount > 0 && (
                      <p className="mt-0.5 text-sm text-light-color md:text-base">
                        {productCount} {productsLabel}
                      </p>
                    )}
                  </div>

                  <ArrowRight
                    size={16}
                    className="shrink-0 text-shop_dark_green/25 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-shop_light_green"
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 text-center">
          <Link
            href={`/${lang}/category`}
            className={homeActionLinkClass}
          >
            {dictionary?.browseAll || "View all"}
            <ArrowRight size={15} />
          </Link>
        </div>
      </Container>
    </section>
  );
};

export default HomeCategories;
