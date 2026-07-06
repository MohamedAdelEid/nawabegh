"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import type { TeacherAttendanceChartPoint } from "@/modules/teacher/domain/types/teacher.types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  chartResponsiveHeightClass,
  type ChartConfig,
} from "@/shared/presentation/components/ui/chart";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { DashboardSegmentedControl } from "@/shared/presentation/components/dashboard/DashboardSegmentedControl";

const chartConfig = {
  attendance: { label: "Attendance", color: "#2C4260" },
  highlight: { label: "Highlight", color: "#C9A227" },
} satisfies ChartConfig;

type Period = "weekly" | "monthly";

export function TeacherAttendanceBarChart({
  title,
  subtitle,
  rows,
  weeklyLabel,
  monthlyLabel,
  period = "weekly",
  onPeriodChange,
  isLoading = false,
}: {
  title: string;
  subtitle: string;
  rows: TeacherAttendanceChartPoint[];
  weeklyLabel: string;
  monthlyLabel: string;
  period?: Period;
  onPeriodChange?: (period: Period) => void;
  isLoading?: boolean;
}) {
  const data = rows.map((row) => ({
    label: row.dayLabel,
    attendance: row.attendance,
    isHighlighted: row.isHighlighted,
  }));

  return (
    <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
      <CardContent className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1 text-right">
            <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">{title}</h2>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
          <DashboardSegmentedControl<Period>
            options={[
              { id: "weekly", label: weeklyLabel },
              { id: "monthly", label: monthlyLabel },
            ]}
            value={period}
            onChange={(value) => onPeriodChange?.(value)}
          />
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-sm text-slate-400 sm:h-56 md:h-72">…</div>
        ) : data.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-slate-400 sm:h-56 md:h-72">—</div>
        ) : (
          <ChartContainer config={chartConfig} className={`aspect-[16/7] ${chartResponsiveHeightClass}`}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="attendance" radius={[12, 12, 12, 12]} maxBarSize={48}>
                {data.map((entry) => (
                  <Cell
                    key={entry.label}
                    fill={entry.isHighlighted ? "#C9A227" : "#2C4260"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
