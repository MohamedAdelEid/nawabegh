"use client";

import { CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SchoolEventNextMatch } from "@/modules/student/domain/types/schoolEvent.types";

type SchoolEventNextMatchCardProps = {
  nextMatch: SchoolEventNextMatch;
};

export function SchoolEventNextMatchCard({ nextMatch }: SchoolEventNextMatchCardProps) {
  const t = useTranslations("student.dashboard.schoolEventLive");
  const [teamA, teamB] = nextMatch.teams;

  return (
    <section className="rounded-2xl border-2 border-[#e2e8f0] bg-white p-5 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
      <div className="mb-3 flex items-center gap-2">
        <CalendarDays className="size-4 text-[#c7af6d]" aria-hidden />
        <h3 className="text-sm font-bold text-[#0f172a]">{t("nextMatch.title")}</h3>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {[teamA, teamB].filter(Boolean).map((team, index) => (
            <div key={team?.teamId ?? index} className="flex items-center gap-2">
              {index > 0 ? (
                <span className="text-xs font-medium text-[#94a3b8]">{t("nextMatch.vs")}</span>
              ) : null}
              <div className="flex size-8 items-center justify-center rounded-full bg-[#2b415e] text-xs font-bold text-white">
                {team?.name.slice(0, 1)}
              </div>
              <span className="text-sm font-bold text-[#0f172a]">{team?.name}</span>
            </div>
          ))}
        </div>
        <p className="shrink-0 text-sm font-medium text-[#64748b]">{nextMatch.scheduledLabel}</p>
      </div>
    </section>
  );
}
