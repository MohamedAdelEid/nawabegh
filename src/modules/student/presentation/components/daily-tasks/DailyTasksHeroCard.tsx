"use client";

import { Clock, ChevronLeft, Star, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import type { DailyTasksHeroMission } from "@/modules/student/domain/daily-tasks/daily-tasks.types";
import { DAILY_TASKS_ASSETS } from "./daily-tasks.assets";
import { cn } from "@/shared/application/lib/cn";

type DailyTasksHeroCardProps = {
  mission: DailyTasksHeroMission;
  onStart: () => void;
  disabled?: boolean;
};

export function DailyTasksHeroCard({ mission, onStart, disabled }: DailyTasksHeroCardProps) {
  const t = useTranslations("student.dashboard.dailyTasks.hero");

  return (
    <section className="relative overflow-hidden rounded-[40px] bg-white shadow-[0px_8px_0px_0px_rgba(0,0,0,0.04)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 0% 50%, rgba(226,232,240,0.9) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "linear-gradient(244deg, rgba(199,175,109,0.35) 0%, rgba(255,255,255,0.85) 45%, rgba(199,175,109,0.05) 100%)",
        }}
      />

      <div className="relative flex flex-col gap-8 p-6 lg:flex-row lg:items-center lg:gap-12 lg:p-10">
        <div className="flex flex-1 flex-col items-start gap-4 text-start">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#ff4b4b] px-4 py-1.5 text-xs font-bold text-white">
            {t("badge")}
            <span className="size-2 rounded-full bg-white" aria-hidden />
          </span>

          <h2 className="text-3xl font-bold leading-tight text-[#2c4260] sm:text-4xl lg:text-[48px] lg:leading-[48px]">
            {t("title", { station: mission.stationName })}
          </h2>

          <p className="max-w-xl text-base text-[#64748b] sm:text-lg">
            {t("progressHint", { percent: mission.projectedProgressPercent })}
            <span className="font-bold text-[#c7a55b]"> {mission.projectedProgressPercent}%</span>
            {t("progressHintSuffix")}
          </p>

          <p className="text-base text-[#64748b] sm:text-lg">{t("motivation")}</p>

          <div className="flex flex-wrap items-center justify-start gap-4 pt-2">
            <span className="inline-flex h-[46px] items-center gap-3 rounded-2xl border border-[rgba(44,66,96,0.1)] bg-[rgba(44,66,96,0.05)] px-5 text-base font-bold text-[#2c4260]">
              <Clock className="size-[18px] shrink-0" aria-hidden />
              {t("duration", { minutes: mission.estimatedMinutes })}
            </span>
            <span className="inline-flex h-[46px] items-center gap-3 rounded-2xl border border-[rgba(199,165,91,0.2)] bg-[rgba(199,165,91,0.1)] px-5 text-base font-bold text-[#c7a55b]">
              <Star className="size-5 shrink-0 fill-current" aria-hidden />
              {t("points", { points: mission.pointsReward })}
            </span>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={onStart}
            className={cn(
              "mt-2 inline-flex items-center gap-4 rounded-2xl bg-[#c7a55b] px-10 py-5 text-lg font-bold text-white shadow-[0px_4px_0px_#a38f5a] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {t("cta")}
            <ChevronLeft className="size-4" aria-hidden />
          </button>
        </div>

        <div className="relative mx-auto size-[280px] shrink-0 overflow-hidden rounded-[24px] bg-[rgba(44,66,96,0.05)] shadow-sm sm:size-[320px] lg:mx-0 lg:size-[360px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={DAILY_TASKS_ASSETS.heroStation}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(44,66,96,0.3)] to-transparent" />
        </div>
      </div>
    </section>
  );
}

export function DailyTasksWelcomeHeader({
  studentName,
  streakDays,
  peerPercentile,
}: {
  studentName: string;
  streakDays: number | null;
  peerPercentile: number | null;
}) {
  const t = useTranslations("student.dashboard.dailyTasks.header");

  const subtitle =
    peerPercentile != null && peerPercentile >= 80
      ? t("subtitleTopTen")
      : t("subtitleDefault");

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1 text-start">
        <h1 className="text-2xl font-bold text-[#2c4260] sm:text-[30px] sm:leading-9">
          {t("welcome", { name: studentName })}
        </h1>
        <p className="text-base font-medium text-[#64748b]">{subtitle}</p>
      </div>

      {streakDays != null && streakDays > 0 ? (
        <div className="inline-flex items-center gap-3 rounded-xl border border-[rgba(199,165,91,0.2)] bg-[rgba(199,165,91,0.1)] px-4 py-2">
          <span className="text-base font-bold text-[#c7a55b]">
            {t("streak", { days: streakDays })}
          </span>
          <Zap className="size-4 fill-[#c7a55b] text-[#c7a55b]" aria-hidden />
        </div>
      ) : null}
    </header>
  );
}
