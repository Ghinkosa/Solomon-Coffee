"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface BreadcrumbLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  setBreadcrumbParent?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

const BreadcrumbLink = ({
  href,
  children,
  className = "",
  setBreadcrumbParent = false,
  onClick,
}: BreadcrumbLinkProps) => {
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    }

    if (setBreadcrumbParent && pathname === "/dashboard") {
      sessionStorage.setItem("breadcrumb-parent", "/dashboard");
    } else if (!setBreadcrumbParent) {
      sessionStorage.removeItem("breadcrumb-parent");
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
};

export default BreadcrumbLink;
