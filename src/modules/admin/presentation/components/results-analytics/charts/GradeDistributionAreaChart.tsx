"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { QuizGradeDistributionRow } from "@/modules/admin/domain/types/resultsAnalytics.types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/presentation/components/ui/chart";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

export type GradeDistributionAreaChartProps = {
  title: string;
  studentsLabel: string;
  rows: QuizGradeDistributionRow[];
};

const chartConfig = {
  studentCount: {
    label: "Students",
    color: "#C7AF6E",
  },
} satisfies ChartConfig;

export function GradeDistributionAreaChart({
  title,
  studentsLabel,
  rows,
}: GradeDistributionAreaChartProps) {
  const data = rows.map((row) => ({
    range: row.rangeLabel,
    studentCount: row.studentCount,
  }));

  return (
    <Card className="h-full rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
      <CardContent className="flex h-full flex-col space-y-4 p-6">
        <h3 className="text-right text-lg font-bold text-slate-800">{title}</h3>
        <ChartContainer config={chartConfig} className="aspect-[16/10] h-full w-full">
          <AreaChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="gradeDistributionFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C7AF6E" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#C7AF6E" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="range" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={48}
              tickMargin={12}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="studentCount"
              name={studentsLabel}
              stroke="#C7AF6E"
              fill="url(#gradeDistributionFill)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
