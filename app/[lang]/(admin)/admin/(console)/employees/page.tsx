import { Metadata } from "next";
import Link from "next/link";
import EmployeeManagement from "@/components/admin/EmployeeManagement";
import { isEmployeeOpsEnabled } from "@/lib/featureFlags";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Employee Management | Admin",
  description: "Manage employee roles and permissions",
};

export default async function EmployeeManagementPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isEmployeeOpsEnabled()) {
    return (
      <div className="p-6">
        <Card className="border-shop_dark_green/15 bg-shop_light_bg/60">
          <CardHeader>
            <CardTitle className="text-shop_dark_green">
              Employee ops is turned off
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-light-color">
            <p>
              Role assignment and task delegation stay in the codebase as an
              add-on. Enable with{" "}
              <code className="rounded bg-white px-1.5 py-0.5 text-xs">
                NEXT_PUBLIC_EMPLOYEE_OPS_ENABLED=true
              </code>{" "}
              when you want them live.
            </p>
            <Button
              asChild
              variant="outline"
              className="border-shop_dark_green/20"
            >
              <Link href={`/${lang}/admin/users`}>Back to Users</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <EmployeeManagement />;
}
