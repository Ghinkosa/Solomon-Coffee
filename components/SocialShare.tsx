"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Facebook, Linkedin, Link2, Check } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";
import { cn } from "@/lib/utils";

interface SocialShareProps {
  title?: string;
  /** Absolute or path URL of the article. Prefer the live page path. */
  url?: string;
}

const PRODUCTION_SITE =
  (process.env.NEXT_PUBLIC_SITE_URL || "https://shebascoffee.com").replace(
    /\/+$/,
    "",
  );

const BRAND_NAME = "Sheba Cup Coffee";

/** Social networks reject localhost / private URLs — rewrite to the public site. */
function toShareableUrl(raw: string): string {
  try {
    const parsed = new URL(raw, PRODUCTION_SITE);
    const isLocal =
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname.endsWith(".local");

    if (isLocal) {
      const publicOrigin = new URL(PRODUCTION_SITE);
      parsed.protocol = publicOrigin.protocol;
      parsed.host = publicOrigin.host;
    }

    return parsed.toString();
  } catch {
    return raw;
  }
}

function resolveShareUrl(explicitUrl?: string): string {
  if (explicitUrl?.trim()) {
    const value = explicitUrl.trim();
    // Absolute URL
    if (/^https?:\/\//i.test(value)) return toShareableUrl(value);
    // Path only — attach to public origin
    const path = value.startsWith("/") ? value : `/${value}`;
    return toShareableUrl(`${PRODUCTION_SITE}${path}`);
  }

  if (typeof window !== "undefined") {
    return toShareableUrl(window.location.href);
  }

  return "";
}

async function copyToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function XLogo({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.84L1.25 2.25h7.08l4.257 5.637L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

const SocialShare = ({ title, url }: SocialShareProps) => {
  const dictionary = useDictionary();
  const defaultTitle = t(
    dictionary,
    "socialShare.defaultTitle",
    "Check this out!",
  );
  const shareTitle = title?.trim() || defaultTitle;
  const [isCopied, setIsCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(() => resolveShareUrl(url));

  // Prefer the live path (correct locale/slug), then map onto the public domain
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (url?.trim() && /^https?:\/\//i.test(url.trim())) {
      setShareUrl(toShareableUrl(url.trim()));
      return;
    }

    setShareUrl(toShareableUrl(window.location.href));
  }, [url]);

  const shareText = useMemo(
    () => `${shareTitle} — ${BRAND_NAME}`,
    [shareTitle],
  );

  const shareLinks = useMemo(() => {
    if (!shareUrl) return [];

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    return [
      {
        name: "Facebook",
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        color: "hover:text-blue-600 hover:border-blue-600",
        icon: <Facebook size={16} />,
      },
      {
        name: "X",
        href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
        color: "hover:text-foreground hover:border-foreground",
        icon: <XLogo size={15} />,
      },
      {
        name: "LinkedIn",
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        color: "hover:text-blue-700 hover:border-blue-700",
        icon: <Linkedin size={16} />,
      },
    ];
  }, [shareText, shareUrl]);

  const handleCopyLink = useCallback(async () => {
    const target = shareUrl || resolveShareUrl(url);
    if (!target) {
      toast.error(
        t(dictionary, "socialShare.copyFailed", "Unable to copy link"),
      );
      return;
    }

    try {
      await copyToClipboard(target);
      setIsCopied(true);
      toast.success(
        t(dictionary, "socialShare.linkCopied", "Link copied to clipboard"),
      );
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error(
        t(dictionary, "socialShare.copyFailed", "Unable to copy link"),
      );
    }
  }, [dictionary, shareUrl, url]);

  if (!shareUrl) return null;

  return (
    <div className="flex flex-wrap items-center gap-4 border-t border-gray-200 pt-4">
      <span className="text-sm font-medium text-gray-700">
        {t(dictionary, "socialShare.label", "Share this article:")}
      </span>
      <div className="flex gap-2">
        <TooltipProvider delayDuration={100}>
          {shareLinks.map((platform) => (
            <Tooltip key={platform.name}>
              <TooltipTrigger asChild>
                <a
                  href={platform.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t(
                    dictionary,
                    "socialShare.shareOn",
                    "Share on {platform}",
                  ).replace("{platform}", platform.name)}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon" }),
                    "h-9 w-9 rounded-full transition-colors",
                    platform.color,
                  )}
                >
                  {platform.icon}
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {t(
                    dictionary,
                    "socialShare.shareOn",
                    "Share on {platform}",
                  ).replace("{platform}", platform.name)}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full transition-colors hover:border-shop_dark_green hover:text-shop_dark_green"
                onClick={handleCopyLink}
                aria-label={t(dictionary, "socialShare.copyLink", "Copy link")}
              >
                {isCopied ? <Check size={16} /> : <Link2 size={16} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t(dictionary, "socialShare.copyLink", "Copy link")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default SocialShare;
