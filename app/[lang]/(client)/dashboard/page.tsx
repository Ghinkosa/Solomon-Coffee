import { redirect } from "next/navigation";

export default async function DashboardRedirect({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}/user/dashboard`);
}
