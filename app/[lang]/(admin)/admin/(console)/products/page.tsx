import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isUserAdmin } from "@/lib/adminUtils";
import { getAdminCategories } from "@/sanity/queries";
import AdminProducts from "@/components/admin/AdminProducts";

const AdminProductsPage = async ({
  params,
}: {
  params: Promise<{ lang: string }>;
}) => {
  const { lang } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect(`/${lang}/admin/login?redirectTo=/${lang}/admin/products`);
  }

  const clerk = await clerkClient();
  const currentUser = await clerk.users.getUser(userId);
  const userEmail = currentUser.primaryEmailAddress?.emailAddress;

  if (!userEmail || !isUserAdmin(userEmail)) {
    redirect(`/${lang}/admin/access-denied`);
  }

  const categories = await getAdminCategories();

  return <AdminProducts initialCategories={categories} />;
};

export default AdminProductsPage;
