"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/shared/application/lib/cn";

export type DashboardBreadcrumbItem = {
  label: string;
  href?: string;
};

type DashboardBreadcrumbProps = {
  items: DashboardBreadcrumbItem[];
  className?: string;
};

export function DashboardBreadcrumb({ items, className }: DashboardBreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <motion.nav
      aria-label="Breadcrumb"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn("text-sm font-medium text-slate-400", className)}
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 ? (
                <span className="text-slate-300" aria-hidden>
                  /
                </span>
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-slate-600"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(isLast ? "font-bold text-[#2b415e]" : undefined)}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </motion.nav>
  );
}
