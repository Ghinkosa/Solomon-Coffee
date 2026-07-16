"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useUser } from "@clerk/nextjs";

type AccountDiscountType = "business" | "premium" | null;

interface UserData {
  ordersCount: number;
  isEmployee: boolean;
  isAdmin: boolean;
  unreadNotifications: number;
  accountDiscountRate: number;
  accountDiscountType: AccountDiscountType;
  businessDiscountPercent: number;
  premiumDiscountPercent: number;
  isLoading: boolean;
}

interface UserDataContextType extends UserData {
  refreshUserData: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined,
);

let cachedData: UserData | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000;

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [userData, setUserData] = useState<UserData>({
    ordersCount: 0,
    isEmployee: false,
    isAdmin: false,
    unreadNotifications: 0,
    accountDiscountRate: 0,
    accountDiscountType: null,
    businessDiscountPercent: 2,
    premiumDiscountPercent: 5,
    isLoading: false,
  });

  const fetchUserData = useCallback(
    async (forceRefresh = false) => {
      if (!user || !isLoaded) return;

      const now = Date.now();
      if (
        !forceRefresh &&
        cachedData &&
        now - cacheTimestamp < CACHE_DURATION
      ) {
        setUserData(cachedData);
        return;
      }

      setUserData((prev) => ({ ...prev, isLoading: true }));

      try {
        const response = await fetch("/api/user/combined-data", {
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();

          const newUserData = {
            ordersCount: data.ordersCount || 0,
            isEmployee: data.isEmployee || false,
            isAdmin: data.isAdmin || false,
            unreadNotifications: data.unreadNotifications || 0,
            accountDiscountRate: data.accountDiscountRate || 0,
            accountDiscountType: data.accountDiscountType || null,
            businessDiscountPercent:
              typeof data.businessDiscountPercent === "number"
                ? data.businessDiscountPercent
                : 2,
            premiumDiscountPercent:
              typeof data.premiumDiscountPercent === "number"
                ? data.premiumDiscountPercent
                : 5,
            isLoading: false,
          };

          cachedData = newUserData;
          cacheTimestamp = now;

          setUserData(newUserData);
        } else {
          setUserData((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserData((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [user, isLoaded],
  );

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserData();
    }
  }, [user, isLoaded, fetchUserData]);

  const refreshUserData = useCallback(async () => {
    await fetchUserData(true);
  }, [fetchUserData]);

  return (
    <UserDataContext.Provider
      value={{
        ...userData,
        refreshUserData,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
}
