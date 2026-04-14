import { Facebook, Github, Linkedin, Slack, Youtube } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  iconClassName?: string;
  tooltipClassName?: string;
}

const socialLink = [
  {
    title: "Youtube",
    href: "https://www.youtube.com/@reactjsBD",
    icon: <Youtube className="w-5 h-5" />,
    color: "hover:text-red-600 hover:border-red-600",
  },
  {
    title: "Github",
    href: "https://github.com/noorjsdivs",
    icon: <Github className="w-5 h-5" />,
    color: "hover:text-black hover:border-black",
  },
  {
    title: "Linkedin",
    href: "https://www.linkedin.com/in/noor-mohammad-ab221a1b5/",
    icon: <Linkedin className="w-5 h-5" />,
    color: "hover:text-blue-600 hover:border-blue-600",
  },
  {
    title: "Facebook",
    href: "https://www.facebook.com/Noorlalu143",
    icon: <Facebook className="w-5 h-5" />,
    color: "hover:text-blue-600 hover:border-blue-600",
  },
  {
    title: "Slack",
    href: "https://www.youtube.com/@reactjsBD",
    icon: <Slack className="w-5 h-5" />,
    color: "hover:text-purple-600 hover:border-purple-600",
  },
];

const SocialMedia = ({ className, iconClassName, tooltipClassName }: Props) => {
  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-3.5 text-zinc-400", className)}>
        {socialLink.map((item) => (
          <Tooltip key={item.title}>
            <TooltipTrigger asChild>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "p-2 border rounded-full hover:bg-white hoverEffect",
                  item.color,
                  iconClassName,
                )}
              >
                {item.icon}
              </a>
            </TooltipTrigger>
            <TooltipContent
              className={cn(
                "bg-white text-dark-color font-semibold",
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
