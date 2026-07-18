"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  chartResponsiveHeightClass,
  type ChartConfig,
} from "@/shared/presentation/components/ui/chart";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { SearchableSelect } from "@/shared/presentation/components/ui/searchable-select";
import type { AdminHomeNewUsersPoint } from "@/modules/admin/domain/types/adminHomeDashboard.types";

const MONTH_OPTIONS = [3, 6, 12] as const;
export type NewUsersChartMonths = (typeof MONTH_OPTIONS)[number];

const chartConfig = {
  newUsers: { label: "New users", color: "#2C4260" },
} satisfies ChartConfig;

type HomeNewUsersChartProps = {
  points: AdminHomeNewUsersPoint[];
  months: NewUsersChartMonths;
  onMonthsChange: (months: NewUsersChartMonths) => void;
};

export function HomeNewUsersChart({ points, months, onMonthsChange }: HomeNewUsersChartProps) {
  const t = useTranslations("admin.dashboard.home.newUsersChart");

  const data = points.map((point) => ({
    label: point.monthLabel,
    newUsers: point.newUsers,
  }));

  return (
    <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
      <CardContent className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-slate-800 sm:text-xl">{t("title")}</h2>
          <SearchableSelect
            value={months}
            onChange={onMonthsChange}
            options={MONTH_OPTIONS.map((option) => ({
              value: option,
              label: t(`months.${option}`),
            }))}
            className="w-32 gap-0"
            triggerClassName="h-9 rounded-xl border-slate-200 bg-white px-3 text-xs text-slate-600 shadow-none focus-visible:ring-[#2C4260]/20"
          />
        </div>

        <ChartContainer config={chartConfig} className={cn("aspect-[16/8]", chartResponsiveHeightClass)}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="newUsers" fill="#2C4260" radius={[10, 10, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
