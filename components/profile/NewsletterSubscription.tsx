"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Mail, Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { checkSubscriptionStatus } from "@/actions/subscriptionActions";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";

export default function NewsletterSubscription() {
  const dictionary = useDictionary();
  const n = (path: string, fallback: string) =>
    t(dictionary, `userDashboard.settings.newsletter.${path}`, fallback);
  const benefitsList = () => {
    const segments = "userDashboard.settings.newsletter.benefits".split(".");
    let node: unknown = dictionary;
    for (const seg of segments) {
      if (!node || typeof node !== "object") return [];
      node = (node as Record<string, unknown>)[seg];
    }
    return Array.isArray(node)
      ? node.filter((item): item is string => typeof item === "string")
      : [];
  };

  const { user } = useUser();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;

  useEffect(() => {
    const checkStatus = async () => {
      if (!userEmail) {
        setIsLoading(false);
        return;
      }

      try {
        const status = await checkSubscriptionStatus(userEmail);
        setIsSubscribed(status.subscribed);
      } catch (error) {
        console.error("Error checking subscription status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [userEmail]);

  const handleSubscribe = async () => {
    if (!userEmail) {
      toast.error(n("toasts.emailNotFound", "Email not found"));
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubscribed(true);
        toast.success(
          data.message ||
            n("toasts.subscribeSuccess", "Successfully subscribed to newsletter!")
        );
      } else {
        if (data.alreadySubscribed) {
          setIsSubscribed(true);
          toast.info(
            data.error || n("toasts.alreadySubscribed", "You're already subscribed!")
          );
        } else {
          toast.error(data.error || n("toasts.subscribeFailed", "Failed to subscribe"));
        }
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error(n("toasts.genericError", "Something went wrong. Please try again."));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!userEmail) {
      toast.error(n("toasts.emailNotFound", "Email not found"));
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubscribed(false);
        toast.success(
          data.message ||
            n("toasts.unsubscribeSuccess", "Successfully unsubscribed from newsletter")
        );
      } else {
        toast.error(
          data.error || n("toasts.unsubscribeFailed", "Failed to unsubscribe")
        );
      }
    } catch (error) {
      console.error("Error unsubscribing:", error);
      toast.error(n("toasts.genericError", "Something went wrong. Please try again."));
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="mr-2 h-5 w-5" />
            {n("title", "Newsletter Subscription")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="mr-2 h-5 w-5" />
          {n("title", "Newsletter Subscription")}
        </CardTitle>
        <CardDescription>
          {n("description", "Manage your newsletter subscription preferences")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-gray-50">
          <div className="flex items-center space-x-3">
            {isSubscribed ? (
              <>
                <div className="shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {n("subscribed", "Subscribed to Newsletter")}
                  </p>
                  <p className="text-sm text-gray-600">{userEmail}</p>
                </div>
              </>
            ) : (
              <>
                <div className="shrink-0">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {n("notSubscribed", "Not Subscribed")}
                  </p>
                  <p className="text-sm text-gray-600">{userEmail}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        {!isSubscribed && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 text-sm mb-3">
              {n("benefitsTitle", "Newsletter Benefits:")}
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              {(benefitsList().length > 0
                ? benefitsList()
                : [
                    "Exclusive deals & discounts up to 50% off",
                    "Early access to new products",
                    "Free shipping offers",
                    "Shopping tips & trends",
                    "Birthday surprises",
                  ]
              ).map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {isSubscribed ? (
            <Button
              variant="outline"
              onClick={handleUnsubscribe}
              disabled={isProcessing}
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {n("unsubscribing", "Unsubscribing...")}
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  {n("unsubscribe", "Unsubscribe from Newsletter")}
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {n("subscribing", "Subscribing...")}
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  {n("subscribe", "Subscribe to Newsletter")}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Info Text */}
        <p className="text-xs text-gray-500 text-center">
          {isSubscribed
            ? n("footerSubscribed", "You can resubscribe at any time")
            : n(
                "footerNotSubscribed",
                "Join 50,000+ subscribers and never miss a deal"
              )}
        </p>
      </CardContent>
    </Card>
  );
}
