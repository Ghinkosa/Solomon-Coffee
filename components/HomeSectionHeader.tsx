import { cn } from "@/lib/utils";

interface HomeSectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  variant?: "light" | "dark";
  showDivider?: boolean;
}

const HomeSectionHeader = ({
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
  variant = "light",
  showDivider = true,
}: HomeSectionHeaderProps) => {
  const isDark = variant === "dark";

  return (
    <div className={cn("mb-10 text-center lg:mb-12", className)}>
      {showDivider ? (
        <div className="mb-3 inline-flex items-center gap-3">
          <div
            className={cn(
              "h-1 w-12 rounded-full",
              isDark
                ? "bg-gradient-to-r from-transparent to-[#E4C290]"
                : "bg-linear-to-r from-shop_light_green to-shop_dark_green",
            )}
          />
          <h2
            className={cn(
              "font-serif text-3xl font-bold leading-tight md:text-4xl",
              isDark
                ? "uppercase tracking-tight text-[#E4C290]"
                : "text-shop_dark_green",
              titleClassName,
            )}
          >
            {title}
          </h2>
          <div
            className={cn(
              "h-1 w-12 rounded-full",
              isDark
                ? "bg-gradient-to-l from-transparent to-[#E4C290]"
                : "bg-linear-to-l from-shop_light_green to-shop_dark_green",
            )}
          />
        </div>
      ) : (
        <h2
          className={cn(
            "font-serif text-3xl font-bold leading-tight md:text-4xl",
            isDark ? "text-[#E4C290]" : "text-shop_dark_green",
            titleClassName,
          )}
        >
          {title}
        </h2>
      )}

      {description && (
        <p
          className={cn(
            "mx-auto mt-4 max-w-2xl text-base leading-relaxed md:text-lg",
            isDark ? "text-[#E4C290]/80" : "text-light-color",
            descriptionClassName,
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default HomeSectionHeader;

export const homeEyebrowClass =
  "inline-block text-xs font-semibold uppercase tracking-[0.16em]";

export const homeBodyClass =
  "text-base leading-relaxed text-stone-800/80 md:text-lg";

export const homeSubheadingClass =
  "font-serif text-lg font-semibold text-shop_dark_green md:text-xl";

export const homeCaptionClass =
  "text-sm leading-relaxed text-stone-600 md:text-base";

export const homeActionLinkClass =
  "inline-flex items-center gap-1.5 text-base font-medium text-shop_light_green transition-colors hover:text-shop_dark_green";

export const homeOutlineButtonClass =
  "inline-flex items-center gap-2 rounded-full border border-shop_dark_green px-5 py-2.5 text-sm font-semibold text-shop_dark_green transition-colors hover:bg-shop_dark_green hover:text-white md:text-base";
