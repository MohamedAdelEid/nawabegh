"use client";

import type { ExamsSuccessRate } from "@/modules/admin/domain/types/examsManagement.types";
import { cn } from "@/shared/application/lib/cn";

export type ExamsSuccessRateDonutProps = {
  data: ExamsSuccessRate;
  className?: string;
};

const SEGMENT_COLORS = {
  passed: "#22c55e",
  failed: "#ef4444",
  notAttempted: "#94a3b8",
} as const;

export function ExamsSuccessRateDonut({ data, className }: ExamsSuccessRateDonutProps) {
  const segments = [
    { key: "passed", value: data.passedPercentage, color: SEGMENT_COLORS.passed },
    { key: "failed", value: data.failedPercentage, color: SEGMENT_COLORS.failed },
    {
      key: "notAttempted",
      value: data.notAttemptedPercentage,
      color: SEGMENT_COLORS.notAttempted,
    },
  ].filter((segment) => segment.value > 0);

  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 100;
  let cumulative = 0;

  const gradientStops = segments
    .map((segment) => {
      const start = (cumulative / total) * 360;
      cumulative += segment.value;
      const end = (cumulative / total) * 360;
      return `${segment.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  const displayPercent = Math.round(data.passedPercentage);

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div
        className="relative flex h-40 w-40 items-center justify-center rounded-full"
        style={{
          background: gradientStops
            ? `conic-gradient(${gradientStops})`
            : SEGMENT_COLORS.notAttempted,
        }}
      >
        <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
          <span className="text-3xl font-extrabold text-[#1E3A66]">{displayPercent}%</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3 text-xs">
        {segments.map((segment) => (
          <div key={segment.key} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-slate-600">{Math.round(segment.value)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
