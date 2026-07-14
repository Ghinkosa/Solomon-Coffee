"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Shield, ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Container from "@/components/Container";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";

export default function AccessDeniedContent() {
  const params = useParams();
  const lang = typeof params?.lang === "string" ? params.lang : "en";
  const dictionary = useDictionary();

  return (
    <Container className="py-10">
      <div className="mx-auto max-w-md">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-700">
              {t(
                dictionary,
                "authPages.adminAccessDenied.title",
                "Access Denied",
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              {t(
                dictionary,
                "authPages.adminAccessDenied.description",
                "You don't have permission to access the admin panel. Staff should sign in at the admin login URL with an authorized account.",
              )}
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href={`/${lang}/admin/login`}>
                  <LogIn className="me-2 h-4 w-4" />
                  {t(
                    dictionary,
                    "authPages.adminAccessDenied.adminLogin",
                    "Go to admin login",
                  )}
                </Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href={`/${lang}`}>
                  <ArrowLeft className="me-2 h-4 w-4" />
                  {t(
                    dictionary,
                    "authPages.adminAccessDenied.backHome",
                    "Back to Home",
                  )}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
