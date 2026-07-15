import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { resolveAdminAccess } from "@/lib/adminGate";
import AdminNotifications from "@/components/admin/AdminNotifications";

const AdminNotificationsPage = async ({
  params,
}: {
  params: Promise<{ lang: string }>;
}) => {
  const { lang } = await params;
  const { userId } = await auth();
  const gate = await resolveAdminAccess(userId);

  if (gate.status === "unauthenticated") {
    redirect(`/${lang}/admin/login?redirectTo=/${lang}/admin/notifications`);
  }
  if (gate.status !== "admin") {
    redirect(`/${lang}/admin/access-denied`);
  }

  return <AdminNotifications adminEmail={gate.email} />;
};

export default AdminNotificationsPage;
