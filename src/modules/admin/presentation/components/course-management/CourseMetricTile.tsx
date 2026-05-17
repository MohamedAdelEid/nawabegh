"use client";

import type React from "react";
import { cn } from "@/shared/application/lib/cn";

export function CourseMetricTile({
  icon: Icon,
  label,
  value,
  tone = "primary",
  className,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  tone?: "primary" | "success" | "warning" | "danger";
  className?: string;
}) {
  const toneClassName = {
    primary: "bg-[#EAF0FA] text-[#2C4260]",
    success: "bg-[#DCF4CB] text-[#58CC02]",
    warning: "bg-[#F8EFD5] text-[#A17B18]",
    danger: "bg-[#FFE4E4] text-[#D33131]",
  }[tone];

  return (
    <div
      className={cn(
        "rounded-3xl border border-white/80 bg-white p-5 text-right shadow-[0px_8px_0px_0px_#0000000D]",
        className
      )}
    >
      <div className="mb-5 flex justify-end">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", toneClassName)}>
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
