"use client";

import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Shield, Lock, BarChart3, Package, Loader2 } from "lucide-react";
import { Suspense } from "react";
import Logo from "@/components/common/Logo";
import Container from "@/components/Container";
import { contactConfig } from "@/config/contact";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";
import farmDroneShot from "@/images/farm/farm-drone-shot.webp";

interface AdminLoginClientProps {
  lang: string;
  redirectTo: string;
  authUnavailable?: boolean;
}

function AdminLoginForm({
  lang,
  redirectTo,
  authUnavailable,
}: AdminLoginClientProps) {
  const dictionary = useDictionary();
  const company = contactConfig.company.name;

  const features = [
    {
      icon: BarChart3,
      title: t(
        dictionary,
        "authPages.adminSignIn.features.analytics.title",
        "Orders & revenue",
      ),
      description: t(
        dictionary,
        "authPages.adminSignIn.features.analytics.description",
        "Track sales, fulfill orders, and monitor performance.",
      ),
    },
    {
      icon: Package,
      title: t(
        dictionary,
        "authPages.adminSignIn.features.catalog.title",
        "Catalog operations",
      ),
      description: t(
        dictionary,
        "authPages.adminSignIn.features.catalog.description",
        "Manage products, inventory signals, and account requests.",
      ),
    },
    {
      icon: Lock,
      title: t(
        dictionary,
        "authPages.adminSignIn.features.secure.title",
        "Staff-only access",
      ),
      description: t(
        dictionary,
        "authPages.adminSignIn.features.secure.description",
        "This portal is restricted to authorized admin accounts.",
      ),
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-950 text-stone-100">
      <Image
        src={farmDroneShot}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-stone-950/78" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(180,83,9,0.22)_0%,transparent_45%),radial-gradient(circle_at_80%_80%,rgba(28,25,23,0.55)_0%,transparent_50%)]" />

      <Container className="relative z-10">
        <header className="flex items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium tracking-wide text-stone-300">
              {t(dictionary, "authPages.adminSignIn.badge", "Admin Portal")}
            </span>
          </div>
          <Logo lang={lang} theme="dark" showText={false} />
        </header>

        <div className="flex min-h-[calc(100vh-120px)] flex-col lg:flex-row">
          <div className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
            <div className="mx-auto max-w-md lg:mx-0 lg:max-w-lg">
              <h1 className="mb-4 font-serif text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl">
                {t(
                  dictionary,
                  "authPages.adminSignIn.title",
                  "Staff sign in",
                )}
              </h1>
              <p className="mb-8 text-base leading-relaxed text-stone-300">
                {t(
                  dictionary,
                  "authPages.adminSignIn.description",
                  "Sign in with your admin account to open the {company} operations console.",
                ).replace("{company}", company)}
              </p>

              <div className="space-y-5">
                {features.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3">
                    <div className="shrink-0 rounded-lg bg-amber-500/15 p-2 backdrop-blur-sm">
                      <feature.icon className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="mb-0.5 text-sm font-semibold text-stone-100">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-stone-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-sm text-stone-400">
                {t(
                  dictionary,
                  "authPages.adminSignIn.customerHint",
                  "Shopping as a customer?",
                )}{" "}
                <Link
                  href={`/${lang}/sign-in`}
                  className="text-amber-500 transition-colors hover:text-amber-400"
                >
                  {t(
                    dictionary,
                    "authPages.adminSignIn.customerSignIn",
                    "Use the customer sign-in",
                  )}
                </Link>
              </p>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
            <div className="flex w-full max-w-md flex-col items-center rounded-2xl border border-white/10 bg-stone-950/75 p-4 shadow-2xl backdrop-blur-md sm:p-5">
              {authUnavailable ? (
                <div className="mb-4 w-full rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                  Auth service was temporarily unreachable. Stay signed in and
                  refresh, or sign in again to continue.
                </div>
              ) : null}
              <div className="clerk-sign-in admin-clerk-sign-in w-full">
                <SignIn
                  routing="hash"
                  forceRedirectUrl={redirectTo}
                  fallbackRedirectUrl={redirectTo}
                  appearance={{
                    elements: {
                      rootBox: "w-full mx-auto",
                      cardBox: "w-full mx-auto",
                      card: "w-full mx-auto shadow-none",
                      footerAction: { display: "none" },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function AdminLoginClient(props: AdminLoginClientProps) {
  return (
    <Suspense
      fallback={
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stone-950">
          <Image
            src={farmDroneShot}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            aria-hidden
          />
          <div className="absolute inset-0 bg-stone-950/80" />
          <Loader2 className="relative z-10 h-8 w-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <AdminLoginForm {...props} />
    </Suspense>
  );
}
