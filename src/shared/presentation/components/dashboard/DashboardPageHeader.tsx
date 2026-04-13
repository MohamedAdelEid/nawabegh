"use client";

import type React from "react";
import { cn } from "@/shared/application/lib/cn";

interface DashboardBreadcrumbItem {
  label: string;
}

interface DashboardPageHeaderProps {
  title: string;
  breadcrumbs?: DashboardBreadcrumbItem[];
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function DashboardPageHeader({
  title,
  breadcrumbs = [],
  description,
  action,
  className,
}: DashboardPageHeaderProps) {
  return (
    <section
      className={cn(
        "flex flex-col-reverse gap-4 md:flex-row md:items-start md:justify-between",
        className,
      )}
    >
      <div className="space-y-2 text-right">
        {breadcrumbs.length > 0 ? (
          <p className="text-sm font-medium text-slate-400">
            {breadcrumbs.map((item, index) => (
              <span key={`${item.label}-${index}`}>
                {index > 0 ? <span className="mx-1.5 text-slate-300">/</span> : null}
                <span>{item.label}</span>
              </span>
            ))}
          </p>
        ) : null}
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-7 text-slate-500">{description}</p>
        ) : null}
      </div>
      <div className="flex justify-start md:justify-end">{action}</div>
    </section>
  );
}
