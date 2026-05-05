"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { ServerCartContent } from "./ServerCartContent";
import { CartSkeleton } from "./CartSkeleton";
import Link from "next/link";
import { Button } from "../ui/button";

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

// Fixed: Interface strictly matching your Sanity "packaging" schema
export interface PackagingOption {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  price: number;
  default: boolean;
  image?: any; // Sanity image object
}

interface UserData {
  addresses: Address[];
  orders: UserOrder[];
  packagingOptions: PackagingOption[]; 
}

export function ClientCartContent() {
  const { user, isLoaded } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    if (!isLoaded || !user) return;

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      setError("Email not found. Please contact support.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/user-data?email=${encodeURIComponent(userEmail)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user data");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, user]);

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
    fetchUserData();
  }, [user, fetchUserData]);

  if (!isLoaded || loading) return <CartSkeleton />;

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 font-medium">{error}</p>
        <button 
          onClick={() => fetchUserData()} 
          className="mt-4 text-sm text-primary underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 border rounded-lg bg-gray-50">
        <p className="text-muted-foreground">Please sign in to view your cart.</p>
        <Link href="/sign-in" className="mt-4 inline-block">
           <Button>Sign In</Button>
        </Link>
      </div>
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