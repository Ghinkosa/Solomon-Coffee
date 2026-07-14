import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isUserAdmin } from "@/lib/adminUtils";
import AdminPackaging from "@/components/admin/AdminPackaging";

export default async function AdminPackagingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect(`/${lang}/admin/login?redirectTo=/${lang}/admin/packaging`);
  }

  const clerk = await clerkClient();
  const currentUser = await clerk.users.getUser(userId);
  const userEmail = currentUser.primaryEmailAddress?.emailAddress;

  if (!userEmail || !isUserAdmin(userEmail)) {
    redirect(`/${lang}/admin/access-denied`);
  }

  return <AdminPackaging />;
}
