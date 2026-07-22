"use client";

import { cn } from "@/shared/application/lib/cn";
import { clampPercent } from "@/modules/parent/application/lib/parentHome.utils";

export function ParentProgressBar({
  value,
  className,
  barClassName,
  heightClassName = "h-3",
}: {
  value: number;
  className?: string;
  barClassName?: string;
  heightClassName?: string;
}) {
  const width = clampPercent(value);

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-[#dee2e6]",
        heightClassName,
        className,
      )}
    >
      <div
        className={cn("h-full rounded-full bg-[#c7af6d] transition-all", barClassName)}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
