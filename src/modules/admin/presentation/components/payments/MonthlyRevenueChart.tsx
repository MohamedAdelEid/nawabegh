"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { useLocale, useTranslations } from "next-intl";
import type { AdminPaymentsMonthlyRevenue } from "@/modules/admin/domain/types/payments.types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/presentation/components/ui/chart";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { DashboardSegmentedControl } from "@/shared/presentation/components/dashboard";
import {
  fillMonthlyRevenueGaps,
  getMonthLabel,
} from "./paymentDisplay";

const ACTIVE_BAR_COLOR = "#243B5A";
const INACTIVE_BAR_COLOR = "#E2E8F0";

const chartConfig = {
  amount: {
    label: "Revenue",
    color: ACTIVE_BAR_COLOR,
  },
} satisfies ChartConfig;

export type MonthlyRevenueChartProps = {
  year: number;
  rows: AdminPaymentsMonthlyRevenue[];
  onYearChange?: (year: number) => void;
};

export function MonthlyRevenueChart({ year, rows, onYearChange }: MonthlyRevenueChartProps) {
  const t = useTranslations("admin.dashboard.paymentManagement.overview.chart");
  const locale = useLocale();

  const currentMonth = new Date().getUTCMonth() + 1;
  const currentYear = new Date().getUTCFullYear();

  const chartData = useMemo(() => {
    return fillMonthlyRevenueGaps(rows, year).map((row) => ({
      ...row,
      label: getMonthLabel(row.month, locale),
      isCurrent: year === currentYear && row.month === currentMonth,
    }));
  }, [rows, year, locale, currentMonth, currentYear]);

  const yearOptions = useMemo(
    () =>
      [currentYear - 1, currentYear, currentYear + 1].map((value) => ({
        id: String(value),
        label: String(value),
      })),
    [currentYear],
  );

  return (
    <Card className="rounded-[2rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col gap-3 text-right md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-[#1E3A66]">{t("title")}</h3>
            <p className="text-sm text-slate-500">{t("subtitle", { year })}</p>
          </div>
          {onYearChange ? (
            <DashboardSegmentedControl
              value={String(year)}
              options={yearOptions}
              onChange={(value) => onYearChange(Number(value))}
            />
          ) : null}
        </div>

        <ChartContainer config={chartConfig} className="aspect-[16/7] h-72 w-full">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={48} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="amount" radius={[10, 10, 0, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={`${entry.year}-${entry.month}`}
                  fill={entry.isCurrent ? ACTIVE_BAR_COLOR : INACTIVE_BAR_COLOR}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
