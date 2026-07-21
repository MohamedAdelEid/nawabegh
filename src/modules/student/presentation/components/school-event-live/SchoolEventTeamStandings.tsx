"use client";

import { Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";
import type { SchoolEventTeamStanding } from "@/modules/student/domain/types/schoolEvent.types";

type SchoolEventTeamStandingsProps = {
  standings: SchoolEventTeamStanding[];
};

export function SchoolEventTeamStandings({ standings }: SchoolEventTeamStandingsProps) {
  const t = useTranslations("student.dashboard.schoolEventLive");

  return (
    <section className="rounded-2xl border-2 border-[#e2e8f0] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="size-5 text-[#c7af6d]" aria-hidden />
        <h3 className="text-lg font-bold text-[#0f172a]">{t("standings.title")}</h3>
      </div>

      <ul className="space-y-2">
        {standings.map((row) => (
          <li
            key={row.teamId}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5",
              row.isHighlighted && "bg-[rgba(219,227,243,0.3)]",
            )}
          >
            <span className="w-5 text-sm font-bold text-[#64748b]">{row.rank}</span>
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#2b415e] text-sm font-bold text-white"
              aria-hidden
            >
              {row.name.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1 text-start">
              <p className="truncate text-sm font-bold text-[#0f172a]">{row.name}</p>
              <p className="truncate text-xs text-[#94a3b8]">{row.schoolName}</p>
            </div>
            <div className="text-end">
              <p className="text-sm font-bold text-[#2b415e]">
                {t("standings.points", { points: row.points })}
              </p>
              <p
                className={cn(
                  "text-xs font-medium",
                  row.rankChange > 0 && "text-[#58cc02]",
                  row.rankChange < 0 && "text-[#d33131]",
                  row.rankChange === 0 && "text-[#94a3b8]",
                )}
              >
                {row.rankChangeLabel}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="mt-4 w-full text-center text-sm font-bold text-[#2b415e] hover:opacity-80"
      >
        {t("standings.viewFull")}
      </button>
    </section>
  );
}
