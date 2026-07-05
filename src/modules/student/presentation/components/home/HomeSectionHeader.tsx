"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/shared/application/lib/cn";

type HomeSectionHeaderProps = {
  title: string;
  icon?: ReactNode;
  viewAllHref?: string;
  viewAllLabel?: string;
  className?: string;
};

export function HomeSectionHeader({
  title,
  icon,
  viewAllHref,
  viewAllLabel,
  className,
}: HomeSectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-[#2b415e] md:text-2xl">{title}</h2>
        {icon}
      </div>

      {viewAllHref && viewAllLabel ? (
        <Link
          href={viewAllHref}
          className="text-sm font-semibold text-[#2b415e] transition-colors hover:text-[#1f3048]"
        >
          {viewAllLabel}
        </Link>
      ) : (
        <span aria-hidden className="w-14" />
      )}
    </div>
  );
}
