"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { showToast } from "@/lib/toast";
import { User, Phone, Calendar, Save, X } from "lucide-react";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";

interface EmailAddress {
  emailAddress: string;
  id: string;
}

interface ClerkUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: EmailAddress[];
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Address {
  _id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  default: boolean;
  type: "home" | "office" | "other";
  createdAt?: string;
  phone?: string;
}

interface SanityUser {
  _id: string;
  clerkUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  phone?: string;
  dateOfBirth?: string;
  profileImage?: {
    asset: {
      _id: string;
      url: string;
    };
  };
  addresses?: Address[];
  preferences?: Record<string, unknown>;
  loyaltyPoints?: number;
  rewardPoints?: number;
  totalSpent?: number;
  lastLogin?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ProfileEditSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    clerk: ClerkUser;
    sanity: SanityUser | null;
  };
}

export default function ProfileEditSidebar({
  isOpen,
  onClose,
  userData,
}: ProfileEditSidebarProps) {
  const dictionary = useDictionary();
  const p = (path: string, fallback: string) =>
    t(dictionary, `userDashboard.profile.${path}`, fallback);
  const e = (path: string, fallback: string) =>
    t(dictionary, `userDashboard.profile.editSidebar.${path}`, fallback);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userData.sanity?.firstName || "",
    lastName: userData.sanity?.lastName || "",
    phone: userData.sanity?.phone || "",
    dateOfBirth: userData.sanity?.dateOfBirth || "",
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          clerkUserId: userData.clerk.id,
        }),
      });

      if (response.ok) {
        showToast.success(
          e("toasts.updatedTitle", "Profile Updated"),
          e("toasts.updatedMessage", "Your profile has been successfully updated."),
        );
        onClose();
        window.location.reload();
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast.error(
        e("toasts.errorTitle", "Error"),
        e("toasts.errorMessage", "Failed to update profile. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{e("title", "Edit Profile")}</span>
          </SheetTitle>
          <SheetDescription>
            {e(
              "description",
              "Update your personal information. Clerk data is read-only.",
            )}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                {e("clerkSection", "Clerk Account (Read-only)")}
              </h3>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-gray-600">
                    {p("firstName", "First Name")}
                  </Label>
                  <div className="text-gray-900 bg-white p-2 rounded border text-sm">
                    {userData.clerk.firstName || p("notProvided", "Not provided")}
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">
                    {p("lastName", "Last Name")}
                  </Label>
                  <div className="text-gray-900 bg-white p-2 rounded border text-sm">
                    {userData.clerk.lastName || p("notProvided", "Not provided")}
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">
                    {p("email", "Email")}
                  </Label>
                  <div className="text-gray-900 bg-white p-2 rounded border text-sm">
                    {userData.clerk.emailAddresses?.[0]?.emailAddress ||
                      p("notProvided", "Not provided")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {e("editableSection", "Additional Information (Editable)")}
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName" className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{e("firstNameOverride", "First Name (Override)")}</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(event) =>
                      handleInputChange("firstName", event.target.value)
                    }
                    placeholder={e("firstNamePlaceholder", "Enter first name")}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {e(
                      "firstNameOverrideHint",
                      "Override Clerk first name for display",
                    )}
                  </p>
                </div>

                <div>
                  <Label htmlFor="lastName" className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{e("lastNameOverride", "Last Name (Override)")}</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(event) =>
                      handleInputChange("lastName", event.target.value)
                    }
                    placeholder={e("lastNamePlaceholder", "Enter last name")}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {e(
                      "lastNameOverrideHint",
                      "Override Clerk last name for display",
                    )}
                  </p>
                </div>

                <div>
                  <Label htmlFor="phone" className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>{p("phoneNumber", "Phone Number")}</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(event) => handleInputChange("phone", event.target.value)}
                    placeholder={e("phonePlaceholder", "Enter phone number")}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="dateOfBirth"
                    className="flex items-center space-x-1"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>{p("dateOfBirth", "Date of Birth")}</span>
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(event) =>
                      handleInputChange("dateOfBirth", event.target.value)
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-6 border-t">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{e("saving", "Saving...")}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>{e("saveChanges", "Save Changes")}</span>
                </div>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              {p("cancel", "Cancel")}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
