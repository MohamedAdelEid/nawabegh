"use client";

import Link from "next/link";
import { Home, RotateCcw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { AchievementAuditItemDto } from "@/modules/student/domain/challenge-station/challenge-station.types";
import {
  getLevelTitle,
} from "@/modules/student/domain/challenge-station/challenge-station.utils";
import { cn } from "@/shared/application/lib/cn";
import { ROUTES } from "@/shared/infrastructure/config/routes";

type ChallengeResultsViewProps = {
  isWin: boolean;
  isTie: boolean;
  correctAnswers: number;
  questionCount: number;
  xpEarned: number;
  currentLevel: number;
  pointsToNextLevel: number;
  levelProgress: number;
  rank: number | null;
  achievements: AchievementAuditItemDto[];
  canRetry: boolean;
  courseTitle: string | null;
  pathId?: string | null;
  courseId?: string | null;
  onRetry: () => void;
  onNewChallenge: () => void;
};

export function ChallengeResultsView({
  isWin,
  isTie,
  correctAnswers,
  questionCount,
  xpEarned,
  currentLevel,
  pointsToNextLevel,
  levelProgress,
  rank,
  achievements,
  canRetry,
  courseTitle,
  pathId,
  courseId,
  onRetry,
  onNewChallenge,
}: ChallengeResultsViewProps) {
  const t = useTranslations("student.dashboard.challengeStation.results");
  const locale = useLocale() === "en" ? "en" : "ar";
  const levelTitle = getLevelTitle(currentLevel, locale);

  const journeyHref = (() => {
    const params = new URLSearchParams();
    if (courseId) params.set("courseId", courseId);
    if (pathId) params.set("pathId", pathId);
    const qs = params.toString();
    return qs ? `${ROUTES.USER.STUDENT.JOURNEY}?${qs}` : ROUTES.USER.STUDENT.JOURNEY;
  })();

  const circumference = 2 * Math.PI * 80;
  const dash = (levelProgress / 100) * circumference;

  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-3 text-center">
          {!isWin && !isTie ? (
            <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-[#ffe4e4] text-3xl shadow-[0_8px_0_rgba(0,0,0,0.05)]">
              💔
            </div>
          ) : null}
          <h1 className="text-4xl font-bold tracking-tight text-[#2b415e] sm:text-5xl">
            {isWin ? t("winTitle") : isTie ? t("tieTitle") : t("lossTitle")}
          </h1>
          <p className="text-lg text-[#64748b]">
            {isWin
              ? t("winSubtitle", { subject: courseTitle || t("subjectFallback") })
              : t("lossSubtitle")}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <article className="relative overflow-hidden rounded-[40px] border-2 border-[#e2e8f0] bg-white px-8 py-12 text-center shadow-[0_8px_0_rgba(0,0,0,0.05)]">
            {isWin ? (
              <span className="absolute end-6 top-6 rounded-full bg-[#f4ecd8] px-4 py-1 text-sm font-bold text-[#a38f5a]">
                {t("levelApproaching")}
              </span>
            ) : null}
            <div className="relative mx-auto mb-6 size-48">
              <svg className="size-full -rotate-90" viewBox="0 0 192 192">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="14"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke="#c7af6d"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${dash} ${circumference}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl font-bold text-[#2b415e]">{levelProgress}%</p>
                <p className="text-xs font-bold uppercase text-[#94a3b8]">
                  {isWin ? t("levelComplete") : t("progress")}
                </p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#2b415e]">{levelTitle}</h2>
            <p className="mt-2 text-[#64748b]">
              {t("pointsToNext", { points: pointsToNextLevel, level: currentLevel + 1 })}
            </p>
            {!isWin ? (
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <span className="rounded-2xl bg-[#dee2e6] px-4 py-2 text-sm font-bold text-[#2b415e]">
                  {t("levelBadge", { level: currentLevel })}
                </span>
                <span className="rounded-2xl bg-[#f4ecd8] px-4 py-2 text-sm font-bold text-[#a38f5a]">
                  {t("rankBadge")}
                </span>
              </div>
            ) : null}
          </article>

          <div className="space-y-4">
            {isWin ? (
              <>
                <div className="rounded-[32px] bg-[#2b415e] p-8 text-center text-white shadow-[0_8px_0_#1a2839]">
                  <p className="text-5xl font-bold">+{xpEarned || 450}</p>
                  <p className="mt-2 text-[#d3e3ff]">{t("totalXp")}</p>
                </div>
                {rank != null && rank > 10 ? (
                  <div className="rounded-[32px] bg-[#c7af6d] p-6 text-center shadow-[0_8px_0_#a38f5a]">
                    <p className="font-bold text-[#271900]">{t("topTenNudge")}</p>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <div className="rounded-[24px] border-2 border-[#e2e8f0] bg-[#f8f9fa] p-6 shadow-[0_8px_0_rgba(0,0,0,0.05)]">
                  <p className="text-sm font-bold text-[#94a3b8]">{t("xpLabel")}</p>
                  <p className="mt-2 text-3xl font-extrabold text-[#64748b]">
                    +{xpEarned || 15} XP
                  </p>
                </div>
                <div className="rounded-[24px] border-2 border-[#e2e8f0] bg-white p-6 shadow-[0_8px_0_rgba(0,0,0,0.05)]">
                  <p className="text-sm font-bold text-[#64748b]">{t("correctLabel")}</p>
                  <p className="mt-2 text-3xl font-bold text-[#2b415e]">
                    {correctAnswers}/{questionCount || correctAnswers}
                  </p>
                  <p className="mt-1 text-sm text-[#64748b]">{t("closeToGoal")}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {achievements.length > 0 ? (
          <section className="space-y-4">
            <h3 className="text-start text-xl font-bold text-[#2b415e]">
              {t("dailyMissions")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {achievements.slice(0, 4).map((item) => {
                const pct = Math.min(
                  100,
                  Math.round((item.currentCount / Math.max(1, item.targetCount)) * 100),
                );
                return (
                  <article
                    key={item.key}
                    className="rounded-3xl border-2 border-[#f8fafc] bg-white p-6 shadow-[0_8px_0_rgba(0,0,0,0.05)]"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="text-start">
                        <h4 className="font-bold text-[#0f172a]">{item.title}</h4>
                        {item.description ? (
                          <p className="text-sm text-[#64748b]">{item.description}</p>
                        ) : null}
                      </div>
                      <span
                        className={cn(
                          "text-sm font-bold",
                          item.isCompleted ? "text-[#58cc02]" : "text-[#2b415e]",
                        )}
                      >
                        +{item.rewardXp} XP
                      </span>
                    </div>
                    <div className="mb-2 flex justify-between text-sm font-bold text-[#64748b]">
                      <span>
                        {item.currentCount}/{item.targetCount}
                      </span>
                      <span className={item.isCompleted ? "text-[#58cc02]" : undefined}>
                        {item.isCompleted ? t("completed") : t("inProgress")}
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-[#f1f3f5]">
                      <div
                        className="h-full rounded-full bg-[#58cc02]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        <div className="flex flex-col gap-4 sm:flex-row">
          {isWin ? (
            <>
              <button
                type="button"
                onClick={onNewChallenge}
                disabled={!canRetry}
                className="flex flex-1 items-center justify-center gap-2 rounded-3xl bg-[#58cc02] py-5 text-xl font-bold text-white shadow-[0_4px_0_#46a302] disabled:opacity-50"
              >
                <RotateCcw className="size-5" />
                {t("newChallenge")}
              </button>
              <Link
                href={ROUTES.USER.STUDENT.HOME}
                className="flex flex-1 items-center justify-center rounded-3xl bg-[#2b415e] py-5 text-xl font-bold text-white shadow-[0_4px_0_#1e2e42]"
              >
                {t("backDashboard")}
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onRetry}
                disabled={!canRetry}
                className="flex flex-1 items-center justify-center gap-2 rounded-3xl bg-[#ff4b4b] py-5 text-xl font-bold text-white shadow-[0_4px_0_#d33131] disabled:opacity-50"
              >
                <RotateCcw className="size-5" />
                {t("retry")}
              </button>
              <Link
                href={journeyHref}
                className="flex flex-1 items-center justify-center gap-2 rounded-3xl border-2 border-[#cbd5e1] bg-white py-5 text-xl font-bold text-[#2b415e] shadow-[0_4px_0_#cbd5e1]"
              >
                <Home className="size-5" />
                {t("backHome")}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
