import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "./i18n-config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { resolveAdminAccess } from "@/lib/adminGate";

const isProtectedRoute = createRouteMatcher([
  "/user(.*)",
  "/settings(.*)",
  "/:locale/user(.*)",
  "/:locale/settings(.*)",
]);

const isAdminApiRoute = createRouteMatcher(["/api/admin(.*)"]);
const isDebugApiRoute = createRouteMatcher(["/api/debug(.*)"]);

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/:locale/admin(.*)"]);

function getLocaleFromPath(pathname: string): string {
  return (
    i18n.locales.find(
      (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`,
    ) ?? i18n.defaultLocale
  );
}

function isPublicAdminPath(pathname: string): boolean {
  return (
    pathname.includes("/admin/login") ||
    pathname.includes("/admin/access-denied")
  );
}

function getLocale(request: NextRequest): string | undefined {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const locales = i18n.locales as unknown as string[];
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales,
  );

  return matchLocale(languages, locales, i18n.defaultLocale);
}

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;
  const searchParams = req.nextUrl.searchParams;

  // 1. Locale prefix
  if (
    !pathname.startsWith("/_next") &&
    !pathname.includes("/api/") &&
    !pathname.startsWith("/studio") &&
    !pathname.includes(".")
  ) {
    const pathnameIsMissingLocale = i18n.locales.every(
      (locale) =>
        !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
    );

    if (pathnameIsMissingLocale) {
      const locale = getLocale(req);
      let newPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
      const newUrl = new URL(`/${locale}${newPathname}`, req.url);
      searchParams.forEach((value, key) => {
        newUrl.searchParams.set(key, value);
      });
      return NextResponse.redirect(newUrl);
    }
  }

  // 2. Protect admin/debug API routes
  if (isDebugApiRoute(req) && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (isAdminApiRoute(req) || isDebugApiRoute(req)) {
    const authResult = await auth();
    const gate = await resolveAdminAccess(authResult.userId);

    if (gate.status === "unauthenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (gate.status === "denied") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (gate.status === "unavailable") {
      // Clerk outage — do not pretend the user is forbidden.
      return NextResponse.json(
        {
          error: "Auth service temporarily unavailable",
          message: "Could not verify admin access. Please retry.",
        },
        { status: 503 },
      );
    }

    return NextResponse.next();
  }

  // 3. Admin console pages
  if (isAdminRoute(req) && !isPublicAdminPath(pathname)) {
    const authResult = await auth();
    const locale = getLocaleFromPath(pathname);
    const gate = await resolveAdminAccess(authResult.userId);

    if (gate.status === "unauthenticated") {
      const loginUrl = new URL(`/${locale}/admin/login`, req.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (gate.status === "denied") {
      return NextResponse.redirect(
        new URL(`/${locale}/admin/access-denied`, req.url),
      );
    }

    if (gate.status === "unavailable") {
      // Signed in, but Clerk Backend API is flaky. Let the page layout retry —
      // never bounce admins to access-denied for a network blip.
      console.warn(
        "[proxy] Admin route Clerk lookup unavailable; continuing to page",
        gate.reason,
      );
      return NextResponse.next();
    }

    return NextResponse.next();
  }

  // 3b. Content (Sanity Studio): staff/admin only
  if (pathname === "/studio" || pathname.startsWith("/studio/")) {
    const authResult = await auth();
    const locale = getLocaleFromPath(pathname) || i18n.defaultLocale;
    const gate = await resolveAdminAccess(authResult.userId);

    if (gate.status === "unauthenticated") {
      const loginUrl = new URL(`/${locale}/admin/login`, req.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (gate.status === "denied") {
      return NextResponse.redirect(
        new URL(`/${locale}/admin/access-denied`, req.url),
      );
    }

    if (gate.status === "unavailable") {
      console.warn(
        "[proxy] Studio Clerk lookup unavailable; continuing",
        gate.reason,
      );
      return NextResponse.next();
    }

    return NextResponse.next();
  }

  // 4. Customer account pages
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
