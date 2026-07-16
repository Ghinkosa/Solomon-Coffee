"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Download, Loader2, Shield, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import NewsletterSubscription from "@/components/profile/NewsletterSubscription";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";
import type { NotificationChannelPreference } from "@/lib/userPreferences";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/userPreferences";

type PreferenceKey = keyof NotificationChannelPreference;

const PREFERENCE_META: Array<{
  key: PreferenceKey;
  labelKey: string;
  labelFallback: string;
  hintKey: string;
  hintFallback: string;
}> = [
  {
    key: "emailNotifications",
    labelKey: "emailNotifications",
    labelFallback: "Email Notifications",
    hintKey: "emailNotificationsHint",
    hintFallback: "Receive transactional emails such as order confirmations",
  },
  {
    key: "orderUpdates",
    labelKey: "orderUpdates",
    labelFallback: "Order Updates",
    hintKey: "orderUpdatesHint",
    hintFallback: "Get in-app notifications when your order status changes",
  },
  {
    key: "marketingEmails",
    labelKey: "marketingEmails",
    labelFallback: "Marketing Emails",
    hintKey: "marketingEmailsHint",
    hintFallback: "Receive promotional offers and marketing messages",
  },
];

export default function UserSettingsPage() {
  const dictionary = useDictionary();
  const s = (path: string, fallback: string) =>
    t(dictionary, `userDashboard.settings.${path}`, fallback);

  const [preferences, setPreferences] = useState<NotificationChannelPreference>(
    DEFAULT_NOTIFICATION_PREFERENCES,
  );
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<PreferenceKey | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/settings", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 404) {
        setPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
        toast.message(
          s(
            "profileRequired",
            "Complete account setup to save notification preferences.",
          ),
        );
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load settings");
      }

      const data = await response.json();
      if (data.preferences) {
        setPreferences({
          ...DEFAULT_NOTIFICATION_PREFERENCES,
          ...data.preferences,
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error(s("loadFailed", "Failed to load settings"));
    } finally {
      setLoading(false);
    }
  }, [dictionary]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const handleSettingChange = async (key: PreferenceKey, value: boolean) => {
    const previous = preferences;
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setSavingKey(key);

    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ [key]: value }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to update settings");
      }

      if (data?.preferences) {
        setPreferences({
          ...DEFAULT_NOTIFICATION_PREFERENCES,
          ...data.preferences,
        });
      }

      toast.success(s("updated", "Settings updated successfully"));
    } catch (error) {
      console.error("Error updating settings:", error);
      setPreferences(previous);
      toast.error(
        error instanceof Error
          ? error.message
          : s("updateFailed", "Failed to update settings"),
      );
    } finally {
      setSavingKey(null);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch("/api/user/export-data");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "user-data.json";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(s("exported", "Data exported successfully"));
      } else {
        toast.error(s("exportFailed", "Failed to export data"));
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error(s("exportFailed", "Failed to export data"));
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        s(
          "deleteConfirm",
          "Are you sure you want to delete your account? This action cannot be undone.",
        ),
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success(s("deleteInitiated", "Account deletion initiated"));
      } else {
        toast.error(s("deleteFailed", "Failed to delete account"));
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(s("deleteFailed", "Failed to delete account"));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {s("title", "Settings")}
        </h1>
        <p className="text-gray-600">
          {s("subtitle", "Manage your account preferences and privacy settings")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="me-2 h-5 w-5" />
            {s("notificationsTitle", "Notification Preferences")}
          </CardTitle>
          <CardDescription>
            {s(
              "notificationsDescription",
              "Choose how you want to be notified about account activity",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
              <Loader2 className="h-4 w-4 animate-spin" />
              {s("loading", "Loading preferences…")}
            </div>
          ) : (
            PREFERENCE_META.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <Label htmlFor={`pref-${item.key}`}>
                    {s(item.labelKey, item.labelFallback)}
                  </Label>
                  <p className="text-sm text-gray-500">
                    {s(item.hintKey, item.hintFallback)}
                  </p>
                </div>
                <Switch
                  id={`pref-${item.key}`}
                  checked={preferences[item.key]}
                  disabled={savingKey !== null}
                  onCheckedChange={(checked) =>
                    void handleSettingChange(item.key, checked)
                  }
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="me-2 h-5 w-5" />
            {s("securityTitle", "Security & Privacy")}
          </CardTitle>
          <CardDescription>
            {s(
              "securityDescription",
              "Password and sign-in security are managed through your account menu.",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {s(
              "securityHint",
              "Use the account menu in the header to update your password, email, or enable two-factor authentication.",
            )}
          </p>
        </CardContent>
      </Card>

      <NewsletterSubscription />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="me-2 h-5 w-5" />
            {s("dataTitle", "Data Management")}
          </CardTitle>
          <CardDescription>
            {s("dataDescription", "Export or delete your account data")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{s("exportData", "Export Data")}</Label>
              <p className="text-sm text-gray-500">
                {s("exportDataHint", "Download a copy of your account data")}
              </p>
            </div>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="me-2 h-4 w-4" />
              {s("export", "Export")}
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start space-x-3">
                <Trash2 className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    {s("deleteAccount", "Delete Account")}
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {s(
                      "deleteAccountHint",
                      "Once you delete your account, there is no going back. Please be certain.",
                    )}
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-3"
                    onClick={handleDeleteAccount}
                  >
                    <Trash2 className="me-2 h-4 w-4" />
                    {s("deleteAccount", "Delete Account")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
