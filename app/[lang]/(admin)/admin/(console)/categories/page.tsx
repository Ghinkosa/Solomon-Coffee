import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isUserAdmin } from "@/lib/adminUtils";
import AdminCategories from "@/components/admin/AdminCategories";

export default async function AdminCategoriesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect(`/${lang}/admin/login?redirectTo=/${lang}/admin/categories`);
  }

  const clerk = await clerkClient();
  const currentUser = await clerk.users.getUser(userId);
  const userEmail = currentUser.primaryEmailAddress?.emailAddress;

  if (!userEmail || !isUserAdmin(userEmail)) {
    redirect(`/${lang}/admin/access-denied`);
  }

  return <AdminCategories />;
}
