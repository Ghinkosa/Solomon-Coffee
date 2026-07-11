import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "./i18n-config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { isUserAdmin } from "@/lib/adminUtils";

const isProtectedRoute = createRouteMatcher([
  "/user(.*)",
  "/wishlist(.*)",
  "/settings(.*)",
  "/admin(.*)",
  "/:locale/user(.*)",
  "/:locale/wishlist(.*)",
  "/:locale/settings(.*)",
  "/:locale/admin(.*)",
]);

const isAdminApiRoute = createRouteMatcher(["/api/admin(.*)"]);
const isDebugApiRoute = createRouteMatcher(["/api/debug(.*)"]);

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/:locale/admin(.*)"]);

function getLocale(request: NextRequest): string | undefined {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // Fix: Use as string[] to avoid readonly issue
  const locales = i18n.locales as unknown as string[];
  let languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales,
  );

  return matchLocale(languages, locales, i18n.defaultLocale);
}

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;
  const searchParams = req.nextUrl.searchParams;

  // 1. Check if locale is missing (I18n Middleware Logic)
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
      
      // Build new URL with locale
      let newPathname = pathname;
      if (!newPathname.startsWith("/")) {
        newPathname = "/" + newPathname;
      }
      
      const newUrl = new URL(`/${locale}${newPathname}`, req.url);
      
      // CRITICAL: Copy ALL search params to the new URL
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

    if (!authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(authResult.userId);
      const email = user.primaryEmailAddress?.emailAddress;

      if (!email || !isUserAdmin(email)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.next();
  }

  // 3. Clerk Auth Protection for account pages
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // 4. Admin pages require admin identity, not just authentication.
  // (The access-denied page itself lives under /admin, so exclude it to
  // avoid a redirect loop for signed-in non-admins.)
  if (isAdminRoute(req) && !pathname.includes("/admin/access-denied")) {
    const authResult = await auth();

    const deniedRedirect = () => {
      const locale =
        i18n.locales.find(
          (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`,
        ) ?? i18n.defaultLocale;
      return NextResponse.redirect(
        new URL(`/${locale}/admin/access-denied`, req.url),
      );
    };

    if (!authResult.userId) {
      return deniedRedirect();
    }

    try {
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(authResult.userId);
      const email = user.primaryEmailAddress?.emailAddress;

      if (!email || !isUserAdmin(email)) {
        return deniedRedirect();
      }
    } catch {
      return deniedRedirect();
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};