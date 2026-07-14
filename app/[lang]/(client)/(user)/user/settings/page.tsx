"use client";

import { useState } from "react";
import { Bell, Shield, Trash2, Download } from "lucide-react";
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

export default function UserSettingsPage() {
  const dictionary = useDictionary();
  const s = (path: string, fallback: string) =>
    t(dictionary, `userDashboard.settings.${path}`, fallback);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    orderUpdates: true,
    marketingEmails: false,
    twoFactorAuth: false,
    profileVisibility: true,
  });

  const handleSettingChange = async (key: string, value: boolean) => {
    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [key]: value }),
      });

      if (response.ok) {
        setSettings((prev) => ({ ...prev, [key]: value }));
        toast.success(s("updated", "Settings updated successfully"));
      } else {
        toast.error(s("updateFailed", "Failed to update settings"));
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error(s("updateFailed", "Failed to update settings"));
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
      window.confirm(
        s(
          "deleteConfirm",
          "Are you sure you want to delete your account? This action cannot be undone.",
        ),
      )
    ) {
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
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{s("emailNotifications", "Email Notifications")}</Label>
              <p className="text-sm text-gray-500">
                {s("emailNotificationsHint", "Receive notifications via email")}
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) =>
                handleSettingChange("emailNotifications", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{s("pushNotifications", "Push Notifications")}</Label>
              <p className="text-sm text-gray-500">
                {s(
                  "pushNotificationsHint",
                  "Receive push notifications in your browser",
                )}
              </p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(checked) =>
                handleSettingChange("pushNotifications", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{s("orderUpdates", "Order Updates")}</Label>
              <p className="text-sm text-gray-500">
                {s("orderUpdatesHint", "Get notified about order status changes")}
              </p>
            </div>
            <Switch
              checked={settings.orderUpdates}
              onCheckedChange={(checked) =>
                handleSettingChange("orderUpdates", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{s("marketingEmails", "Marketing Emails")}</Label>
              <p className="text-sm text-gray-500">
                {s(
                  "marketingEmailsHint",
                  "Receive promotional offers and updates",
                )}
              </p>
            </div>
            <Switch
              checked={settings.marketingEmails}
              onCheckedChange={(checked) =>
                handleSettingChange("marketingEmails", checked)
              }
            />
          </div>
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
              "Manage your account security and privacy preferences",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{s("twoFactorAuth", "Two-Factor Authentication")}</Label>
              <p className="text-sm text-gray-500">
                {s(
                  "twoFactorAuthHint",
                  "Add an extra layer of security to your account",
                )}
              </p>
            </div>
            <Switch
              checked={settings.twoFactorAuth}
              onCheckedChange={(checked) =>
                handleSettingChange("twoFactorAuth", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{s("profileVisibility", "Profile Visibility")}</Label>
              <p className="text-sm text-gray-500">
                {s(
                  "profileVisibilityHint",
                  "Make your profile visible to other users",
                )}
              </p>
            </div>
            <Switch
              checked={settings.profileVisibility}
              onCheckedChange={(checked) =>
                handleSettingChange("profileVisibility", checked)
              }
            />
          </div>
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
