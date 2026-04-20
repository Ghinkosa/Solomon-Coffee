import { cn } from "@/lib/utils";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

interface LogoProps {
  className?: string;
  variant?: "default" | "sm";
  lang?: string;
  logoText?: {
    first: string;
    second: string;
  };
}

const Logo = ({
  className,
  variant = "default",
  lang = "en",
  logoText = { first: "Solomon", second: "Coffee" },
}: LogoProps) => {
  // Small variant for footer
  if (variant === "sm") {
    return (
      <Link href={`/${lang}`}>
        <div
          className={cn(
            "flex items-center gap-1.5 group hoverEffect",
            className,
          )}
        >
          {/* Cart Icon with Creative Styling (smaller) */}
          <div className="relative">
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-shop_orange rounded-full animate-pulse group-hover:bg-shop_light_green hoverEffect"></div>
            <ShoppingCart
              className="w-5 h-5 text-shop_dark_green group-hover:text-shop_light_green hoverEffect transform group-hover:scale-110"
              strokeWidth={2.5}
            />
          </div>

          {/* Text Logo (smaller) */}
          <div className="flex items-center">
            <h1 className="text-sm font-black tracking-wider uppercase font-sans">
              <span className="text-shop_dark_green group-hover:text-shop_light_green hoverEffect">
                {logoText.first}
              </span>
              <span className="bg-linear-to-r from-shop_light_green to-shop_orange bg-clip-text text-transparent group-hover:from-shop_dark_green group-hover:to-shop_light_green hoverEffect">
                {logoText.second}
              </span>
            </h1>

            {/* Decorative Elements (smaller) */}
            <div className="ml-0.5 flex flex-col gap-0.5">
              <div className="w-0.5 h-0.5 bg-shop_orange rounded-full group-hover:bg-shop_light_green hoverEffect"></div>
              <div className="w-0.5 h-0.5 bg-shop_light_green rounded-full group-hover:bg-shop_orange hoverEffect"></div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default full logo
  return (
    <Link href={`/${lang}`}>
      <div
        className={cn("flex items-center gap-2 group hoverEffect", className)}
      >
        {/* Cart Icon with Creative Styling */}
        <div className="relative">
          <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-shop_orange rounded-full animate-pulse group-hover:bg-shop_light_green hoverEffect"></div>
          <ShoppingCart
            className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-shop_dark_green group-hover:text-shop_light_green hoverEffect transform group-hover:scale-110"
            strokeWidth={2.5}
          />
        </div>

        {/* Text Logo */}
        <div className="flex items-center">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-black tracking-wider uppercase font-sans">
            <span className="text-shop_dark_green group-hover:text-shop_light_green hoverEffect">
              {logoText.first}
            </span>
            <span className="bg-linear-to-r from-shop_light_green to-shop_orange bg-clip-text text-transparent group-hover:from-shop_dark_green group-hover:to-shop_light_green hoverEffect">
              {logoText.second}
            </span>
          </h1>

          {/* Decorative Elements */}
          <div className="ml-1 flex flex-col gap-0.5">
            <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-shop_orange rounded-full group-hover:bg-shop_light_green hoverEffect"></div>
            <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-shop_light_green rounded-full group-hover:bg-shop_orange hoverEffect"></div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Logo;
