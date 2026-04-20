"use client";

import React, { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useIsAdmin } from "@/lib/adminUtils";
import Container from "@/components/Container";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

const AdminAuthGuard = ({ children }: AdminAuthGuardProps) => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const isAdmin = useIsAdmin(user?.primaryEmailAddress?.emailAddress);

  useEffect(() => {
    if (isLoaded && !isAdmin) {
      router.push("/admin/access-denied");
    }
  }, [isLoaded, isAdmin, router]);

  if (!isLoaded) {
    return (
      <Container className="py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-shop_dark_green"></div>
        </div>
      </Container>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
};

export default AdminAuthGuard;
