"use client";
import { productType } from "@/constants";

const TAB_LABEL_KEYS: Record<string, string> = {
  "Light Roast": "lightRoast",
  "Medium Roast": "mediumRoast",
  "Dark Roast": "darkRoast",
  "Extra Dark": "extraDark",
};

interface Props {
  selectedTab: string | null;
  onTabSelect: (tab: string | null) => void;
  tabs?: {
    all?: string;
    lightRoast?: string;
    mediumRoast?: string;
    darkRoast?: string;
    extraDark?: string;
  };
}

const HomeTabbar = ({ selectedTab, onTabSelect, tabs }: Props) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-5">
      <div className="flex items-center gap-1.5 text-sm font-semibold md:text-base">
        <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-3">
          <button
            onClick={() => onTabSelect(null)}
            className={`border border-shop_light_green/30 px-4 py-2 md:px-6 md:py-2.5 rounded-full hover:bg-shop_light_green hover:border-shop_light_green hover:text-white hoverEffect ${selectedTab === null ? "bg-shop_light_green text-white border-shop_light_green" : "bg-shop_light_green/10"}`}
          >
            {tabs?.all || "All"}
          </button>
          {productType?.map((item) => {
            const labelKey = TAB_LABEL_KEYS[item.title];
            const label =
              (labelKey && tabs?.[labelKey as keyof typeof tabs]) ||
              item.title;

            return (
              <button
                onClick={() => onTabSelect(item?.title)}
                key={item?.title}
                className={`border border-shop_light_green/30 px-4 py-2 md:px-6 md:py-2.5 rounded-full hover:bg-shop_light_green hover:border-shop_light_green hover:text-white hoverEffect ${selectedTab === item?.title ? "bg-shop_light_green text-white border-shop_light_green" : "bg-shop_light_green/10"}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomeTabbar;
