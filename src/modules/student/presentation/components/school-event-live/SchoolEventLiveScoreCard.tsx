"use client";

import { Flame, Radio, Star, ThumbsUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user/UserAvatarImageOrInitials";
import type { SchoolEventCurrentMatch } from "@/modules/student/domain/types/schoolEvent.types";

type SchoolEventLiveScoreCardProps = {
  match: SchoolEventCurrentMatch;
  timerLabel: string;
  isLive: boolean;
};

function TeamColumn({
  name,
  pointsLabel,
  accentColor,
}: {
  name: string;
  pointsLabel?: string;
  accentColor?: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-3 text-center">
      <div
        className="flex size-20 items-center justify-center rounded-full border-4 border-white shadow-md"
        style={{ backgroundColor: accentColor ?? "#2b415e" }}
      >
        <span className="text-2xl font-bold text-white">{name.slice(0, 1)}</span>
      </div>
      <div className="space-y-1">
        <p className="text-base font-bold text-[#0f172a]">{name}</p>
        {pointsLabel ? (
          <p className="text-sm text-[#64748b]">{pointsLabel}</p>
        ) : null}
      </div>
    </div>
  );
}

export function SchoolEventLiveScoreCard({
  match,
  timerLabel,
  isLive,
}: SchoolEventLiveScoreCardProps) {
  const t = useTranslations("student.dashboard.schoolEventLive");
  const home = match.teams.find((team) => team.side === "home") ?? match.teams[0];
  const away = match.teams.find((team) => team.side === "away") ?? match.teams[1];

  return (
    <section className="rounded-2xl border-2 border-[#e2e8f0] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-[#0f172a]">{t("score.title")}</h3>
          {isLive ? (
            <Radio className="size-4 animate-pulse text-[#ff4b4b]" aria-hidden />
          ) : null}
        </div>
        <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-sm font-medium text-[#64748b]">
          {match.roundLabel}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {home ? (
          <TeamColumn
            name={home.name}
            pointsLabel={home.pointsLabel}
            accentColor={home.accentColor}
          />
        ) : null}

        <div className="flex flex-col items-center gap-3 px-2">
          <p className="text-4xl font-bold tabular-nums text-[#0f172a] md:text-5xl">
            {match.setsWon.home} : {match.setsWon.away}
          </p>
          <span className="rounded-lg bg-[#ffe4e4] px-3 py-1.5 text-lg font-bold tabular-nums text-[#d33131]">
            {timerLabel}
          </span>
        </div>

        {away ? (
          <TeamColumn
            name={away.name}
            pointsLabel={away.pointsLabel}
            accentColor={away.accentColor}
          />
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#e2e8f0] pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-1.5 text-sm font-medium text-[#64748b]">
            <ThumbsUp className="size-3.5" aria-hidden />
            {match.reactions.likesLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-1.5 text-sm font-medium text-[#64748b]">
            <Flame className="size-3.5" aria-hidden />
            {match.reactions.fireLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-1.5 text-sm font-medium text-[#64748b]">
            <Star className="size-3.5" aria-hidden />
            {match.reactions.starsLabel}
          </span>
        </div>

        <div className="flex items-center">
          {match.viewerPreview.slice(0, 2).map((viewer, index) => (
            <div key={`viewer-${index}`} className={index > 0 ? "-ms-2" : undefined}>
              <UserAvatarImageOrInitials
                trackKey={`viewer-${index}`}
                imageUrl={viewer.profileImageUrl}
                name={viewer.fullName ?? "?"}
                size="sm"
                circleClassName="!h-8 !w-8 border-2 border-white text-[10px]"
              />
            </div>
          ))}
          {match.activeViewerCount > 0 ? (
            <span className="-ms-2 inline-flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#dee2e6] text-[10px] font-bold text-[#0f172a]">
              +{match.activeViewerCount}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
