import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import logoImage from "@/images/logo.png";

interface LogoProps {
  className?: string;
  variant?: "default" | "sm";
  lang?: string;
  theme?: "light" | "dark";
  logoText?: {
    first: string;
    second: string;
  };
}

const Logo = ({
  className,
  variant = "default",
  lang = "en",
  theme = "light",
  logoText = { first: "Sheba", second: "Cup Coffee" },
}: LogoProps) => {
  const primaryTextClass =
    theme === "dark"
      ? "text-shop_light_pink group-hover:text-shop_orange"
      : "text-shop_dark_green group-hover:text-shop_light_green";
  const secondaryTextClass =
    theme === "dark"
      ? "text-shop_orange group-hover:text-shop_light_pink"
      : "text-shop_orange group-hover:text-shop_dark_green";

  // Small variant for footer
  if (variant === "sm") {
    return (
      <Link
        href={`/${lang}`}
        aria-label={`${logoText.first} ${logoText.second} — Home`}
      >
        <div className={cn("flex items-center gap-2 group hoverEffect", className)}>
          <Image
            src={logoImage}
            alt={`${logoText.first} ${logoText.second}`}
            className="h-8 w-auto object-contain transition-opacity duration-200 group-hover:opacity-90"
            priority
          />
          <p
            className={`whitespace-nowrap text-sm font-extrabold tracking-wide uppercase hoverEffect ${primaryTextClass}`}
          >
            {logoText.first}{" "}
            <span className={secondaryTextClass}>{logoText.second}</span>
          </p>
        </div>
      </Link>
    );
  }

  // Default full logo
  return (
    <Link
      href={`/${lang}`}
      aria-label={`${logoText.first} ${logoText.second} — Home`}
    >
      <div className={cn("flex items-center gap-2 sm:gap-3 group hoverEffect", className)}>
        <Image
          src={logoImage}
          alt={`${logoText.first} ${logoText.second}`}
          className="h-9 w-auto object-contain transition-opacity duration-200 group-hover:opacity-90 sm:h-10 lg:h-11"
          priority
        />
        <p
          className={`whitespace-nowrap text-sm sm:text-base lg:text-lg font-extrabold tracking-wide uppercase hoverEffect ${primaryTextClass}`}
        >
          {logoText.first}{" "}
          <span className={secondaryTextClass}>{logoText.second}</span>
        </p>
      </div>
    </Link>
  );
};

export default Logo;
