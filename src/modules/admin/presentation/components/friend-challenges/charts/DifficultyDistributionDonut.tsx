"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { DifficultyDistributionRow } from "@/modules/admin/domain/types/friendChallenges.types";
import { cn } from "@/shared/application/lib/cn";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "#22c55e",
  Medium: "#eab308",
  Hard: "#ef4444",
};

export type DifficultyDistributionDonutProps = {
  rows: DifficultyDistributionRow[];
  className?: string;
};

export function DifficultyDistributionDonut({ rows, className }: DifficultyDistributionDonutProps) {
  const t = useTranslations("admin.dashboard.friendChallenges.overview.charts.difficulty");
  const locale = useLocale();

  const segments = useMemo(
    () =>
      rows
        .filter((row) => row.percent > 0)
        .map((row) => ({
          key: row.difficulty,
          value: row.percent,
          color: DIFFICULTY_COLORS[row.difficulty] ?? "#94a3b8",
          label: t(`levels.${row.difficulty}`),
        })),
    [rows, t],
  );

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

  const dominant = segments.reduce(
    (best, segment) => (segment.value > best.value ? segment : best),
    segments[0] ?? { key: "Easy", value: 0, color: "#94a3b8", label: "" },
  );

  return (
    <Card className={cn("rounded-[2rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]", className)}>
      <CardContent className="space-y-6 p-4 sm:p-6">
        <div className="text-right">
          <h3 className="text-xl font-bold text-[#1E3A66] sm:text-2xl">{t("title")}</h3>
          <p className="text-sm text-slate-500">{t("subtitle")}</p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div
            className="relative flex h-36 w-36 items-center justify-center rounded-full sm:h-44 sm:w-44"
            style={{
              background: gradientStops ? `conic-gradient(${gradientStops})` : "#E2E8F0",
            }}
          >
            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white text-center shadow-inner sm:h-32 sm:w-32">
              <span className="text-2xl font-extrabold text-[#1E3A66] sm:text-3xl">
                {Math.round(dominant.value)}%
              </span>
              <span className="text-xs text-slate-500">{dominant.label}</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs">
            {segments.map((segment) => (
              <div key={segment.key} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-slate-600">
                  {segment.label} — {new Intl.NumberFormat(locale).format(Math.round(segment.value))}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
