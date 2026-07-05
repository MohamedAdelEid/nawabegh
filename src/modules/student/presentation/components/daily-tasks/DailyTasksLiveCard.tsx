"use client";

import { useEffect, useState } from "react";
import { Clock, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import type { DailyTasksLiveSessionDto } from "@/modules/student/domain/daily-tasks/daily-tasks.types";
import { formatRemainingClock } from "@/modules/student/domain/daily-tasks/daily-tasks.utils";
import { cn } from "@/shared/application/lib/cn";

type DailyTasksLiveCardProps = {
  session: DailyTasksLiveSessionDto;
  onJoin: () => void;
  isJoining?: boolean;
  disabled?: boolean;
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

export function DailyTasksLiveCard({
  session,
  onJoin,
  isJoining,
  disabled,
}: DailyTasksLiveCardProps) {
  const t = useTranslations("student.dashboard.dailyTasks.liveCard");
  const remaining = useRemainingSeconds(session.remainingSeconds, session.isLive);
  const canJoin = session.isLive && !disabled;

  return (
    <article className="relative flex h-full min-h-[385px] flex-col overflow-hidden rounded-[32px] border border-[#e2e8f0] bg-[#2c4260] p-8 shadow-[0px_8px_0px_0px_rgba(0,0,0,0.04)]">
      <div className="pointer-events-none absolute -start-10 -top-10 size-40 rounded-full bg-white/5 blur-3xl" />

      <div className="relative flex flex-1 flex-col">
        <div className="mb-8 flex items-center justify-between">
          {session.isLive ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#ff4b4b] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              {t("liveBadge")}
              <span className="size-1.5 rounded-full bg-white" aria-hidden />
            </span>
          ) : (
            <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold text-white/80">
              {t("upcomingBadge")}
            </span>
          )}
          <Video className="size-5 text-white/70" aria-hidden />
        </div>

        <h3 className="mb-2 text-start text-2xl font-bold leading-8 text-white">{session.title}</h3>
        <p className="mb-8 text-start text-sm text-[rgba(219,227,243,0.7)]">
          {session.teacherName
            ? t("teacherSubtitle", { teacher: session.teacherName })
            : session.courseTitle}
        </p>

        <div className="mb-10 flex items-center justify-start gap-3">
          <div className="text-start">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[rgba(219,227,243,0.6)]">
              {session.isLive ? t("remainingEnd") : t("remainingStart")}
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
          disabled={!canJoin || isJoining}
          onClick={onJoin}
          className={cn(
            "mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-white py-4 text-base font-bold text-[#2c4260] transition hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <Video className="size-4" aria-hidden />
          {isJoining ? t("joining") : canJoin ? t("joinNow") : t("reminder")}
        </button>
      </div>
    </article>
  );
}
