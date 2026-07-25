"use client";

import { CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SchoolEventNextMatch } from "@/modules/student/domain/types/schoolEvent.types";

type SchoolEventNextMatchCardProps = {
  nextMatch: SchoolEventNextMatch;
};

export function SchoolEventNextMatchCard({ nextMatch }: SchoolEventNextMatchCardProps) {
  const t = useTranslations("student.dashboard.schoolEventLive");

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <CalendarDays className="size-4 text-[#c4a574]" aria-hidden />
        <h3 className="text-sm font-bold text-[#1e3a5f]">{t("nextMatch.title")}</h3>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-[#1e3a5f] text-xs font-bold text-white">
            {nextMatch.homeTeamName.slice(0, 1)}
          </div>
          <span className="text-sm font-bold text-[#0f172a]">{nextMatch.homeTeamName}</span>
          <span className="text-xs font-medium text-slate-400">{t("nextMatch.vs")}</span>
          <div className="flex size-8 items-center justify-center rounded-full bg-[#1e3a5f] text-xs font-bold text-white">
            {nextMatch.awayTeamName.slice(0, 1)}
          </div>
          <span className="text-sm font-bold text-[#0f172a]">{nextMatch.awayTeamName}</span>
        </div>
        {nextMatch.timeLabel ? (
          <p className="shrink-0 text-sm font-medium text-slate-500">{nextMatch.timeLabel}</p>
        ) : null}
      </div>
    </section>
  );
}
