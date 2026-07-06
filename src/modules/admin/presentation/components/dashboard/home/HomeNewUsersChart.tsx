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
          <select
            value={months}
            onChange={(event) => onMonthsChange(Number(event.target.value) as NewUsersChartMonths)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 outline-none focus:border-[#2C4260]"
            aria-label={t("title")}
          >
            {MONTH_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`months.${option}`)}
              </option>
            ))}
          </select>
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
