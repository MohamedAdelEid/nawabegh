"use client";

import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import type { ParentHomeDashboard } from "@/modules/parent/domain/types/parentHome.types";
import {
  buildLevelDistribution,
  clampPercent,
  formatPercent,
  getPerformanceLevelKey,
} from "@/modules/parent/application/lib/parentHome.utils";
import { ParentProgressBar } from "@/modules/parent/presentation/components/home/ParentProgressBar";
import { ParentProgressRing } from "@/modules/parent/presentation/components/home/ParentProgressRing";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";

const levelBarColors = {
  excellent: "bg-[#c7af6d]",
  veryGood: "bg-[#2b415e]/80",
  good: "bg-[#2b415e]",
  acceptable: "bg-[#e4e4e4]",
} as const;

function deriveHomeAlerts(data: ParentHomeDashboard, locale: string) {
  const alerts: Array<{
    id: string;
    tone: "urgent" | "warning" | "info";
    title: string;
    message: string;
  }> = [];

  for (const child of data.children) {
    if (child.activeDaysLast30 < 3) {
      alerts.push({
        id: `${child.studentUserId}-inactive`,
        tone: "urgent",
        title: locale === "en" ? "Low activity" : "نشاط منخفض",
        message:
          locale === "en"
            ? `${child.fullName} has been less active recently`
            : `${child.fullName} أقل نشاطاً في الأيام الأخيرة`,
      });
    }
    if (child.progressPercent < 30) {
      alerts.push({
        id: `${child.studentUserId}-progress`,
        tone: "warning",
        title: locale === "en" ? "Low progress" : "تقدم منخفض",
        message:
          locale === "en"
            ? `${child.fullName} is below 30% progress`
            : `${child.fullName} أقل من 30% في التقدم`,
      });
    }
  }

  return alerts.slice(0, 5);
}

export function ParentHomeStatsSection({ data }: { data: ParentHomeDashboard }) {
  const t = useTranslations("parent.dashboard.home");
  const tCommon = useTranslations("parent.dashboard.common");
  const locale = useLocale();
  const summary = data.summary;
  const average = clampPercent(summary.averageProgressPercent);
  const stationRatio =
    summary.totalStationsCount > 0
      ? (summary.completedStationsCount / summary.totalStationsCount) * 100
      : 0;
  const levelKey = getPerformanceLevelKey(average);
  const levels = buildLevelDistribution(data.children);
  const maxLevelCount = Math.max(1, ...levels.map((item) => item.count));
  const alerts = deriveHomeAlerts(data, locale);
  const criticalCount = alerts.filter((item) => item.tone === "urgent").length;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-[18px] text-[#2b415e]" aria-hidden />
          <h2 className="text-xl font-bold text-[#2b415e]">{t("stats.title")}</h2>
        </div>
        <Link
          href={ROUTES.USER.PARENT.CHILDREN_STATS}
          className="text-sm font-bold text-[#64748b] transition hover:text-[#2b415e]"
        >
          {tCommon("moreStats")}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <article className="flex flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-[#e2e8f0] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)] lg:col-span-4">
          <p className="text-sm font-bold text-[#64748b]">{t("stats.averagePerformance")}</p>
          <ParentProgressRing value={average} color="#58cc02">
            <span className="text-[30px] font-bold leading-9 text-[#2b415e]">
              {formatPercent(average)}
            </span>
          </ParentProgressRing>
          <span className="rounded-full bg-[#dcf4cb] px-4 py-1 text-sm font-bold text-[#46a302]">
            {t(`levels.${levelKey}`)}
          </span>
        </article>

        <div className="flex flex-col gap-6 lg:col-span-4">
          <article className="flex flex-1 flex-col justify-between rounded-[20px] border-2 border-[#e2e8f0] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
            <p className="text-sm font-bold text-[#64748b]">{t("stats.successfulExams")}</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div className="flex items-center gap-1 text-sm font-bold text-[#58cc02]">
                <TrendingUp className="size-3" aria-hidden />
                <span>12%+</span>
              </div>
              <p className="text-end">
                <span className="text-4xl font-bold text-[#2b415e]">
                  {summary.totalAchievements}
                </span>{" "}
                <span className="text-sm text-[#2b415e]">{t("stats.examUnit")}</span>
              </p>
            </div>
            <p className="mt-2 text-xs italic text-[#64748b]">{t("stats.vsLastWeek")}</p>
          </article>

          <article className="flex flex-1 flex-col justify-between rounded-[20px] border-2 border-[#e2e8f0] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
            <p className="text-sm font-bold text-[#64748b]">{t("stats.stationCompletion")}</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs font-bold text-[#0f172a]">
                <span>
                  {t("stats.completedOf", {
                    completed: summary.completedStationsCount,
                  })}
                </span>
                <span>
                  {t("stats.outOf", { total: summary.totalStationsCount })}
                </span>
              </div>
              <ParentProgressBar value={stationRatio} />
            </div>
          </article>
        </div>

        <article className="flex flex-col gap-4 rounded-[20px] border-2 border-[#e2e8f0] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)] lg:col-span-4">
          <p className="text-sm font-bold text-[#64748b]">{t("stats.assessmentPerformance")}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center rounded-xl bg-[#f8f9fa] p-3">
              <p className="text-[10px] font-bold text-[#64748b]">{t("stats.averageScores")}</p>
              <p className="text-xl font-bold text-[#2b415e]">
                {formatPercent(summary.quizAverageScorePercent)}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl bg-[#f8f9fa] p-3">
              <p className="text-[10px] font-bold text-[#64748b]">{t("stats.successRate")}</p>
              <p className="text-xl font-bold text-[#58cc02]">
                {formatPercent(summary.lessonProgressPercent)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-[#e2e8f0] pt-3 text-xs text-[#0f172a]">
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-[#58cc02]" />
              {t("stats.successfulEvaluations", {
                count: summary.totalAchievements,
              })}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-[#ff4b4b]" />
              {t("stats.weakEvaluations", {
                count: Math.max(
                  0,
                  Math.round((100 - summary.quizAverageScorePercent) / 20),
                ),
              })}
            </span>
          </div>
        </article>

        <article className="rounded-[20px] border-2 border-[#e2e8f0] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)] lg:col-span-7">
          <p className="mb-4 text-sm font-bold text-[#64748b]">{t("stats.levelDistribution")}</p>
          <div className="flex h-[160px] items-end justify-center gap-3 sm:gap-4">
            {levels.map((item) => {
              const height = item.count === 0 ? 2 : Math.max(16, (item.count / maxLevelCount) * 110);
              return (
                <div key={item.key} className="flex w-full max-w-[120px] flex-col items-center gap-2">
                  <div
                    className={cn(
                      "w-full rounded-t-xl transition-all",
                      levelBarColors[item.key],
                    )}
                    style={{ height }}
                    title={`${item.count}`}
                  />
                  <p className="text-[10px] font-bold text-[#0f172a]">
                    {t(`levels.${item.key}`)}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500">{item.count}</p>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-[20px] border-2 border-[#e2e8f0] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)] lg:col-span-5">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#e2e8f0] pb-3">
            <h3 className="text-sm font-bold text-[#2b415e]">{t("stats.alertsSummary")}</h3>
            {criticalCount > 0 ? (
              <span className="rounded-full bg-[#ffe4e4] px-2 py-1 text-[10px] font-bold text-[#ff4b4b]">
                {t("stats.criticalAlerts", { count: criticalCount })}
              </span>
            ) : null}
          </div>
          {alerts.length === 0 ? (
            <p className="text-sm text-[#64748b]">{t("stats.noAlerts")}</p>
          ) : (
            <ul className="space-y-3">
              {alerts.map((alert) => (
                <li key={alert.id} className="flex items-start gap-3">
                  {alert.tone === "urgent" ? (
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#ff4b4b]" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#c7af6d]" />
                  )}
                  <div className="min-w-0 text-start">
                    <p className="text-xs font-medium text-[#0f172a]">{alert.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  );
}
