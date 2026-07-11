"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { showToast } from "@/lib/toast";
import LocationSelector from "@/components/ui/location-selector";
import { MapPin, Save, X, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";

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
  phone?: string;
  subArea?: string;
  countryCode?: string;
  stateCode?: string;
}

interface AddressEditSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  address?: Address | null;
  userId: string;
  onAddressChange?: () => void;
}

export default function AddressEditSidebar({
  isOpen,
  onClose,
  address,
  userId,
  onAddressChange,
}: AddressEditSidebarProps) {
  const dictionary = useDictionary();
  const p = (path: string, fallback: string) =>
    t(dictionary, `userDashboard.profile.${path}`, fallback);
  const a = (path: string, fallback: string) =>
    t(dictionary, `userDashboard.profile.addressSidebar.${path}`, fallback);

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState<Address>({
    _id: address?._id || "",
    name: address?.name || "",
    address: address?.address || "",
    city: address?.city || "",
    state: address?.state || "",
    zip: address?.zip || "",
    country: address?.country || "",
    countryCode: address?.countryCode || "",
    stateCode: address?.stateCode || "",
    subArea: address?.subArea || "",
    default: address?.default || false,
    type: address?.type || "home",
    phone: address?.phone || "",
  });

  const isEditing = !!address?._id;

  const handleLocationChange = (location: {
    country: string;
    countryCode: string;
    state: string;
    stateCode: string;
    city: string;
    subArea?: string;
    zipCode?: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      country: location.country,
      countryCode: location.countryCode,
      state: location.state,
      stateCode: location.stateCode,
      city: location.city,
      subArea: location.subArea || "",
      zip: location.zipCode || "",
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (
      !formData.name ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.zip ||
      !formData.country
    ) {
      showToast.error(
        a("toasts.validationTitle", "Validation Error"),
        a(
          "toasts.validationMessage",
          "Please fill in all required fields including location details.",
        ),
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/user/addresses", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showToast.success(
          isEditing
            ? a("toasts.updatedTitle", "Address Updated")
            : a("toasts.addedTitle", "Address Added"),
          a("toasts.savedMessage", "Your address has been successfully {action}.")
            .replace(
              "{action}",
              isEditing
                ? a("toasts.updatedAction", "updated")
                : a("toasts.addedAction", "added"),
            ),
        );
        onClose();
        if (onAddressChange) {
          onAddressChange();
        }
      } else {
        console.error("API Error:", result);
        throw new Error(
          result.error ||
            (isEditing
              ? a("toasts.updateFailed", "Failed to update address")
              : a("toasts.addFailed", "Failed to add address")),
        );
      }
    } catch (error) {
      console.error("Error saving address:", error);
      showToast.error(
        a("toasts.errorTitle", "Error"),
        error instanceof Error
          ? error.message
          : `${isEditing ? a("toasts.updateFailed", "Failed to update address") : a("toasts.addFailed", "Failed to add address")}. ${a("toasts.retryMessage", "Please try again.")}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    if (!isEditing || !address?._id) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!address?._id) return;

    setDeleteLoading(true);
    setShowDeleteModal(false);

    try {
      const response = await fetch(`/api/user/addresses`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ addressId: address._id }),
      });

      if (response.ok) {
        showToast.success(
          a("toasts.deletedTitle", "Address Deleted"),
          a("toasts.deletedMessage", "Your address has been successfully deleted."),
        );
        onClose();
        if (onAddressChange) {
          onAddressChange();
        }
      } else {
        throw new Error("Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      showToast.error(
        a("toasts.errorTitle", "Error"),
        a(
          "toasts.deleteErrorMessage",
          "Failed to delete address. Please try again.",
        ),
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleInputChange = (field: keyof Address, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
          <SheetTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>
              {isEditing
                ? a("editTitle", "Edit Shipping Address")
                : a("addTitle", "Add Shipping Address")}
            </span>
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? a("editDescription", "Update your shipping address information.")
              : a("addDescription", "Add a new shipping address to your account.")}
          </SheetDescription>
        </SheetHeader>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">{a("addressName", "Address Name *")}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(event) => handleInputChange("name", event.target.value)}
                placeholder={a(
                  "addressNamePlaceholder",
                  "e.g., Home, Office, Mom's House",
                )}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">{p("phoneNumber", "Phone Number")}</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(event) => handleInputChange("phone", event.target.value)}
                placeholder={a("phonePlaceholder", "e.g., (555) 123-4567")}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="type">{a("addressType", "Address Type")}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  handleInputChange("type", value as "home" | "office" | "other")
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue
                    placeholder={a("addressTypePlaceholder", "Select address type")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">
                    {a("types.home", "Home")}
                  </SelectItem>
                  <SelectItem value="office">
                    {a("types.office", "Office")}
                  </SelectItem>
                  <SelectItem value="other">
                    {a("types.other", "Other")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="address">{a("streetAddress", "Street Address *")}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(event) =>
                  handleInputChange("address", event.target.value)
                }
                placeholder={a(
                  "streetAddressPlaceholder",
                  "Enter your street address (house number, street name, apartment/unit)",
                )}
                required
                className="mt-1"
              />
            </div>

            <div>
              <LocationSelector
                value={{
                  country: formData.country,
                  countryCode: formData.countryCode || "",
                  state: formData.state,
                  stateCode: formData.stateCode || "",
                  city: formData.city,
                  subArea: formData.subArea || "",
                  zipCode: formData.zip,
                }}
                onChange={handleLocationChange}
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="default" className="text-sm font-medium">
                  {a("defaultAddress", "Set as Default Address")}
                </Label>
                <p className="text-xs text-gray-500">
                  {a(
                    "defaultAddressHint",
                    "This address will be used as your primary shipping address",
                  )}
                </p>
              </div>
              <Switch
                id="default"
                checked={formData.default}
                onCheckedChange={(checked) => handleInputChange("default", checked)}
              />
            </div>

            <div className="flex space-x-3 pt-6 border-t">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>
                      {isEditing
                        ? a("updating", "Updating...")
                        : a("adding", "Adding...")}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>
                      {isEditing
                        ? a("updateAddress", "Update Address")
                        : a("addAddressButton", "Add Address")}
                    </span>
                  </div>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading || deleteLoading}
              >
                <X className="h-4 w-4 mr-2" />
                {p("cancel", "Cancel")}
              </Button>
            </div>

            {isEditing && (
              <div className="pt-4 border-t">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteClick}
                  disabled={deleteLoading || loading}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {p("deleteAddress", "Delete Address")}
                </Button>
              </div>
            )}
          </form>
        </div>
      </SheetContent>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            className={cn(
              "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
            )}
          >
            <VisuallyHidden.Root>
              <DialogTitle>{p("deleteAddressTitle", "Delete Address")}</DialogTitle>
            </VisuallyHidden.Root>
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border-4 border-red-100">
                <AlertTriangle className="h-8 w-8 text-red-600 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {p("deleteAddressTitle", "Delete Address")}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {p(
                    "deleteAddressConfirm",
                    "Are you sure you want to delete {name}? This action cannot be undone.",
                  ).replace("{name}", address?.name ?? "")}
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 border-gray-300 hover:bg-gray-50 font-medium"
                disabled={deleteLoading}
              >
                {p("cancel", "Cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500 font-semibold shadow-lg hover:shadow-red-200"
              >
                {deleteLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{p("deleting", "Deleting...")}</span>
                  </div>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {p("deleteAddress", "Delete Address")}
                  </>
                )}
              </Button>
            </div>
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">{p("close", "Close")}</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </Sheet>
  );
}
