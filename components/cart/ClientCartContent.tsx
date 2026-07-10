"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { ServerCartContent } from "./ServerCartContent";
import { CartSkeleton } from "./CartSkeleton";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";
import type { Dictionary } from "@/lib/dictionary-context";

// Interface for Address
interface Address {
  _id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  default: boolean;
  createdAt: string;
}

// Interface for UserOrder
interface UserOrder {
  _id: string;
  orderNumber: string;
  totalPrice: number;
  status: string;
  orderDate: string;
}

// Interface strictly matching your Sanity "packaging" schema
export interface PackagingOption {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  price: number;
  default: boolean;
  image?: any;
}

interface UserData {
  addresses: Address[];
  orders: UserOrder[];
  packagingOptions: PackagingOption[]; 
}

export function ClientCartContent() {
  const { user, isLoaded } = useUser();
  const dictionary = useDictionary() as Dictionary;
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    if (!isLoaded || !user) return;

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      setError(
        t(dictionary, "cart.errors.emailNotFound", "Email not found. Please contact support."),
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/user-data?email=${encodeURIComponent(userEmail)}`
      );

      if (!response.ok) {
        throw new Error(
          t(dictionary, "cart.errors.loadUserData", "Failed to load user data"),
        );
      }

      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t(dictionary, "cart.errors.loadUserData", "Failed to load user data"),
      );
    } finally {
      setLoading(false);
    }
  }, [isLoaded, user, dictionary]);

  const refreshAddresses = async () => {
    if (!user) return;
    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) return;

    try {
      const response = await fetch(
        `/api/user-data?email=${encodeURIComponent(userEmail)}`
      );
      if (!response.ok) throw new Error("Failed to refresh addresses");
      const data = await response.json();
      setUserData((prev) =>
        prev ? { ...prev, addresses: data.addresses } : data
      );
    } catch (err) {
      console.error("Failed to refresh addresses:", err);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchUserData();
  }, [user, isLoaded, fetchUserData]);

  if (!isLoaded || (user && loading)) return <CartSkeleton />;

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 font-medium">{error}</p>
        <button 
          onClick={() => fetchUserData()} 
          className="mt-4 text-sm text-primary underline"
        >
          {t(dictionary, "common.tryAgain", "Try again")}
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <ServerCartContent
        userEmail=""
        userId="guest"
        userAddresses={[]}
        isGuest
      />
    );
  }

  const userEmail = user.emailAddresses[0]?.emailAddress || "";

  return (
    <ServerCartContent
      userEmail={userEmail}
      userId={user.id}
      userAddresses={userData?.addresses || []}
      userOrders={userData?.orders || []}
      onAddressesRefresh={refreshAddresses}
    />
  );
}