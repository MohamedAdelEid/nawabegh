"use client";

import type React from "react";
import { cn } from "@/shared/application/lib/cn";

export type DashboardBadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "info"
  | "primary"
  | "gold"
  | "danger";

const toneClasses: Record<DashboardBadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-600",
  success: "bg-[#DCF4CB] text-[#58CC02]",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-sky-100 text-sky-700",
  primary: "bg-[#DCE6F5] text-[#2C4260]",
  gold: "bg-[#F8EFD5] text-[#8F6C0B] border-1 border-[#8F6C0B]",
  danger: "bg-[#FFE4E4] text-[#D33131]",
};

interface DashboardBadgeProps {
  children: React.ReactNode;
  tone?: DashboardBadgeTone;
  withDot?: boolean;
  className?: string;
}

export function DashboardBadge({
  children,
  tone = "neutral",
  withDot = false,
  className,
}: DashboardBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {withDot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}
