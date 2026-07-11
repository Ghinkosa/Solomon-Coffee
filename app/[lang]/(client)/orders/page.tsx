import { redirect } from "next/navigation";

export default async function OrdersRedirect({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}/user/orders`);
}
