"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Shield,
  Bell,
  UserCheck,
  LogOut,
  Menu,
  X,
  User,
  Star,
  Mail,
  ExternalLink,
  FilePenLine,
  Package2,
  Tags,
  FileText,
} from "lucide-react";

interface AdminShellProps {
  children: React.ReactNode;
  user: {
    firstName?: string | null;
    lastName?: string | null;
    emailAddresses: Array<{ emailAddress: string }>;
    primaryEmailAddress?: { emailAddress: string } | null;
    imageUrl?: string;
  } | null;
}

const adminRoutes: {
  label: string;
  icon: typeof LayoutDashboard;
  href: string;
  external?: boolean;
}[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Users", icon: Users, href: "/admin/users" },
  { label: "Account Requests", icon: UserCheck, href: "/admin/account-requests" },
  { label: "Products", icon: Package, href: "/admin/products" },
  { label: "Categories", icon: Tags, href: "/admin/categories" },
  { label: "Packaging", icon: Package2, href: "/admin/packaging" },
  { label: "Blog", icon: FileText, href: "/admin/blog" },
  { label: "Orders", icon: ShoppingCart, href: "/admin/orders" },
  { label: "Reviews", icon: Star, href: "/admin/reviews" },
  { label: "Subscriptions", icon: Mail, href: "/admin/subscriptions" },
  { label: "Notifications", icon: Bell, href: "/admin/notifications" },
  {
    label: "Content",
    icon: FilePenLine,
    href: "/studio",
    external: true,
  },
];

function getNormalizedPathname(path: string) {
  return path.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
}

function getPageTitle(path: string) {
  if (path.startsWith("/studio")) return "Content";
  const exact = adminRoutes.find((r) => r.href === path);
  if (exact) return exact.label;
  const nested = adminRoutes.find(
    (r) => r.href !== "/admin" && path.startsWith(r.href),
  );
  return nested?.label ?? "Admin";
}

export default function AdminShell({ children, user }: AdminShellProps) {
  const { signOut } = useClerk();
  const pathname = usePathname();
  const params = useParams();
  const lang = params?.lang as string;
  const [mobileOpen, setMobileOpen] = useState(false);

  const normalizedPathname = getNormalizedPathname(pathname || "");
  const pageTitle = getPageTitle(normalizedPathname);

  const getLocalizedHref = (href: string) => {
    if (!lang || lang === "en") return href;
    return `/${lang}${href}`;
  };

  const storeHref = lang && lang !== "en" ? `/${lang}` : "/";

  function renderNavLink(route: (typeof adminRoutes)[0], onNavigate?: () => void) {
    const isActive = route.external
      ? normalizedPathname.startsWith("/studio")
      : normalizedPathname === route.href;
    const Icon = route.icon;
    const href = route.external ? route.href : getLocalizedHref(route.href);

    return (
      <Link
        key={route.href}
        href={href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-shop_light_green text-white shadow-sm"
            : "text-slate-300 hover:bg-white/10 hover:text-white",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span>{route.label}</span>
      </Link>
    );
  }

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-shop_light_green">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">Sheba Admin</p>
          <p className="truncate text-xs text-slate-400">Management</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {adminRoutes.map((route) => renderNavLink(route, () => setMobileOpen(false)))}
      </nav>

      <div className="border-t border-white/10 p-4 space-y-3">
        <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt=""
              className="h-9 w-9 rounded-full object-cover ring-2 ring-white/20"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
              <User className="h-4 w-4 text-slate-300" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-xs text-slate-400">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>

        <Link
          href={storeHref}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          View store
        </Link>

        <Button
          onClick={() => signOut()}
          variant="ghost"
          size="sm"
          className="w-full justify-start text-slate-300 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-shop_light_bg">
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col bg-shop_dark_green">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-shop_dark_green transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-end border-b border-white/10 px-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">{sidebarContent}</div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-slate-200/80 bg-white/90 px-4 shadow-sm backdrop-blur-sm sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold text-slate-900">{pageTitle}</h1>
            <p className="hidden text-xs text-slate-500 sm:block">Sheba Cup Coffee admin</p>
          </div>
        </header>

        <main className="relative flex min-h-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
