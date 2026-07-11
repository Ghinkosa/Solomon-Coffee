import { redirect } from "next/navigation";

// Legacy page — user management now lives under /admin.
export default async function LegacyManageUsersRedirect({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}/admin/users`);
}
