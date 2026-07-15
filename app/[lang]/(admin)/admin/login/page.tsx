import { redirect } from "next/navigation";
import AdminLoginClient from "@/components/admin/AdminLoginClient";
import { resolveAdminAccess } from "@/lib/adminGate";
import { safeAdminRedirect } from "@/lib/safeRedirect";
import { auth } from "@clerk/nextjs/server";

interface AdminLoginPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}

export default async function AdminLoginPage({
  params,
  searchParams,
}: AdminLoginPageProps) {
  const { lang } = await params;
  const { redirectTo: rawRedirect, error } = await searchParams;
  const redirectTo = safeAdminRedirect(rawRedirect, lang);

  const { userId } = await auth();
  if (userId) {
    const gate = await resolveAdminAccess(userId);

    if (gate.status === "admin") {
      redirect(redirectTo);
    }

    if (gate.status === "denied") {
      redirect(`/${lang}/admin/access-denied`);
    }

    // unavailable: stay on login so the user can retry
  }

  return (
    <AdminLoginClient
      lang={lang}
      redirectTo={redirectTo}
      authUnavailable={error === "auth_unavailable"}
    />
  );
}
