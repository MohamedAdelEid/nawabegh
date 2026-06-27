"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/shared/application/lib/cn";

export type DashboardViewMode = "grid" | "list";

type DashboardViewToggleProps = {
  value: DashboardViewMode;
  onChange: (value: DashboardViewMode) => void;
  gridLabel: string;
  listLabel: string;
  className?: string;
};

export function DashboardViewToggle({
  value,
  onChange,
  gridLabel,
  listLabel,
  className,
}: DashboardViewToggleProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        aria-label={gridLabel}
        aria-pressed={value === "grid"}
        onClick={() => onChange("grid")}
        className={cn(
          "flex h-[38px] w-[38px] items-center justify-center rounded-lg border-2 transition-colors",
          value === "grid"
            ? "border-[#2b415e] bg-[#2b415e] text-white"
            : "border-[#cbd5e1] bg-white text-[#64748b] hover:border-slate-300",
        )}
      >
        <LayoutGrid className="size-[18px]" />
      </button>
      <button
        type="button"
        aria-label={listLabel}
        aria-pressed={value === "list"}
        onClick={() => onChange("list")}
        className={cn(
          "flex h-[38px] w-[38px] items-center justify-center rounded-lg border-2 transition-colors",
          value === "list"
            ? "border-[#2b415e] bg-[#2b415e] text-white"
            : "border-[#cbd5e1] bg-white text-[#64748b] hover:border-slate-300",
        )}
      >
        <List className="size-[18px]" />
      </button>
    </div>
  );
}
