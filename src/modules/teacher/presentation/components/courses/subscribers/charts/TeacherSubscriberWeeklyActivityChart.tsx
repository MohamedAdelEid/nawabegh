"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { TeacherSubscriberWeeklyActivityPoint } from "@/modules/teacher/domain/types/teacher.types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/presentation/components/ui/chart";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

const chartConfig = {
  activityCount: { label: "Activity", color: "#2C4260" },
} satisfies ChartConfig;

export function TeacherSubscriberWeeklyActivityChart({
  title,
  activityLabel,
  rows,
}: {
  title: string;
  activityLabel: string;
  rows: TeacherSubscriberWeeklyActivityPoint[];
}) {
  const data = rows.map((row) => ({
    day: row.dayLabel,
    activityCount: row.activityCount,
  }));

  const config = {
    activityCount: { ...chartConfig.activityCount, label: activityLabel },
  } satisfies ChartConfig;

  return (
    <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
      <CardContent className="space-y-6 p-6">
        <h2 className="text-right text-xl font-bold text-slate-800">{title}</h2>
        <ChartContainer config={config} className="aspect-[16/8] h-72 w-full">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="activityCount"
              fill="#2C4260"
              radius={[8, 8, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
