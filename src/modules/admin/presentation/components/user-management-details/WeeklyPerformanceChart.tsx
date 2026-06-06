import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import type { UserManagementWeeklyPerformanceRow } from "./types";

export type WeeklyPerformanceChartProps = {
  title: string;
  lessonsLabel: string;
  testsLabel: string;
  rows: UserManagementWeeklyPerformanceRow[];
};

export function WeeklyPerformanceChart({
  title,
  lessonsLabel,
  testsLabel,
  rows,
}: WeeklyPerformanceChartProps) {
  const maxValue = Math.max(...rows.flatMap((row) => [row.lessons, row.tests]), 1);

  return (
    <Card className="rounded-[2rem] border-white/80 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-right text-2xl font-bold text-slate-800">{title}</h2>
          <div className="flex items-center justify-end gap-4 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2B415E]" />
              {lessonsLabel}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#58CC02]" />
              {testsLabel}
            </span>
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-[#FBFCFD] p-5">
          <div className="grid h-64 grid-cols-7 items-end gap-3">
            {rows.map((row) => (
              <div key={row.id} className="flex h-full flex-col items-center justify-end gap-3">
                <div className="flex h-full w-full items-end justify-center gap-1.5 bg-[#F8FAFC]">
                  <div
                    className="w-full rounded-t-2xl bg-[#2B415E33]"
                    style={{ height: `${(row.lessons / maxValue) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400">{row.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
