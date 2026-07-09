"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface NewsletterFormProps {
  variant?: "light" | "dark" | "footer";
}

const NewsletterForm = ({ variant = "footer" }: NewsletterFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset message
    setMessage(null);

    // Basic validation
    if (!email.trim()) {
      setMessage({
        type: "error",
        text: "Please enter your email address",
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text:
            data.message ||
            "Thank you for subscribing! Check your email for a welcome message.",
        });
        setEmail(""); // Clear input on success
      } else {
        // Check if already subscribed
        if (data.alreadySubscribed) {
          setMessage({
            type: "info",
            text:
              data.error ||
              "You're already subscribed to our newsletter! Check your inbox for our latest updates.",
          });
        } else {
          setMessage({
            type: "error",
            text: data.error || "Failed to subscribe. Please try again.",
          });
        }
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFooter = variant === "footer";
  const isDark = variant === "dark" || isFooter;

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className={
            isFooter
              ? "w-full rounded-lg border border-shop_orange/35 bg-shop_btn_dark_green/50 px-4 py-2.5 text-shop_light_pink placeholder:text-shop_light_pink/40 transition-all focus:border-shop_orange focus:outline-none focus:ring-2 focus:ring-shop_orange/25 disabled:cursor-not-allowed disabled:opacity-50"
              : isDark
                ? "w-full rounded-lg border border-brand-gold-light/30 bg-white/5 px-4 py-2.5 text-shop_light_pink placeholder:text-brand-gold-light/40 transition-all focus:border-brand-gold-light/60 focus:outline-none focus:ring-2 focus:ring-brand-gold-light/20 disabled:cursor-not-allowed disabled:opacity-50"
                : "w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-shop_dark_green disabled:cursor-not-allowed disabled:bg-gray-100"
          }
        />
        <button
          type="submit"
          disabled={isLoading}
          className={
            isFooter
              ? "flex w-full items-center justify-center gap-2 rounded-lg bg-shop_orange px-4 py-2.5 font-semibold text-shop_dark_green transition-colors hover:bg-shop_light_pink disabled:cursor-not-allowed disabled:opacity-50"
              : isDark
                ? "flex w-full items-center justify-center gap-2 rounded-lg bg-brand-gold-light px-4 py-2.5 font-semibold text-shop_dark_green transition-colors hover:bg-shop_light_pink disabled:cursor-not-allowed disabled:opacity-50"
                : "flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Subscribing...
            </>
          ) : (
            "Subscribe"
          )}
        </button>
      </form>

      {/* Message Display */}
      {message && (
        <div
          className={`flex animate-in items-start gap-2 rounded-lg p-3 text-sm duration-300 fade-in slide-in-from-top-2 ${
            isDark
              ? message.type === "success"
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : message.type === "info"
                  ? "border border-sky-500/30 bg-sky-500/10 text-sky-200"
                  : "border border-red-500/30 bg-red-500/10 text-red-200"
              : message.type === "success"
                ? "border border-green-200 bg-green-50 text-green-800"
                : message.type === "info"
                  ? "border border-blue-200 bg-blue-50 text-blue-800"
                  : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.type === "success" && (
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          {message.type === "error" && (
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          {message.type === "info" && (
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          <span className="flex-1">{message.text}</span>
        </div>
      )}
    </div>
  );
};

export default NewsletterForm;
