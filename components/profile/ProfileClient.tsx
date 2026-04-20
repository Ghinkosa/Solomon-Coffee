"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit,
  Plus,
  Home,
  CheckCircle,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { showToast } from "@/lib/toast";
import ProfileEditSidebar from "./ProfileEditSidebar";
import AddressEditSidebar from "./AddressEditSidebar";

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

interface ProfileClientProps {
  userData: {
    clerk: ClerkUser;
    sanity: SanityUser | null;
  };
}

export default function ProfileClient({ userData }: ProfileClientProps) {
  const { clerk, sanity } = userData;
  const [profileSidebarOpen, setProfileSidebarOpen] = useState(false);
  const [addressSidebarOpen, setAddressSidebarOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>(
    sanity?.addresses || []
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const displayName =
    clerk.firstName && clerk.lastName
      ? `${clerk.firstName} ${clerk.lastName}`
      : sanity?.firstName && sanity?.lastName
      ? `${sanity.firstName} ${sanity.lastName}`
      : clerk.firstName || sanity?.firstName || "User";

  const displayEmail =
    clerk.emailAddresses?.[0]?.emailAddress || sanity?.email || "";

  // Fetch addresses in real-time
  const fetchAddresses = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/user/addresses");
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleAddressChange = useCallback(() => {
    fetchAddresses();
    setSelectedAddresses([]);
  }, [fetchAddresses]);

  const handleEditProfile = () => {
    setProfileSidebarOpen(true);
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressSidebarOpen(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressSidebarOpen(true);
  };

  const handleDeleteClick = (address: Address) => {
    setAddressToDelete(address);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!addressToDelete?._id) return;

    setIsDeleting(true);

    try {
      const response = await fetch("/api/user/addresses", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ addressId: addressToDelete._id }),
      });

      if (response.ok) {
        showToast.success(
          "Address Deleted",
          "Your address has been successfully deleted."
        );
        setShowDeleteModal(false);
        setAddressToDelete(null);
        fetchAddresses();
      } else {
        throw new Error("Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      showToast.error("Error", "Failed to delete address. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAddress = (addressId: string, checked: boolean) => {
    if (checked) {
      setSelectedAddresses((prev) => [...prev, addressId]);
    } else {
      setSelectedAddresses((prev) => prev.filter((id) => id !== addressId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAddresses(addresses.map((addr) => addr._id || ""));
    } else {
      setSelectedAddresses([]);
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedAddresses.length === 0) return;
    setShowBulkDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    setIsDeleting(true);

    try {
      const deletePromises = selectedAddresses.map((addressId) =>
        fetch("/api/user/addresses", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ addressId }),
        })
      );

      const results = await Promise.all(deletePromises);
      const allSuccessful = results.every((res) => res.ok);

      if (allSuccessful) {
        showToast.success(
          "Addresses Deleted",
          `Successfully deleted ${selectedAddresses.length} ${
            selectedAddresses.length === 1 ? "address" : "addresses"
          }.`
        );
        setShowBulkDeleteModal(false);
        setSelectedAddresses([]);
        fetchAddresses();
      } else {
        throw new Error("Some addresses failed to delete");
      }
    } catch (error) {
      console.error("Error deleting addresses:", error);
      showToast.error(
        "Error",
        "Failed to delete some addresses. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="mb-8">
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={clerk.imageUrl || sanity?.profileImage?.asset?.url}
                    alt={displayName}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {displayName}
                  </h1>
                  <p className="text-gray-600 flex items-center mt-1">
                    <Mail className="h-4 w-4 mr-2" />
                    {displayEmail}
                  </p>
                  {sanity?.phone && (
                    <p className="text-gray-600 flex items-center mt-1">
                      <Phone className="h-4 w-4 mr-2" />
                      {sanity.phone}
                    </p>
                  )}
                </div>
              </div>
              <Button
                onClick={handleEditProfile}
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">
                    {new Date(clerk.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {sanity?.rewardPoints !== undefined && (
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Reward Points</p>
                    <p className="font-medium">{sanity.rewardPoints}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Status</p>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-200"
                  >
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Personal Information */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  First Name
                </label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded-md">
                  {clerk.firstName || "Not provided"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  From Clerk (Read-only)
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Last Name
                </label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded-md">
                  {clerk.lastName || "Not provided"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  From Clerk (Read-only)
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded-md">
                  {displayEmail}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  From Clerk (Read-only)
                </p>
              </div>

              {sanity && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Phone Number
                    </label>
                    <p className="text-gray-900 bg-white border p-2 rounded-md">
                      {sanity.phone || "Not provided"}
                    </p>
                    <p className="text-xs text-blue-500 mt-1">
                      Editable in profile
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Date of Birth
                    </label>
                    <p className="text-gray-900 bg-white border p-2 rounded-md">
                      {sanity.dateOfBirth
                        ? new Date(sanity.dateOfBirth).toLocaleDateString()
                        : "Not provided"}
                    </p>
                    <p className="text-xs text-blue-500 mt-1">
                      Editable in profile
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Account Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Reward Points</span>
                <span className="font-bold text-blue-600">
                  {sanity?.rewardPoints || 0}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">Total Spent</span>
                <span className="font-bold text-green-600">
                  ${sanity?.totalSpent || 0}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-gray-700">Loyalty Points</span>
                <span className="font-bold text-purple-600">
                  {sanity?.loyaltyPoints || 0}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Last Login</span>
                <span className="font-medium text-gray-600">
                  {sanity?.lastLogin
                    ? new Date(sanity.lastLogin).toLocaleDateString()
                    : "Today"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipping Addresses */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Shipping Addresses</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              {selectedAddresses.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleBulkDeleteClick}
                  className="flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete ({selectedAddresses.length})</span>
                </Button>
              )}
              <Button
                onClick={handleAddAddress}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Address</span>
              </Button>
            </div>
          </div>
          {addresses.length > 1 && (
            <div className="flex items-center space-x-2 mt-3 pt-3 border-t">
              <Checkbox
                id="select-all"
                checked={
                  selectedAddresses.length === addresses.length &&
                  addresses.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Select All
              </label>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {addresses && addresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className={cn(
                    "border rounded-lg p-4 space-y-3 transition-all",
                    selectedAddresses.includes(address._id || "")
                      ? "border-blue-500 bg-blue-50/50 shadow-md"
                      : "hover:shadow-md"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {addresses.length > 1 && (
                        <Checkbox
                          id={`address-${address._id}`}
                          checked={selectedAddresses.includes(
                            address._id || ""
                          )}
                          onCheckedChange={(checked) =>
                            handleSelectAddress(
                              address._id || "",
                              checked as boolean
                            )
                          }
                        />
                      )}
                      <Home className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{address.name}</span>
                    </div>
                    {address.default && (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-200"
                      >
                        Default
                      </Badge>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{address.address}</p>
                    <p>
                      {address.city}, {address.state} {address.zip}
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditAddress(address)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(address)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No shipping addresses found</p>
              <Button onClick={handleAddAddress} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Address
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Edit Sidebar */}
      {profileSidebarOpen && (
        <ProfileEditSidebar
          isOpen={profileSidebarOpen}
          onClose={() => setProfileSidebarOpen(false)}
          userData={userData}
        />
      )}

      {/* Address Edit Sidebar */}
      {addressSidebarOpen && (
        <AddressEditSidebar
          isOpen={addressSidebarOpen}
          onClose={() => setAddressSidebarOpen(false)}
          address={editingAddress}
          userId={clerk.id}
          onAddressChange={handleAddressChange}
        />
      )}

      {/* Single Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            className={cn(
              "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg"
            )}
          >
            <VisuallyHidden.Root>
              <DialogTitle>Delete Address Confirmation</DialogTitle>
            </VisuallyHidden.Root>
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border-4 border-red-100">
                <AlertTriangle className="h-8 w-8 text-red-600 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">
                  Delete Address
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-red-600">
                    {addressToDelete?.name}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 border-gray-300 hover:bg-gray-50 font-medium"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500 font-semibold shadow-lg hover:shadow-red-200"
              >
                {isDeleting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </div>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Address
                  </>
                )}
              </Button>
            </div>
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      {/* Bulk Delete Confirmation Modal */}
      <Dialog open={showBulkDeleteModal} onOpenChange={setShowBulkDeleteModal}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            className={cn(
              "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg"
            )}
          >
            <VisuallyHidden.Root>
              <DialogTitle>Delete Multiple Addresses Confirmation</DialogTitle>
            </VisuallyHidden.Root>
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border-4 border-red-100">
                <AlertTriangle className="h-8 w-8 text-red-600 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">
                  Delete Multiple Addresses
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  You&apos;re about to delete{" "}
                  <span className="font-semibold text-red-600">
                    {selectedAddresses.length}{" "}
                    {selectedAddresses.length === 1 ? "address" : "addresses"}
                  </span>
                  . This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <Button
                variant="outline"
                onClick={() => setShowBulkDeleteModal(false)}
                className="flex-1 border-gray-300 hover:bg-gray-50 font-medium"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmBulkDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500 font-semibold shadow-lg hover:shadow-red-200"
              >
                {isDeleting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </div>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete {selectedAddresses.length}{" "}
                    {selectedAddresses.length === 1 ? "Address" : "Addresses"}
                  </>
                )}
              </Button>
            </div>
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
