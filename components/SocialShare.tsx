"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Facebook,
  Linkedin,
  Twitter,
  Share2,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface SocialShareProps {
  title?: string;
  url?: string;
}

const SocialShare = ({ title = "Check this out!", url }: SocialShareProps) => {
  const [currentUrl, setCurrentUrl] = useState(url || "");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!url && typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, [url]);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: title,
          url: currentUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setIsCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: "Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        title,
      )}&url=${encodeURIComponent(currentUrl)}`,
      color: "hover:text-sky-500 hover:border-sky-500",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        currentUrl,
      )}`,
      color: "hover:text-blue-700 hover:border-blue-700",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        currentUrl,
      )}`,
      color: "hover:text-blue-600 hover:border-blue-600",
    },
  ];

  return (
    <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
      <span className="text-sm font-medium text-gray-700">
        Share this article:
      </span>
      <div className="flex gap-2">
        <TooltipProvider delayDuration={100}>
          {shareLinks.map((platform) => (
            <Tooltip key={platform.name}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`rounded-full w-9 h-9 transition-colors ${platform.color}`}
                  onClick={() =>
                    window.open(platform.href, "_blank", "width=600,height=400")
                  }
                >
                  <platform.icon size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share on {platform.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-9 h-9 hover:text-shop_dark_green hover:border-shop_dark_green transition-colors"
                onClick={handleNativeShare}
              >
                {isCopied ? <Check size={16} /> : <Share2 size={16} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share or Copy Link</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default SocialShare;
