import { redirect } from "next/navigation";

// Legacy page — the account requests admin now lives under /admin.
export default async function LegacyBusinessAccountsRedirect({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}/admin/account-requests`);
}
