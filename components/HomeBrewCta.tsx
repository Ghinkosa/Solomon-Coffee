import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { homeOutlineButtonClass } from "./HomeSectionHeader";

const CTA_IMAGE =
  "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=2400&auto=format&fit=crop";

interface HomeBrewCtaProps {
  lang: string;
}

const HomeBrewCta = ({ lang }: HomeBrewCtaProps) => {
  return (
    <section className="relative min-h-[320px] w-full overflow-hidden sm:min-h-[380px]">
      <Image
        src={CTA_IMAGE}
        alt="Fresh roasted coffee beans"
        fill
        sizes="100vw"
        className="object-cover"
        priority={false}
      />

      <div className="absolute inset-0 bg-linear-to-r from-shop_dark_green/92 via-shop_btn_dark_green/88 to-shop_dark_green/92" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:py-20">
        <h2 className="mb-4 font-serif text-3xl font-bold leading-tight text-shop_light_pink md:text-4xl">
          Brew Better at Home with Sheba Cup Coffee
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-shop_light_pink/90 md:text-lg">
          Explore fresh roasts, brewing essentials, and limited selections
          crafted for your daily ritual.
        </p>
        <Link
          href={`/${lang}/shop`}
          className={`${homeOutlineButtonClass} border-shop_orange bg-shop_orange text-shop_dark_green hover:border-shop_light_pink hover:bg-shop_light_pink hover:text-shop_dark_green`}
        >
          Shop Coffee
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
};

export default HomeBrewCta;
