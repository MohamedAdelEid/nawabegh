"use client";

import { useTranslations } from "next-intl";
import type {
  SchoolEventHonorEntry,
  SchoolEventScheduleMatch,
} from "@/modules/student/domain/types/schoolEvent.types";

type SchoolEventSchedulePanelProps = {
  matches: SchoolEventScheduleMatch[];
};

export function SchoolEventSchedulePanel({ matches }: SchoolEventSchedulePanelProps) {
  const t = useTranslations("student.dashboard.schoolEventLive");

  if (matches.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[#e2e8f0] bg-white px-6 py-16 text-center text-[#64748b]">
        {t("schedule.empty")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => {
        const [teamA, teamB] = match.teams;
        return (
          <article
            key={match.matchId}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-[#e2e8f0] bg-white p-5 shadow-[0px_4px_0px_rgba(0,0,0,0.04)]"
          >
            <div className="space-y-1 text-start">
              <p className="text-xs font-medium text-[#94a3b8]">{match.roundLabel}</p>
              <p className="text-base font-bold text-[#0f172a]">
                {teamA?.name}{" "}
                <span className="font-medium text-[#94a3b8]">vs</span> {teamB?.name}
              </p>
              <p className="text-sm text-[#64748b]">{match.scheduledLabel}</p>
            </div>
            <div className="text-end">
              <p className="text-sm font-bold text-[#2b415e]">{match.statusLabel}</p>
              {match.scoreLabel ? (
                <p className="text-lg font-bold tabular-nums text-[#0f172a]">{match.scoreLabel}</p>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

type SchoolEventHonorBoardPanelProps = {
  entries: SchoolEventHonorEntry[];
};

export function SchoolEventHonorBoardPanel({ entries }: SchoolEventHonorBoardPanelProps) {
  const t = useTranslations("student.dashboard.schoolEventLive");

  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[#e2e8f0] bg-white px-6 py-16 text-center text-[#64748b]">
        {t("honorBoard.empty")}
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <article
          key={entry.id}
          className="rounded-2xl border-2 border-[#e2e8f0] bg-white p-5 text-start shadow-[0px_4px_0px_rgba(0,0,0,0.04)]"
        >
          <p className="text-lg font-bold text-[#0f172a]">{entry.title}</p>
          <p className="mt-1 text-sm text-[#64748b]">{entry.subtitle}</p>
          <p className="mt-3 text-sm font-bold text-[#c7af6d]">{entry.pointsLabel}</p>
        </article>
      ))}
    </div>
  );
}
