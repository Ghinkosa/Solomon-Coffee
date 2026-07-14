"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface AdminAuthGuardProps {
  children: React.ReactNode;
  // Admin status is resolved on the server (where ADMIN_EMAIL is readable) and
  // passed in, so this guard never depends on client-only env vars.
  isAdmin: boolean;
}

const AdminAuthGuard = ({ children, isAdmin }: AdminAuthGuardProps) => {
  const router = useRouter();
  const params = useParams();
  const lang = typeof params?.lang === "string" ? params.lang : "en";

  useEffect(() => {
    if (!isAdmin) {
      router.push(`/${lang}/admin/access-denied`);
    }
  }, [isAdmin, router, lang]);

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
};

export default AdminAuthGuard;
