"use client";

import type React from "react";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { cn } from "@/shared/application/lib/cn";
import { IconTone, iconToneClassNameMap } from "@/shared/domain/types/common.types";


interface DashboardStatCardProps {
  label: string;
  value: string;
  indicator?: string;
  indicatorClassName?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconTone?: IconTone;
  className?: string;
}

export function DashboardStatCard({
  label,
  value,
  indicator,
  indicatorClassName,
  icon: Icon,
  iconTone = "primary",
  className,
}: DashboardStatCardProps) {
  return (
    <Card
      className={cn(
        "rounded-[1.75rem] border-white/80 bg-white",
        "!shadow-[var(--dashboard-shadow-soft)]",
        className,
      )}
    >
      <CardContent className="flex items-start justify-between gap-4 p-6">
        <div className="space-y-4 text-right">
          {indicator ? (
            <p className={cn("text-sm font-semibold text-slate-400", indicatorClassName)}>
              {indicator}
            </p>
          ) : (
            <div />
          )}
          <div className="space-y-1.5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-4xl font-bold tracking-tight text-slate-800">{value}</p>
          </div>
        </div>
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
            iconToneClassNameMap[iconTone as IconTone],
          )}
        >
          <Icon className="h-6 w-6" aria-hidden />
        </div>
      </CardContent>
    </Card>
  );
}
