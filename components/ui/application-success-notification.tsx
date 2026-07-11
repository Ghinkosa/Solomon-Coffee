"use client";

import { useEffect, useState } from "react";
import { CheckCircle, X, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";

interface ApplicationSuccessNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  type: "premium" | "business";
  userName?: string;
}

export default function ApplicationSuccessNotification({
  isVisible,
  onClose,
  type,
  userName,
}: ApplicationSuccessNotificationProps) {
  const dictionary = useDictionary();
  const s = (path: string, fallback: string) =>
    t(
      dictionary,
      `userDashboard.dashboard.applicationSuccess.${path}`,
      fallback
    );
  const a = (path: string, fallback: string) =>
    t(dictionary, `userDashboard.dashboard.applications.${path}`, fallback);
  const app = (path: string, fallback: string) =>
    t(
      dictionary,
      `userDashboard.dashboard.applications.${type}.${path}`,
      fallback
    );
  const listAt = (subpath: string, fallback: string[]) => {
    const segments =
      `userDashboard.dashboard.applications.${subpath}`.split(".");
    let node: unknown = dictionary;
    for (const seg of segments) {
      if (!node || typeof node !== "object") return fallback;
      node = (node as Record<string, unknown>)[seg];
    }
    return Array.isArray(node)
      ? node.filter((item): item is string => typeof item === "string")
      : fallback;
  };

  const [isAnimating, setIsAnimating] = useState(false);
  const displayName = userName || s("defaultUserName", "User");

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        onClose();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const config = {
    premium: {
      title: app("pendingTitle", "Premium Application Submitted!"),
      subtitle: s("premiumSubtitle", "Congratulations {name}!").replace(
        "{name}",
        displayName
      ),
      description: app(
        "pendingDescription",
        "Your premium account application has been successfully submitted and is currently under administrative review."
      ),
      bgColor: "from-amber-500 to-yellow-500",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      benefits: listAt("premium.activeBenefits", [
        "Exclusive access to premium features",
        "Priority customer support",
        "Enhanced rewards and loyalty points",
        "Eligible for Business Account upgrade",
      ]),
      typeLabel: s("premiumType", "Premium"),
    },
    business: {
      title: app("pendingTitle", "Business Application Submitted!"),
      subtitle: s("businessSubtitle", "Excellent choice {name}!").replace(
        "{name}",
        displayName
      ),
      description: app(
        "pendingDescription",
        "Your business account application has been submitted successfully and is currently under administrative review."
      ),
      bgColor: "from-blue-500 to-indigo-500",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      benefits: listAt("business.pendingBenefits", [
        "2% additional discount on all orders",
        "Priority customer support",
        "Bulk order management",
        "Business invoicing capabilities",
      ]),
      typeLabel: s("businessType", "Business"),
    },
  };

  const currentConfig = config[type];
  const nextSteps = listAt(`${type}.pendingSteps`, listAt("premium.pendingSteps", [
    "Our admin team will review your application within 24-48 hours",
    "You'll receive an email notification once your status changes",
    "Upon approval, benefits will be activated immediately",
  ]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-gray-200 transform transition-all duration-500 ${
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div
          className={`p-6 bg-gradient-to-r ${currentConfig.bgColor} text-white rounded-t-2xl relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 opacity-20">
            <Sparkles className="w-24 h-24" />
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 text-white hover:bg-white/20 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-4">
            <div className={`${currentConfig.iconBg} p-3 rounded-full`}>
              <CheckCircle className={`w-8 h-8 ${currentConfig.iconColor}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold">{currentConfig.title}</h3>
              <p className="text-white/90">{currentConfig.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">{currentConfig.description}</p>

          <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <span className="text-amber-800 font-medium text-sm">
              {s("statusPending", "Status: Pending Review")}
            </span>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              {s("whatNext", a("whatNext", "What happens next?"))}
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {nextSteps.map((step, index) => (
                <li key={index}>• {step}</li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">
              {s("benefitsUponApproval", "{type} Benefits (Upon Approval):").replace(
                "{type}",
                currentConfig.typeLabel
              )}
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {currentConfig.benefits.map((benefit, index) => (
                <li key={index}>• {benefit}</li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              className="flex-1 bg-gray-900 hover:bg-gray-800"
            >
              {s("continueButton", "Continue to Dashboard")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
