import { getBanners } from "@/sanity/helpers";
import BannerCarousel from "./BannerCarousel";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Define a local interface if Sanity types are not yet generated.
export interface Banner {
  _id: string;
  description?: {
    en?: string;
    it?: string;
    fr?: string;
    hi?: string;
    ar?: string;
  };
  image?: {
    asset: {
      _ref: string;
      _type: "reference";
    };
  };
  backgroundVideo?: {
    asset?: {
      url?: string;
    };
  };
  backgroundVideoUrl?: string;
  disableVideoOnMobile?: boolean;
  title?: {
    en?: string;
    it?: string;
    fr?: string;
    hi?: string;
    ar?: string;
  };
  subtitle?: {
    en?: string;
    it?: string;
    fr?: string;
    hi?: string;
    ar?: string;
  };
  priceTitle?: {
    en?: string;
    it?: string;
    fr?: string;
    hi?: string;
    ar?: string;
  };
  price?: number;
  link?: string;
}

const HomeBanner = async ({
  lang,
  dictionary,
}: {
  lang: string;
  dictionary: any;
}) => {
  const banners = await getBanners();

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="mb-10 lg:mb-12">
      <BannerCarousel
        banners={banners as any}
        lang={lang}
        dictionary={dictionary}
      />
    </div>
  );
};

export default HomeBanner;
