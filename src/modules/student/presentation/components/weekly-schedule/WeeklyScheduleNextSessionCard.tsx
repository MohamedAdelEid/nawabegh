"use client";

import { GraduationCap } from "lucide-react";
import { useTranslations } from "next-intl";
import type { WeeklyScheduleNextSessionDto } from "@/modules/student/domain/weekly-schedule/weekly-schedule.types";

type WeeklyScheduleNextSessionCardProps = {
  nextSession: WeeklyScheduleNextSessionDto;
};

export function WeeklyScheduleNextSessionCard({ nextSession }: WeeklyScheduleNextSessionCardProps) {
  const t = useTranslations("student.dashboard.weeklySchedule.nextSession");
  const showDot = nextSession.minutesUntilStart <= 30;

  return (
    <article className="flex h-full min-h-[163px] flex-col justify-between rounded-3xl bg-[#2b415e] p-6 shadow-[0px_4px_0px_#1e2e42]">
      <div className="flex items-start justify-between">
        <GraduationCap className="size-6 text-white/80" aria-hidden />
      </div>

      <div className="space-y-1">
        <p className="text-start text-xs text-white/70">{t("label")}</p>
        <h3 className="text-start text-xl font-bold leading-7 text-white">
          {nextSession.courseTitle || nextSession.title}
        </h3>
        {nextSession.courseTitle && nextSession.title ? (
          <p className="text-start text-sm text-white/60">{nextSession.title}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-2 pt-3">
        {showDot ? (
          <span className="size-2 shrink-0 rounded-full bg-[#c7af6d]" aria-hidden />
        ) : null}
        <p className="text-start text-[10px] font-bold uppercase text-white">
          {t("startsIn", { minutes: nextSession.minutesUntilStart })}
        </p>
      </div>
    </article>
  );
}
