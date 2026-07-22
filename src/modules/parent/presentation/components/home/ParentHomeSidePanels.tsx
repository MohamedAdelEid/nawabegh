"use client";

import { BookOpenCheck, Radio, Video } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type {
  ParentHomeSummary,
  ParentRecentActivity,
  ParentSchoolLeaderboardEntry,
} from "@/modules/parent/domain/types/parentHome.types";
import {
  formatPercent,
  getActivityIconTone,
  resolveLocalizedText,
} from "@/modules/parent/application/lib/parentHome.utils";
import { ParentAvatar } from "@/modules/parent/presentation/components/home/ParentAvatar";
import { cn } from "@/shared/application/lib/cn";

export function ParentLeaderboardCard({
  entries,
}: {
  entries: ParentSchoolLeaderboardEntry[];
}) {
  const t = useTranslations("parent.dashboard.home.leaderboard");
  const tCommon = useTranslations("parent.dashboard.common");

  return (
    <article className="rounded-[20px] border-2 border-[#e2e8f0] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
      <h3 className="mb-4 text-lg font-bold text-[#2b415e]">{t("title")}</h3>
      {entries.length === 0 ? (
        <p className="text-sm text-[#64748b]">{t("empty")}</p>
      ) : (
        <ul className="space-y-3">
          {entries.slice(0, 6).map((entry) => (
            <li
              key={entry.studentUserId}
              className="flex items-center gap-3 rounded-xl bg-[#f8f9fa] p-3"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#2b415e] text-xs font-bold text-white">
                {String(entry.rank).padStart(2, "0")}
              </span>
              <ParentAvatar
                url={entry.profileImageUrl}
                name={entry.fullName}
                className="size-10"
                roundedClassName="rounded-full"
              />
              <div className="min-w-0 flex-1 text-start">
                <p className="truncate text-sm font-bold text-[#0f172a]">{entry.fullName}</p>
                <p className="text-xs text-[#64748b]">
                  {tCommon("points", { count: entry.points })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export function ParentRecentActivityCard({
  activities,
}: {
  activities: ParentRecentActivity[];
}) {
  const t = useTranslations("parent.dashboard.home.activity");
  const locale = useLocale();

  const iconMap = {
    quiz: BookOpenCheck,
    station: Video,
    live: Radio,
  } as const;

  const toneMap = {
    quiz: "bg-[#ffe4e4] text-[#d33131]",
    station: "bg-[#e8f5ff] text-[#2b415e]",
    live: "bg-[#dcf4cb] text-[#46a302]",
  } as const;

  return (
    <article className="rounded-[20px] border-2 border-[#e2e8f0] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
      <h3 className="mb-4 text-lg font-bold text-[#2b415e]">{t("title")}</h3>
      {activities.length === 0 ? (
        <p className="text-sm text-[#64748b]">{t("empty")}</p>
      ) : (
        <ul className="space-y-3">
          {activities.slice(0, 6).map((activity, index) => {
            const tone = getActivityIconTone(activity.type);
            const Icon = iconMap[tone];
            const title = resolveLocalizedText(
              locale,
              activity.titleAr,
              activity.title,
            );
            return (
              <li key={`${activity.studentUserId}-${activity.occurredAtUtc}-${index}`} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                    toneMap[tone],
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 text-start">
                  <p className="text-sm font-medium text-[#0f172a]">
                    <span className="font-bold">{activity.childFullName}</span>
                    {" · "}
                    {title || t(`types.${activity.type}`)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}

export function ParentIndicatorsCard({ summary }: { summary: ParentHomeSummary }) {
  const t = useTranslations("parent.dashboard.home.indicators");

  const items = [
    {
      label: t("averageProgress"),
      value: formatPercent(summary.averageProgressPercent),
    },
    {
      label: t("commitmentRate"),
      value: formatPercent(summary.lessonProgressPercent),
    },
    {
      label: t("examsCount"),
      value: String(summary.totalAchievements),
    },
    {
      label: t("completedStations"),
      value: String(summary.completedStationsCount),
    },
  ];

  return (
    <article className="rounded-[20px] border-2 border-[#e2e8f0] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
      <h3 className="mb-4 text-lg font-bold text-[#2b415e]">{t("title")}</h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-between gap-3 rounded-xl bg-[#f8f9fa] px-4 py-3"
          >
            <span className="text-sm text-[#64748b]">{item.label}</span>
            <span className="text-base font-bold text-[#2b415e]">{item.value}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
