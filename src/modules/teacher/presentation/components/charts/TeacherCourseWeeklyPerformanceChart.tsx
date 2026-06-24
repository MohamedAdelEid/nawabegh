"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { TeacherCourseWeeklyPerformancePoint } from "@/modules/teacher/domain/types/teacher.types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/presentation/components/ui/chart";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

const chartConfig = {
  currentValue: { label: "Current period", color: "#C9A227" },
  previousValue: { label: "Previous period", color: "#2C4260" },
} satisfies ChartConfig;

export function TeacherCourseWeeklyPerformanceChart({
  title,
  currentLabel,
  previousLabel,
  rows,
}: {
  title: string;
  currentLabel: string;
  previousLabel: string;
  rows: Array<TeacherCourseWeeklyPerformancePoint & { weekLabel: string }>;
}) {
  const data = rows.map((row) => ({
    week: row.weekLabel,
    currentValue: row.currentValue,
    previousValue: row.previousValue,
  }));

  const config = {
    currentValue: { ...chartConfig.currentValue, label: currentLabel },
    previousValue: { ...chartConfig.previousValue, label: previousLabel },
  } satisfies ChartConfig;

  return (
    <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-right text-xl font-bold text-slate-800">{title}</h2>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#C9A227]" />
              {currentLabel}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2C4260]" />
              {previousLabel}
            </span>
          </div>
        </div>
        <ChartContainer config={config} className="aspect-[16/8] h-80 w-full">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="week" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="currentValue" fill="#C9A227" radius={[8, 8, 0, 0]} maxBarSize={36} />
            <Bar dataKey="previousValue" fill="#2C4260" radius={[8, 8, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
