import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "./i18n-config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

const isProtectedRoute = createRouteMatcher([
  "/user(.*)",
  "/cart(.*)",
  "/wishlist(.*)",
  "/success(.*)",
  "/checkout(.*)",
  "/settings(.*)",
  "/admin(.*)",
  "/:locale/user(.*)",
  "/:locale/cart(.*)",
  "/:locale/wishlist(.*)",
  "/:locale/success(.*)",
  "/:locale/checkout(.*)",
  "/:locale/settings(.*)",
  "/:locale/admin(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/:locale/admin(.*)"]);

function getLocale(request: NextRequest): string | undefined {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // @ts-ignore locales are readonly
  const locales: string[] = i18n.locales;
  let languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales,
  );

  return matchLocale(languages, locales, i18n.defaultLocale);
}

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;

  // 1. Check if locale is missing (I18n Middleware Logic)
  // Exclude likely static files, API routes, or studio
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
      return NextResponse.redirect(
        new URL(
          `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
          req.url,
        ),
      );
    }
  }

  // 2. Clerk Auth Protection (Locale-aware due to route matchers)
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  if (isAdminRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      // Logic to handle unauthenticated admin access is handled by protect() usually,
      // but here we might want specific redirect.
      // However, auth.protect() above already handles it if it matches isProtectedRoute.
      // If isAdminRoute is a subset of isProtectedRoute, we are good.
      // Admin routes ARE in protected routes list.
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
