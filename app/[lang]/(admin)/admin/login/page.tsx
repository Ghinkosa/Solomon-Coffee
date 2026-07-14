import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isUserAdmin } from "@/lib/adminUtils";
import AdminLoginClient from "@/components/admin/AdminLoginClient";

interface AdminLoginPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ redirectTo?: string }>;
}

function safeAdminRedirect(redirectTo: string | undefined, lang: string) {
  const fallback = `/${lang}/admin`;
  if (!redirectTo) return fallback;

  // Only allow same-origin relative admin paths
  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return fallback;
  }

  const normalized = redirectTo.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  if (!normalized.startsWith("/admin")) return fallback;
  if (
    normalized.startsWith("/admin/login") ||
    normalized.startsWith("/admin/access-denied")
  ) {
    return fallback;
  }

  return normalized === redirectTo ? `/${lang}${normalized}` : redirectTo;
}

export default async function AdminLoginPage({
  params,
  searchParams,
}: AdminLoginPageProps) {
  const { lang } = await params;
  const { redirectTo: rawRedirect } = await searchParams;
  const redirectTo = safeAdminRedirect(rawRedirect, lang);

  const user = await currentUser();
  if (user) {
    const email =
      user.primaryEmailAddress?.emailAddress ??
      user.emailAddresses?.[0]?.emailAddress;
    if (isUserAdmin(email)) {
      redirect(redirectTo);
    }
    redirect(`/${lang}/admin/access-denied`);
  }

  return <AdminLoginClient lang={lang} redirectTo={redirectTo} />;
}
