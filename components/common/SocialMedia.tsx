import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "@/lib/utils";
import { contactConfig } from "@/config/contact";

interface Props {
  className?: string;
  iconClassName?: string;
  tooltipClassName?: string;
  variant?: "light" | "dark" | "footer";
}

const socialDefs = [
  {
    title: "YouTube",
    href: contactConfig.socialMedia.youtube,
    icon: <Youtube className="w-5 h-5" />,
    color: "hover:text-red-600 hover:border-red-600",
  },
  {
    title: "LinkedIn",
    href: contactConfig.socialMedia.linkedin,
    icon: <Linkedin className="w-5 h-5" />,
    color: "hover:text-blue-600 hover:border-blue-600",
  },
  {
    title: "Facebook",
    href: contactConfig.socialMedia.facebook,
    icon: <Facebook className="w-5 h-5" />,
    color: "hover:text-blue-600 hover:border-blue-600",
  },
  {
    title: "Instagram",
    href: contactConfig.socialMedia.instagram,
    icon: <Instagram className="w-5 h-5" />,
    color: "hover:text-pink-600 hover:border-pink-600",
  },
] as const;

const SocialMedia = ({
  className,
  iconClassName,
  tooltipClassName,
  variant = "light",
}: Props) => {
  const isDark = variant === "dark";
  const isFooter = variant === "footer";
  const socialLink = socialDefs.filter((item) => Boolean(item.href));

  if (socialLink.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-3.5", className)}>
        {socialLink.map((item) => (
          <Tooltip key={item.title}>
            <TooltipTrigger asChild>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "rounded-md border p-2 hoverEffect",
                  isFooter
                    ? "border-shop_orange/35 text-shop_light_pink/80 hover:border-shop_orange hover:bg-shop_btn_dark_green hover:text-shop_orange"
                    : isDark
                      ? "border-brand-gold-light/30 text-brand-gold-light/80 hover:border-brand-gold-light/50 hover:bg-brand-gold-light/10 hover:text-brand-gold-light"
                      : "border-gray-200 text-zinc-500 hover:bg-shop_light_bg hover:text-shop_dark_green",
                  !isDark && !isFooter && item.color,
                  iconClassName,
                )}
              >
                {item.icon}
              </a>
            </TooltipTrigger>
            <TooltipContent
              className={cn(
                isFooter
                  ? "bg-shop_orange font-semibold text-shop_dark_green"
                  : isDark
                    ? "bg-brand-gold-light font-semibold text-shop_dark_green"
                    : "bg-white font-semibold text-dark-color",
                tooltipClassName,
              )}
            >
              {item.title}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default SocialMedia;
