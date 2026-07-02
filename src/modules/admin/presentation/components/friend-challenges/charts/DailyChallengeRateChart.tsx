"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { useLocale, useTranslations } from "next-intl";
import type { DailyChallengeRateRow } from "@/modules/admin/domain/types/friendChallenges.types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/presentation/components/ui/chart";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

const ACTIVE_BAR_COLOR = "#7C6CF0";
const INACTIVE_BAR_COLOR = "#E8E4FF";

const chartConfig = {
  count: {
    label: "Challenges",
    color: ACTIVE_BAR_COLOR,
  },
} satisfies ChartConfig;

export type DailyChallengeRateChartProps = {
  rows: DailyChallengeRateRow[];
};

export function DailyChallengeRateChart({ rows }: DailyChallengeRateChartProps) {
  const t = useTranslations("admin.dashboard.friendChallenges.overview.charts.dailyRate");
  const locale = useLocale();

  const maxCount = useMemo(() => Math.max(...rows.map((row) => row.count), 1), [rows]);

  const chartData = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        label: locale.startsWith("ar") ? row.dayNameAr : row.date,
        isPeak: row.count === maxCount && maxCount > 0,
      })),
    [rows, locale, maxCount],
  );

  return (
    <Card className="rounded-[2rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
      <CardContent className="space-y-6 p-6">
        <div className="text-right">
          <h3 className="text-2xl font-bold text-[#1E3A66]">{t("title")}</h3>
          <p className="text-sm text-slate-500">{t("subtitle")}</p>
        </div>

        <ChartContainer config={chartConfig} className="aspect-[16/7] h-72 w-full">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={40} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" radius={[10, 10, 0, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.date}
                  fill={entry.isPeak ? ACTIVE_BAR_COLOR : INACTIVE_BAR_COLOR}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
