"use client";

import { BarChart3 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { WeeklyScheduleStatsDto } from "@/modules/student/domain/weekly-schedule/weekly-schedule.types";

type WeeklyScheduleStatsCardProps = {
  stats: WeeklyScheduleStatsDto;
};

export function WeeklyScheduleStatsCard({ stats }: WeeklyScheduleStatsCardProps) {
  const t = useTranslations("student.dashboard.weeklySchedule.stats");

  const items = [
    {
      value: stats.totalSessions,
      label: t("totalSessions"),
      valueClassName: "text-[#2b415e]",
    },
    {
      value: `${stats.attendancePercentage}%`,
      label: t("attendance"),
      valueClassName: "text-[#58cc02]",
    },
    {
      value: stats.remainingHours,
      label: t("remainingHours"),
      valueClassName: "text-[#c7af6d]",
    },
  ];

  return (
    <article className="flex h-full min-h-[163px] items-center justify-between gap-6 rounded-3xl bg-white p-6 shadow-[0px_8px_0px_0px_rgba(0,0,0,0.05)]">
      <div className="flex flex-1 flex-col gap-4">
        <h3 className="text-start text-xl font-bold text-[#2b415e]">{t("title")}</h3>
        <div className="flex flex-wrap items-start justify-end gap-6 sm:gap-8">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col items-center text-center">
              <span className={["text-2xl font-bold leading-8", item.valueClassName].join(" ")}>
                {item.value}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#64748b]">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f1f3f5] text-[#2b415e]">
        <BarChart3 className="size-6" aria-hidden />
      </div>
    </article>
  );
}
