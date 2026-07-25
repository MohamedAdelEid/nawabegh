"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatDate } from "@/shared/application/lib/format";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user/UserAvatarImageOrInitials";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import type {
  SchoolEventHonorEntry,
  SchoolEventMatch,
} from "@/modules/student/domain/types/schoolEvent.types";

type SchoolEventSchedulePanelProps = {
  matches: SchoolEventMatch[];
  isLoading?: boolean;
};

export function SchoolEventSchedulePanel({
  matches,
  isLoading,
}: SchoolEventSchedulePanelProps) {
  const t = useTranslations("student.dashboard.schoolEventLive");
  const locale = useLocale();

  if (isLoading) {
    return (
      <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        {t("schedule.loading")}
      </p>
    );
  }

  if (matches.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-slate-500">
        {t("schedule.empty")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => {
        const scoreLabel =
          match.homeScore != null && match.awayScore != null
            ? `${match.homeScore} : ${match.awayScore}`
            : null;
        const scheduledLabel = match.startsAt
          ? formatDate(match.startsAt, locale)
          : "";

        return (
          <article
            key={match.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="space-y-1 text-start">
              {match.roundLabel ? (
                <p className="text-xs font-medium text-slate-400">{match.roundLabel}</p>
              ) : null}
              <p className="text-base font-bold text-[#0f172a]">
                {match.homeTeamName}{" "}
                <span className="font-medium text-slate-400">{t("nextMatch.vs")}</span>{" "}
                {match.awayTeamName}
              </p>
              {scheduledLabel ? (
                <p className="text-sm text-slate-500">{scheduledLabel}</p>
              ) : null}
            </div>
            <div className="text-end">
              <p className="text-sm font-bold text-[#1e3a5f]">{match.statusLabel}</p>
              {scoreLabel ? (
                <p className="text-lg font-bold tabular-nums text-[#0f172a]">{scoreLabel}</p>
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
  isLoading?: boolean;
};

export function SchoolEventHonorBoardPanel({
  entries,
  isLoading,
}: SchoolEventHonorBoardPanelProps) {
  const t = useTranslations("student.dashboard.schoolEventLive");

  if (isLoading) {
    return (
      <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        {t("honorBoard.loading")}
      </p>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-slate-500">
        {t("honorBoard.empty")}
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <article
          key={`${entry.rank}-${entry.fullName}`}
          className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-start shadow-sm"
        >
          <div className="mb-3 flex items-center gap-3">
            <span className="text-sm font-bold text-slate-400">#{entry.rank}</span>
            <UserAvatarImageOrInitials
              trackKey={`${entry.rank}-${entry.fullName}`}
              name={entry.fullName}
              imageUrl={resolveFileUrl(entry.avatarUrl)}
              size="sm"
            />
          </div>
          <p className="text-lg font-bold text-[#0f172a]">{entry.fullName}</p>
          <p className="mt-1 text-sm text-slate-500">
            {[entry.roleLabel, entry.teamName, entry.gradeLabel]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className="mt-3 text-sm font-bold text-[#c4a574]">
            {entry.pointsLabel || t("standings.points", { points: entry.points })}
          </p>
        </article>
      ))}
    </div>
  );
}
