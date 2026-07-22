"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Clock3,
  TrendingUp,
  TriangleAlert,
  UserX,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { useParentChildrenStats } from "@/modules/parent/application/hooks/useParentChildrenStats";
import {
  clampPercent,
  formatPercent,
  getAchievementSpeedKey,
  getAlertTone,
  getDefaultAlertCopy,
  resolveLocalizedText,
} from "@/modules/parent/application/lib/parentHome.utils";
import { ParentChildrenStatsSkeleton } from "@/modules/parent/presentation/components/home/ParentDashboardSkeletons";
import { ParentProgressBar } from "@/modules/parent/presentation/components/home/ParentProgressBar";
import { useDirection } from "@/shared/application/hooks/useDirection";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  chartResponsiveHeightClass,
  type ChartConfig,
} from "@/shared/presentation/components/ui/chart";
import { cn } from "@/shared/application/lib/cn";
import type { ParentAlertType } from "@/modules/parent/domain/types/parentHome.types";

const trendChartConfig = {
  results: { label: "Results", color: "#c7af6d" },
} satisfies ChartConfig;

const distributionColors = ["#c7af6d", "#2b415e", "#58cc02", "#94a3b8", "#f59e0b"];

const alertIcons: Record<ParentAlertType, typeof AlertTriangle> = {
  inactivity: TriangleAlert,
  account_inactive: UserX,
  low_progress: Clock3,
  low_quiz_score: AlertTriangle,
};

type PeriodKey = "currentMonth" | "semester";

export function ParentChildrenStatsDashboard() {
  const t = useTranslations("parent.dashboard.childrenStats");
  const tCommon = useTranslations("parent.dashboard.common");
  const tLevels = useTranslations("parent.dashboard.home.levels");
  const locale = useLocale();
  const { isRtl } = useDirection();
  const [period, setPeriod] = useState<PeriodKey>("currentMonth");
  const { data, isLoading, isError, refetch, isFetching } = useParentChildrenStats();

  const trendData = useMemo(() => {
    if (!data) return [];
    return data.weeklyTrend.map((point, index) => ({
      label:
        resolveLocalizedText(locale, point.labelAr, point.labelEn) ||
        `${locale === "en" ? "Week" : "الأسبوع"} ${index + 1}`,
      results: point.activityCount,
    }));
  }, [data, locale]);

  const distributionData = useMemo(() => {
    if (!data) return [];
    return data.childrenComparison.map((child) => ({
      name: child.fullName,
      value: Math.max(child.points, 1),
      progress: clampPercent(child.progressPercent),
    }));
  }, [data]);

  if (isLoading) {
    return <ParentChildrenStatsSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-[20px] border border-red-100 bg-white p-6">
        <p className="text-sm text-red-600">{tCommon("error")}</p>
        <Button type="button" onClick={() => refetch()} disabled={isFetching}>
          {tCommon("retry")}
        </Button>
      </div>
    );
  }

  const summary = data.summary;
  const average = clampPercent(summary.averageProgressPercent);
  const speedKey = getAchievementSpeedKey(
    summary.completedStationsCount,
    summary.totalStationsCount,
  );
  const criticalCount = data.alerts.filter((alert) => alert.severity === "urgent").length;
  const levelLabel =
    average >= 85
      ? tLevels("excellent")
      : average >= 70
        ? tLevels("veryGood")
        : average >= 55
          ? tLevels("good")
          : tLevels("acceptable");

  return (
    <div className="mx-auto flex w-full flex-col gap-6 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1 text-start">
          <p className="text-xs text-[#64748b]">{t("breadcrumb")}</p>
          <h1 className="text-2xl font-bold text-[#2b415e]">{t("title")}</h1>
          <p className="text-sm text-[#64748b]">{t("subtitle")}</p>
        </div>

        <div className="inline-flex gap-2 self-start rounded-xl border border-[#e2e8f0] bg-white p-1.5 shadow-sm">
          {(["currentMonth", "semester"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setPeriod(key)}
              className={cn(
                "rounded-lg px-4 py-2 text-xs font-bold transition",
                period === key
                  ? "bg-[#2b415e] text-white"
                  : "text-[#64748b] hover:bg-slate-50",
              )}
            >
              {t(`period.${key}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <article className="relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-[#2b415e]" />
          <p className="text-sm font-bold text-[#64748b]">{t("cards.averagePerformance")}</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="rounded-full bg-[#dcf4cb] px-3 py-1 text-xs font-bold text-[#46a302]">
              {levelLabel}
            </span>
            <p className="text-4xl font-bold text-[#2b415e]">{formatPercent(average, 1)}</p>
          </div>
        </article>

        <article className="relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-[#c7af6d]" />
          <p className="text-sm font-bold text-[#64748b]">{t("cards.successfulExams")}</p>
          <div className="mt-4 flex items-end justify-between gap-3">
            <p className="inline-flex items-center gap-1 text-sm font-bold text-[#58cc02]">
              <TrendingUp className="size-3.5" aria-hidden />
              {t("cards.vsLastWeek", { percent: 12 })}
            </p>
            <p className="text-end">
              <span className="text-4xl font-bold text-[#2b415e]">
                {data.examStats.passedAttempts || summary.totalAchievements}
              </span>{" "}
              <span className="text-sm text-[#2b415e]">{t("cards.examUnit")}</span>
            </p>
          </div>
        </article>

        <article className="relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-[#58cc02]" />
          <p className="text-sm font-bold text-[#64748b]">{t("cards.academicCompletion")}</p>
          <p className="mt-3 text-2xl font-bold text-[#2b415e]">
            {t("cards.stationsValue", {
              completed: summary.completedStationsCount,
              total: summary.totalStationsCount,
            })}
          </p>
          <div className="mt-4 space-y-2">
            <ParentProgressBar
              value={
                summary.totalStationsCount > 0
                  ? (summary.completedStationsCount / summary.totalStationsCount) * 100
                  : 0
              }
              barClassName="bg-[#58cc02]"
            />
            <p className="inline-flex items-center gap-2 text-xs font-bold text-[#46a302]">
              <span className="size-2 rounded-full bg-[#58cc02]" />
              {t("cards.completionSpeed", {
                speed: t(`cards.speeds.${speedKey}`),
              })}
            </p>
          </div>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <article className="rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)] lg:col-span-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-[#2b415e]">{t("trend.title")}</h2>
            <span className="inline-flex items-center gap-2 text-[10px] font-bold text-[#64748b]">
              <span className="size-2 rounded-full bg-[#c7af6d]" />
              {t("trend.legend")}
            </span>
          </div>
          <ChartContainer
            config={trendChartConfig}
            className={`aspect-[16/8] ${chartResponsiveHeightClass}`}
          >
            <BarChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                orientation={isRtl ? "right" : "left"}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="results" fill="#c7af6d" radius={[10, 10, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ChartContainer>
        </article>

        <article className="rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)] lg:col-span-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-[#2b415e]">{t("alerts.title")}</h2>
            {criticalCount > 0 ? (
              <span className="rounded-full bg-[#ff4b4b] px-2 py-0.5 text-[10px] font-bold text-white">
                {t("alerts.criticalCount", { count: criticalCount })}
              </span>
            ) : null}
          </div>

          {data.alerts.length === 0 ? (
            <p className="text-sm text-[#64748b]">{t("alerts.empty")}</p>
          ) : (
            <ul className="space-y-3">
              {data.alerts.slice(0, 6).map((alert, index) => {
                const tone = getAlertTone(alert.severity);
                const copy = getDefaultAlertCopy(alert, locale);
                const Icon = alertIcons[alert.type] ?? AlertTriangle;
                const title =
                  copy.title ||
                  t(`alerts.types.${alert.type}`) ||
                  alert.childFullName ||
                  "";
                const message =
                  copy.message ||
                  alert.childFullName ||
                  "";

                return (
                  <li
                    key={`${alert.type}-${alert.studentUserId ?? index}`}
                    className={cn(
                      "flex items-center gap-3 rounded-xl p-3",
                      tone.container,
                    )}
                  >
                    <div className="min-w-0 flex-1 text-start">
                      <p className={cn("text-xs font-bold", tone.title)}>{title}</p>
                      {message ? (
                        <p className={cn("text-[10px]", tone.message)}>{message}</p>
                      ) : null}
                    </div>
                    <Icon className={cn("size-4 shrink-0", tone.title)} aria-hidden />
                  </li>
                );
              })}
            </ul>
          )}
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
          <h2 className="mb-4 text-sm font-bold text-[#2b415e]">{t("distribution.title")}</h2>
          {distributionData.length === 0 ? (
            <p className="text-sm text-[#64748b]">{t("distribution.empty")}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-[160px_1fr] sm:items-center">
              <ChartContainer
                config={{ value: { label: "Points", color: "#c7af6d" } }}
                className="mx-auto aspect-square h-40"
              >
                <PieChart>
                  <Pie
                    data={distributionData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={42}
                    outerRadius={68}
                    paddingAngle={3}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={distributionColors[index % distributionColors.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>

              <ul className="space-y-4">
                {data.childrenComparison.map((child, index) => (
                  <li key={child.studentUserId} className="space-y-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-bold text-[#0f172a]">{child.fullName}</span>
                      <span className="font-bold text-[#64748b]">{child.points}</span>
                    </div>
                    <ParentProgressBar
                      value={child.progressPercent}
                      barClassName={
                        index % 2 === 0 ? "bg-[#c7af6d]" : "bg-[#2b415e]"
                      }
                      heightClassName="h-2.5"
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>

        <article className="rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
          <h2 className="mb-6 text-sm font-bold text-[#2b415e]">{t("exams.title")}</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-[#f8f9fa] p-4">
              <p className="text-xs text-[#64748b]">{t("exams.completed")}</p>
              <p className="mt-2 text-2xl font-bold text-[#2b415e]">
                {data.examStats.totalAttempts}
              </p>
            </div>
            <div className="rounded-xl bg-[#f8f9fa] p-4">
              <p className="text-xs text-[#64748b]">{t("exams.successRate")}</p>
              <p className="mt-2 text-2xl font-bold text-[#58cc02]">
                {formatPercent(data.examStats.successRatePercent)}
              </p>
            </div>
            <div className="rounded-xl bg-[#f8f9fa] p-4">
              <p className="text-xs text-[#64748b]">{t("exams.averageScore")}</p>
              <p className="mt-2 text-2xl font-bold text-[#2b415e]">
                {formatPercent(data.examStats.averageScorePercent)}
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
