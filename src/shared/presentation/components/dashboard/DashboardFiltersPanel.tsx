"use client";

import type { PropsWithChildren } from "react";

type DashboardFiltersPanelProps = PropsWithChildren<{
  isLoading?: boolean;
  className?: string;
}>;

export function DashboardFiltersPanel({
  children,
  isLoading = false,
  className,
}: DashboardFiltersPanelProps) {
  return (
    <div
      className={`rounded-[1.75rem] border border-white/80 bg-white p-5 ${className ?? ""}`.trim()}
      style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
      aria-busy={isLoading}
    >
      <div className="flex flex-col flex-wrap gap-4 xl:flex-row xl:items-end">{children}</div>
    </div>
  );
}
