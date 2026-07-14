"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { useEffect, useState } from "react";
import { i18n, type Locale } from "@/i18n-config";
import { localizedPath } from "@/lib/localized-path";
import { useLocale } from "@/hooks/useLocale";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface DynamicBreadcrumbProps {
  customItems?: Array<{
    label: string;
    href?: string;
  }>;
  className?: string;
  // For dynamic routes - pass the actual data
  productData?: {
    name: string;
    slug: string;
  };
  categoryData?: {
    name: string;
    slug: string;
  };
  // For nested routes - specify parent context
  parentPath?: string; // e.g., "/dashboard" for dashboard/cart
}

const DynamicBreadcrumb = ({
  customItems,
  className = "",
  productData,
  categoryData,
  parentPath,
}: DynamicBreadcrumbProps) => {
  const pathname = usePathname();
  const lang = useLocale();
  const dictionary = useDictionary();
  const [detectedParentPath, setDetectedParentPath] = useState<string | null>(
    null
  );

  // Detect parent path from referrer or session storage
  useEffect(() => {
    if (parentPath) {
      setDetectedParentPath(parentPath);
      return;
    }

    // Clear parent context if we're on dashboard itself
    if (pathname === "/dashboard") {
      sessionStorage.removeItem("breadcrumb-parent");
      setDetectedParentPath(null);
      return;
    }

    // Check if we came from dashboard based on document referrer
    const referrer = document.referrer;
    if (referrer) {
      const referrerUrl = new URL(referrer);
      const referrerPath = referrerUrl.pathname;

      // If we came from dashboard, include it in breadcrumb
      if (
        referrerPath === "/dashboard" ||
        referrerPath.startsWith("/dashboard/")
      ) {
        setDetectedParentPath("/dashboard");
      }
    }

    // Also check session storage for navigation context
    const storedParent = sessionStorage.getItem("breadcrumb-parent");
    if (storedParent === "/dashboard") {
      setDetectedParentPath("/dashboard");
    }
  }, [parentPath, pathname]);

  const formatSegmentLabel = (segment: string): string => {
    const specialCases: Record<string, string> = {
      "sign-in": t(dictionary, "breadcrumb.signIn", "Sign In"),
      "sign-up": t(dictionary, "breadcrumb.signUp", "Sign Up"),
      "my-account": t(dictionary, "breadcrumb.myAccount", "My Account"),
      "order-history": t(dictionary, "breadcrumb.orderHistory", "Order History"),
      cart: t(dictionary, "breadcrumb.cart", "Cart"),
      checkout: t(dictionary, "breadcrumb.checkout", "Checkout"),
      orders: t(dictionary, "breadcrumb.orders", "Orders"),
      payment: t(dictionary, "breadcrumb.payment", "Payment"),
      category: t(dictionary, "breadcrumb.categories", "Categories"),
      dashboard: t(dictionary, "breadcrumb.dashboard", "Dashboard"),
      wishlist: t(dictionary, "breadcrumb.wishlist", "Wishlist"),
      blog: t(dictionary, "breadcrumb.blog", "Blog"),
      shop: t(dictionary, "breadcrumb.shop", "Shop"),
      product: t(dictionary, "breadcrumb.product", "Product"),
      about: t(dictionary, "breadcrumb.about", "About"),
      contact: t(dictionary, "breadcrumb.contact", "Contact"),
      help: t(dictionary, "breadcrumb.help", "Help"),
      faq: t(dictionary, "breadcrumb.faq", "FAQ"),
      privacy: t(dictionary, "breadcrumb.privacy", "Privacy"),
      terms: t(dictionary, "breadcrumb.terms", "Terms"),
      track: t(dictionary, "breadcrumb.trackOrder", "Track Order"),
      order: t(dictionary, "breadcrumb.order", "Order"),
      profile: t(dictionary, "breadcrumb.profile", "Profile"),
      settings: t(dictionary, "breadcrumb.settings", "Settings"),
      notifications: t(dictionary, "breadcrumb.notifications", "Notifications"),
      success: t(dictionary, "breadcrumb.success", "Success"),
      wholesalers: t(dictionary, "breadcrumb.wholesalers", "Wholesale"),
      mission: t(dictionary, "breadcrumb.mission", "Mission"),
      education: t(dictionary, "breadcrumb.education", "Education"),
    };

    if (specialCases[segment]) {
      return specialCases[segment];
    }

    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Generate breadcrumb items from pathname with parent context support
  const generateBreadcrumbs = () => {
    const pathSegments = pathname
      .split("/")
      .filter((segment) => segment !== "");

    const locale =
      pathSegments[0] &&
      (i18n.locales as readonly string[]).includes(pathSegments[0])
        ? (pathSegments[0] as Locale)
        : lang;

    const routeSegments =
      pathSegments[0] === locale ? pathSegments.slice(1) : pathSegments;

    const breadcrumbs: Array<{
      label: string;
      href?: string;
      isLast: boolean;
    }> = [];

    breadcrumbs.push({
      label: t(dictionary, "breadcrumb.home", "Home"),
      href: localizedPath("/", locale),
      isLast: routeSegments.length === 0,
    });

    // If we're on home page, return just Home
    if (routeSegments.length === 0) {
      return breadcrumbs;
    }

    // For nested routes with parent context (e.g., dashboard/cart)
    const activeParentPath = parentPath || detectedParentPath;
    if (
      activeParentPath &&
      !routeSegments.includes(activeParentPath.replace("/", ""))
    ) {
      // Add the parent to the breadcrumbs
      const parentSegment = activeParentPath.replace("/", "");
      breadcrumbs.push({
        label: formatSegmentLabel(parentSegment),
        href: localizedPath(activeParentPath, locale),
        isLast: false,
      });
    }

    // Build breadcrumbs for each segment
    let currentPath = `/${locale}`;
    routeSegments.forEach((segment, index) => {
      const isLast = index === routeSegments.length - 1;
      const parentSegment = routeSegments[index - 1];

      // Skip route groups like (client), (user), (public)
      if (segment.startsWith("(") && segment.endsWith(")")) {
        return;
      }

      // Build the current path
      currentPath += `/${segment}`;

      // Handle dynamic routes with provided data
      if (parentSegment === "product" && productData && isLast) {
        breadcrumbs.push({
          label: productData.name,
          href: undefined,
          isLast: true,
        });
        return;
      }

      if (parentSegment === "category" && categoryData && isLast) {
        breadcrumbs.push({
          label: categoryData.name,
          href: undefined,
          isLast: true,
        });
        return;
      }

      // Format the segment label
      const label = formatSegmentLabel(segment);

      // Add breadcrumb item
      if (label) {
        breadcrumbs.push({
          label,
          href: isLast ? undefined : currentPath,
          isLast,
        });
      }
    });

    // Replace with custom items if provided
    if (customItems && customItems.length > 0) {
      // Keep Home, add custom items
      const homeBreadcrumb = breadcrumbs[0];
      const customBreadcrumbs = customItems.map((item, index) => ({
        ...item,
        href: item.href ? localizedPath(item.href, locale) : item.href,
        isLast: index === customItems.length - 1,
      }));

      return [homeBreadcrumb, ...customBreadcrumbs];
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className={`my-3 ${className}`}>
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage className="text-shop_dark_green font-medium truncate max-w-xs">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      href={crumb.href || localizedPath("/", lang)}
                      className={`flex items-center hover:text-shop_light_green transition-colors ${
                        index === 0 ? "flex items-center" : ""
                      }`}
                    >
                      {index === 0 && <Home size={16} />}
                      <span className={index === 0 ? "ml-1" : ""}>
                        {crumb.label}
                      </span>
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!crumb.isLast && <BreadcrumbSeparator />}
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default DynamicBreadcrumb;
