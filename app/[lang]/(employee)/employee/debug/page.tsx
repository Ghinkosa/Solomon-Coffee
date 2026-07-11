import { redirect } from "next/navigation";

export default async function EmployeeDebugRedirect({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}/employee/dashboard`);
}
