"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { TeacherCourseWeeklyInteractionPoint } from "@/modules/teacher/domain/types/teacher.types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/presentation/components/ui/chart";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

const chartConfig = {
  interaction: { label: "Interaction", color: "#2C4260" },
  reference: { label: "Reference", color: "#e2e8f0" },
} satisfies ChartConfig;

export function TeacherWeeklyInteractionBarChart({
  title,
  legendLabel,
  rows,
}: {
  title: string;
  legendLabel: string;
  rows: Array<TeacherCourseWeeklyInteractionPoint & { dayLabel: string }>;
}) {
  const data = rows.map((row) => ({
    day: row.dayLabel,
    interaction: row.interaction,
    reference: row.reference,
  }));

  return (
    <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2C4260]" />
            {legendLabel}
          </div>
        </div>

        <ChartContainer config={chartConfig} className="aspect-[16/8] h-72 w-full">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="reference" fill="#e2e8f0" radius={[10, 10, 10, 10]} maxBarSize={40} />
            <Bar dataKey="interaction" fill="#2C4260" radius={[10, 10, 10, 10]} maxBarSize={40} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
