"use client";

import { useEffect, useState } from "react";
import { Clock, Swords } from "lucide-react";
import { useTranslations } from "next-intl";
import type { DailyTasksChallengeDto } from "@/modules/student/domain/daily-tasks/daily-tasks.types";
import { formatRemainingClock } from "@/modules/student/domain/daily-tasks/daily-tasks.utils";
import { cn } from "@/shared/application/lib/cn";

type DailyTasksChallengeCardProps = {
  challenge: DailyTasksChallengeDto;
  onEnter: () => void;
  isEntering?: boolean;
};

function useRemainingSeconds(initial: number, active: boolean) {
  const [remaining, setRemaining] = useState(initial);

  useEffect(() => {
    setRemaining(initial);
    if (!active) return;
    const timer = window.setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [initial, active]);

  return remaining;
}

export function DailyTasksChallengeCard({
  challenge,
  onEnter,
  isEntering,
}: DailyTasksChallengeCardProps) {
  const t = useTranslations("student.dashboard.dailyTasks.challengeCard");
  const remaining = useRemainingSeconds(challenge.remainingSeconds, true);
  const canEnter = challenge.canEnter && challenge.isLive;

  return (
    <article className="relative flex h-full min-h-[385px] flex-col overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[#c7af6d] p-4 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] sm:p-6">
      <div className="pointer-events-none absolute start-4 top-4 size-32 rounded-full bg-white/5 blur-3xl" />

      <div className="relative flex flex-1 flex-col px-2 pt-2">
        <div className="mb-8 flex items-center justify-between">
          {challenge.isLive ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#ff4b4b] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              {t("liveBadge")}
              <span className="size-1.5 rounded-full bg-white" aria-hidden />
            </span>
          ) : (
            <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold text-white/90">
              {t("upcomingBadge")}
            </span>
          )}
          <Swords className="size-5 text-white/70" aria-hidden />
        </div>

        <h3 className="mb-2 text-start text-2xl font-bold leading-8 text-white">
          {t("stationTitle")}
        </h3>
        <p className="mb-8 text-start text-sm text-[rgba(219,227,243,0.85)]">{challenge.title}</p>

        <div className="mb-10 flex items-center justify-start gap-3">
          <div className="text-start">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[rgba(219,227,243,0.6)]">
              {challenge.isLive ? t("remainingEnd") : t("remainingOpen")}
            </p>
            <p className="font-mono text-xl tracking-wider text-white">
              {formatRemainingClock(remaining)}
            </p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-lg bg-white/10">
            <Clock className="size-[18px] text-white" aria-hidden />
          </div>
        </div>

        <button
          type="button"
          disabled={!canEnter || isEntering}
          onClick={onEnter}
          className={cn(
            "mt-auto w-full rounded-2xl bg-white py-4 text-base font-bold text-[#c7af6d] transition hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {isEntering ? t("entering") : canEnter ? t("enterNow") : t("opensLater")}
        </button>
      </div>
    </article>
  );
}
