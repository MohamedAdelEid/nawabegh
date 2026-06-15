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
  lessonCompletion: { label: "Lesson completion", color: "#C9A227" },
  testResults: { label: "Test results", color: "#2C4260" },
} satisfies ChartConfig;

export function TeacherCourseWeeklyPerformanceChart({
  title,
  lessonLabel,
  testLabel,
  rows,
}: {
  title: string;
  lessonLabel: string;
  testLabel: string;
  rows: Array<TeacherCourseWeeklyPerformancePoint & { weekLabel: string }>;
}) {
  const data = rows.map((row) => ({
    week: row.weekLabel,
    lessonCompletion: row.lessonCompletion,
    testResults: row.testResults,
  }));

  const config = {
    lessonCompletion: { ...chartConfig.lessonCompletion, label: lessonLabel },
    testResults: { ...chartConfig.testResults, label: testLabel },
  } satisfies ChartConfig;

  return (
    <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-right text-xl font-bold text-slate-800">{title}</h2>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#C9A227]" />
              {lessonLabel}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2C4260]" />
              {testLabel}
            </span>
          </div>
        </div>
        <ChartContainer config={config} className="aspect-[16/8] h-80 w-full">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="week" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="lessonCompletion" fill="#C9A227" radius={[8, 8, 0, 0]} maxBarSize={36} />
            <Bar dataKey="testResults" fill="#2C4260" radius={[8, 8, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
