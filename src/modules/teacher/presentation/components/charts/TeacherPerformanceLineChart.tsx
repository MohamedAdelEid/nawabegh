"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import type { TeacherPerformanceChartPoint } from "@/modules/teacher/domain/types/teacher.types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/presentation/components/ui/chart";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { DashboardSegmentedControl } from "@/shared/presentation/components/dashboard/DashboardSegmentedControl";

const chartConfig = {
  interactionRate: { label: "Interaction", color: "#C9A227" },
  referenceAverage: { label: "Reference", color: "#94A3B8" },
} satisfies ChartConfig;

type Period = "current" | "previous";

export function TeacherPerformanceLineChart({
  title,
  subtitle,
  currentWeekRows,
  previousWeekRows,
  currentWeekLabel,
  previousWeekLabel,
  interactionRateLabel,
  referenceAverageLabel,
}: {
  title: string;
  subtitle: string;
  currentWeekRows: TeacherPerformanceChartPoint[];
  previousWeekRows: TeacherPerformanceChartPoint[];
  currentWeekLabel: string;
  previousWeekLabel: string;
  interactionRateLabel: string;
  referenceAverageLabel: string;
}) {
  const [period, setPeriod] = useState<Period>("current");

  const data = useMemo(() => {
    const rows = period === "current" ? currentWeekRows : previousWeekRows;
    return rows.map((row) => ({
      label: row.dayLabel,
      interactionRate: row.interactionRate,
      referenceAverage: row.referenceAverage,
    }));
  }, [currentWeekRows, previousWeekRows, period]);

  const showReferenceLine = period === "current";

  return (
    <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1 text-right">
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
          <DashboardSegmentedControl<Period>
            options={[
              { id: "current", label: currentWeekLabel },
              { id: "previous", label: previousWeekLabel },
            ]}
            value={period}
            onChange={setPeriod}
          />
        </div>

        <div className="flex flex-wrap justify-end gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-2">
            <span className="h-0.5 w-6 bg-[#C9A227]" />
            {interactionRateLabel}
          </span>
          {showReferenceLine ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-6 rounded bg-slate-200" />
              {referenceAverageLabel}
            </span>
          ) : null}
        </div>

        <ChartContainer config={chartConfig} className="aspect-[16/7] h-72 w-full">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} domain={[0, 100]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="interactionRate"
              stroke="var(--color-interactionRate)"
              strokeWidth={2.5}
              dot={false}
            />
            {showReferenceLine ? (
              <Line
                type="monotone"
                dataKey="referenceAverage"
                stroke="var(--color-referenceAverage)"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            ) : null}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
