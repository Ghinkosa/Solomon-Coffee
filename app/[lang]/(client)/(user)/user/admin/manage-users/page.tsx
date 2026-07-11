"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Crown } from "lucide-react";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";

export default function AdminUserManagement() {
  const dictionary = useDictionary();
  const p = (path: string, fallback: string) =>
    t(dictionary, `userDashboard.admin.manageUsersPage.${path}`, fallback);
  const c = (path: string, fallback: string) =>
    t(dictionary, `userDashboard.admin.common.${path}`, fallback);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSetPremium = async (setPremium: boolean) => {
    if (!email.trim()) {
      toast.error(p("toasts.emailRequired", "Please enter an email address"));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/manage-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          setPremium,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setEmail("");
      } else {
        toast.error(data.error || p("toasts.manageFailed", "Failed to manage user"));
      }
    } catch (error) {
      console.error("Error managing user:", error);
      toast.error(p("toasts.manageError", "Error managing user"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {p("title", "Admin User Management")}
        </h1>
        <p className="text-gray-600">
          {p("subtitle", "Manage user premium status and account settings")}
        </p>
      </div>

      <div className="max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {p("cardTitle", "User Premium Status")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">{p("emailLabel", "User Email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={p("emailPlaceholder", "user@example.com")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Button
                onClick={() => handleSetPremium(true)}
                disabled={loading}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <Crown className="w-4 h-4 mr-2" />
                {loading
                  ? c("processing", "Processing...")
                  : p("setPremium", "Set as Premium User")}
              </Button>

              <Button
                onClick={() => handleSetPremium(false)}
                disabled={loading}
                variant="outline"
              >
                <User className="w-4 h-4 mr-2" />
                {loading
                  ? c("processing", "Processing...")
                  : p("setStandard", "Set as Standard User")}
              </Button>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p>{p("premiumHelp", "Premium User: isActive = true, gets premium features")}</p>
              <p>
                {p(
                  "standardHelp",
                  "Standard User: isActive = false, basic features only"
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>{p("quickAccess", "Quick Access")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                onClick={() => setEmail("admin@shebascoffee.com")}
                variant="outline"
                size="sm"
              >
                {p("setAdminUser", "Set Admin User (admin@shebascoffee.com)")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
