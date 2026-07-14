import { redirect } from "next/navigation";

export default async function AdminAnalyticsRedirect({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}/admin`);
}
