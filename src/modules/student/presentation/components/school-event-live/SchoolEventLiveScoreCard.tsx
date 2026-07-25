"use client";

import Image from "next/image";
import { Flame, Heart, Medal, Radio } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatNumber } from "@/shared/application/lib/format";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import type { SchoolEventLiveScore } from "@/modules/student/domain/types/schoolEvent.types";

type SchoolEventLiveScoreCardProps = {
  score: SchoolEventLiveScore;
  timerLabel: string;
  isLive: boolean;
};

function TeamColumn({
  name,
  points,
  pointsLabel,
  logoUrl,
}: {
  name: string;
  points: number;
  pointsLabel: string;
  logoUrl?: string | null;
}) {
  const logo = resolveFileUrl(logoUrl);
  return (
    <div className="flex flex-1 flex-col items-center gap-3 text-center">
      <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#1e3a5f] shadow-md">
        {logo ? (
          <Image src={logo} alt={name} fill className="object-cover" unoptimized />
        ) : (
          <span className="text-2xl font-bold text-white">{name.slice(0, 1)}</span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-base font-bold text-[#0f172a]">{name}</p>
        <p className="text-sm text-slate-500">
          {pointsLabel}: {points}
        </p>
      </div>
    </div>
  );
}

export function SchoolEventLiveScoreCard({
  score,
  timerLabel,
  isLive,
}: SchoolEventLiveScoreCardProps) {
  const t = useTranslations("student.dashboard.schoolEventLive");
  const locale = useLocale();

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-[#1e3a5f]">{t("score.title")}</h3>
          {isLive ? (
            <Radio className="size-4 animate-pulse text-rose-500" aria-hidden />
          ) : null}
        </div>
        {score.roundLabel ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
            {score.roundLabel}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-4">
        <TeamColumn
          name={score.homeTeamName}
          points={score.homePoints}
          pointsLabel={t("score.points")}
          logoUrl={score.homeTeamLogoUrl}
        />

        <div className="flex flex-col items-center gap-3 px-2">
          <p className="text-4xl font-bold tabular-nums text-[#0f172a] md:text-5xl">
            {score.setsWonHome} : {score.setsWonAway}
          </p>
          <p className="text-sm font-semibold text-slate-500">{score.scoreLabel}</p>
          <span className="rounded-lg bg-rose-50 px-3 py-1.5 text-lg font-bold tabular-nums text-rose-600">
            {timerLabel}
          </span>
        </div>

        <TeamColumn
          name={score.awayTeamName}
          points={score.awayPoints}
          pointsLabel={t("score.points")}
          logoUrl={score.awayTeamLogoUrl}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
          <Heart className="size-3.5" aria-hidden />
          {formatNumber(score.likesCount, locale)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
          <Flame className="size-3.5" aria-hidden />
          {formatNumber(score.fireCount, locale)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
          <Medal className="size-3.5" aria-hidden />
          {formatNumber(score.medalsCount, locale)}
        </span>
      </div>
    </section>
  );
}
