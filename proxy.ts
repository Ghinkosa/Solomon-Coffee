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
  
  // Log incoming request for debugging
  console.log("📍 Middleware - Incoming URL:", req.url);
  console.log("📍 Middleware - Search params:", Object.fromEntries(searchParams));

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
      
      console.log("🔄 Middleware - Redirecting to:", newUrl.toString());
      console.log("🔄 Middleware - Preserved params:", Object.fromEntries(newUrl.searchParams));
      
      return NextResponse.redirect(newUrl);
    }
  }

  // 2. Clerk Auth Protection
  if (isProtectedRoute(req)) {
    await auth.protect();
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