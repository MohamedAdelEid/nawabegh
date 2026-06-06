"use client";

import type React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import type { StudentWeeklyProgressRow } from "@/modules/admin/domain/types/resultsAnalytics.types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/presentation/components/ui/chart";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

export type AcademicProgressBarChartProps = {
  title: string;
  scoreLabel: string;
  rows: StudentWeeklyProgressRow[];
  periodControl?: React.ReactNode;
};

const BAR_COLOR = "#2B415ECC";

const chartConfig = {
  averageScorePercent: {
    label: "Score",
    color: BAR_COLOR,
  },
} satisfies ChartConfig;

export function AcademicProgressBarChart({
  title,
  scoreLabel,
  rows,
  periodControl,
}: AcademicProgressBarChartProps) {
  const data = rows.map((row) => ({
    label: row.weekLabel,
    averageScorePercent: row.averageScorePercent,
  }));

  return (
    <Card className="rounded-[2rem] border-white/80 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-right text-2xl font-bold text-slate-800">{title}</h2>
          {periodControl}
        </div>

        <ChartContainer config={chartConfig} className="aspect-[16/7] h-72 w-full">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} domain={[0, 100]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="averageScorePercent"
              name={scoreLabel}
              fill={BAR_COLOR}
              radius={[12, 12, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
