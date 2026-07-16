import Image from "next/image";
import aboutUsHeadshot from "@/images/about-us-headshot.webp";
import { homeEyebrowClass } from "./HomeSectionHeader";
import {
  OurStoryBody,
  OurStoryHeader,
  type OurStoryDictionary,
} from "./OurStoryText";

interface OurStorySectionProps {
  story: OurStoryDictionary;
}

const OurStorySection = ({ story }: OurStorySectionProps) => {
  return (
    <section className="relative overflow-x-hidden bg-[#faf8f5] py-16 lg:py-20">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-shop_orange/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-shop_light_green/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-14">
          <div className="lg:hidden">
            <OurStoryHeader story={story} />
          </div>

          <div className="lg:col-span-5">
            <div className="relative mx-auto w-full max-w-md pb-10 lg:max-w-none">
              <div className="absolute -inset-3 rounded-[1.75rem] bg-linear-to-br from-brand-gold/25 via-transparent to-shop_light_green/20" />

              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-shop_dark_green/10 bg-white shadow-[0_24px_60px_-20px_rgba(61,43,31,0.35)]">
                <Image
                  src={aboutUsHeadshot}
                  alt={story.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 90vw, 40vw"
                  className="object-cover object-top"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-shop_dark_green/35 via-transparent to-transparent" />
              </div>

              <div className="absolute -bottom-5 -right-2 max-w-[220px] rounded-xl border border-shop_dark_green/10 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm sm:-right-5">
                <p className={`text-shop_light_green ${homeEyebrowClass}`}>
                  {story.badge.title}
                </p>
                <p className="mt-1 font-serif text-base leading-snug text-shop_dark_green">
                  {story.badge.subtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 lg:col-span-7">
            <div className="hidden lg:block">
              <OurStoryHeader story={story} />
            </div>
            <OurStoryBody story={story} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStorySection;
