"use client";

import { CheckCircle2, Clock3, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SubscriptionsDashboardStatsDto } from "@/modules/student/domain/progress/progress.types";
import { SubscriptionsProgressRing } from "./SubscriptionsProgressRing";

type SubscriptionsStatsRowProps = {
  stats: SubscriptionsDashboardStatsDto;
};

export function SubscriptionsStatsRow({ stats }: SubscriptionsStatsRowProps) {
  const t = useTranslations("student.dashboard.subscriptions.stats");
  const peerPercentile = stats.betterThanPeersPercentile;

  return (
    <section className="grid gap-6 lg:grid-cols-4">
      <div className="grid gap-6 sm:grid-cols-3 lg:col-span-3">
        <article className="rounded-3xl border-e-4 border-[#c7a55b] bg-white p-6 shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)]">
          <div className="flex items-start justify-between">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[rgba(199,165,91,0.1)] text-[#c7a55b]">
              <Clock3 className="size-5" aria-hidden />
            </span>
            <div className="text-end">
              <p className="text-sm font-bold text-[#64748b]">{t("learningHours")}</p>
              <p className="text-4xl font-bold text-[#2c4260]">
                {stats.totalLearningHoursApproximate}
              </p>
            </div>
          </div>
        </article>

        <article className="relative overflow-hidden rounded-3xl border-e-4 border-[#10b981] bg-white p-6 shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)]">
          <div className="flex items-start justify-between">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[rgba(16,185,129,0.1)] text-[#10b981]">
              <CheckCircle2 className="size-5" aria-hidden />
            </span>
            <div className="text-end">
              <p className="text-sm font-bold text-[#64748b]">{t("completedCourses")}</p>
              <p className="text-4xl font-bold text-[#2c4260]">{stats.completedCoursesCount}</p>
            </div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#f1f5f9]">
            <div
              className="h-full rounded-full bg-[#10b981]"
              style={{
                width: `${stats.totalCourses > 0 ? Math.round((stats.completedCoursesCount / stats.totalCourses) * 100) : 0}%`,
              }}
            />
          </div>
          {peerPercentile != null ? (
            <p className="mt-3 text-end text-[10px] text-[#94a3b8]">
              {t("peerCongrats", { percent: Math.round(peerPercentile) })}
            </p>
          ) : null}
        </article>

        <article className="relative overflow-hidden rounded-3xl border border-[rgba(226,232,240,0.8)] bg-gradient-to-br from-[#2c4260] to-[#3d5a82] p-6 shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)]">
          <div className="text-end text-white">
            <p className="text-sm font-bold text-white/70">{t("totalCourses")}</p>
            <p className="text-4xl font-bold">{stats.totalCourses}</p>
          </div>
          {stats.newCoursesThisMonth > 0 ? (
            <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-white/80">
              <TrendingUp className="size-3" aria-hidden />
              <span>{t("newCoursesThisMonth", { count: stats.newCoursesThisMonth })}</span>
            </div>
          ) : null}
        </article>
      </div>

      <SubscriptionsProgressRing
        percentage={stats.overallProgressPercentage}
        label={t("overallProgress")}
        caption={t("overallProgressLabel")}
      />
    </section>
  );
}
