"use client";

import Link from "next/link";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import { cn } from "@/shared/application/lib/cn";

type CommunityAuthorLinkProps = {
  userId?: string | null;
  children: React.ReactNode;
  className?: string;
};

export function CommunityAuthorLink({ userId, children, className }: CommunityAuthorLinkProps) {
  const routes = useScopedDashboardRoutes();
  const authorId = userId?.trim();

  if (!authorId) {
    return <>{children}</>;
  }

  return (
    <Link
      href={routes.knowledgeCommunity.AUTHOR(authorId)}
      className={cn("inline-flex transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4260]/30", className)}
    >
      {children}
    </Link>
  );
}
