"use client";

import Link from "next/link";
import { Award, CalendarDays, Download, GraduationCap, Trophy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useParentChildDetails } from "@/modules/parent/application/hooks/useParentChildDetails";
import {
  getChildAlertTone,
  getEstimatedLevel,
} from "@/modules/parent/application/lib/parentChildren.utils";
import {
  clampPercent,
  formatPercent,
  resolveLocalizedText,
} from "@/modules/parent/application/lib/parentHome.utils";
import { ParentAvatar } from "@/modules/parent/presentation/components/home/ParentAvatar";
import { ParentProgressBar } from "@/modules/parent/presentation/components/home/ParentProgressBar";
import type { ParentChildDetails } from "@/modules/parent/domain/types/parentChildren.types";
import { useDirection } from "@/shared/application/hooks/useDirection";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  chartResponsiveHeightClass,
  type ChartConfig,
} from "@/shared/presentation/components/ui/chart";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { cn } from "@/shared/application/lib/cn";

const activityChartConfig = {
  activity: { label: "Activity", color: "#c7af6d" },
} satisfies ChartConfig;

function KpiCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <article className="relative overflow-hidden rounded-[16px] bg-white p-5 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
      <div className={cn("absolute inset-x-0 top-0 h-1.5", accent)} />
      <p className="text-xs font-bold text-[#64748b]">{label}</p>
      <p className="mt-3 text-2xl font-bold text-[#2b415e]">{value}</p>
    </article>
  );
}

const upcomingTaskTone: Record<string, string> = {
  info: "border-[#dbe3f3] bg-[#e8f0ff]",
  success: "border-[rgba(88,204,2,0.3)] bg-[#dcf4cb]",
  warning: "border-[rgba(199,175,109,0.4)] bg-[#f4ecd8]",
};

function ProfileCard({ details, studentUserId }: { details: ParentChildDetails; studentUserId: string }) {
  const t = useTranslations("parent.dashboard.childrenManagement.report");
  const locale = useLocale();
  const estimatedLevel = getEstimatedLevel(details);
  const upcomingTasks = details.upcomingTasks ?? [];

  return (
    <article className="flex flex-col gap-6 rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <ParentAvatar
            url={details.profileImageUrl}
            name={details.fullName}
            className="size-16"
            roundedClassName="rounded-full"
          />
          <span className="absolute -bottom-1 -start-1 rounded-full bg-[#c7af6d] px-2 py-0.5 text-[10px] font-bold text-white">
            {t("level", { level: estimatedLevel })}
          </span>
        </div>
        <div className="min-w-0 text-start">
          <h3 className="truncate text-lg font-bold text-[#2b415e]">{details.fullName}</h3>
          <p className="text-sm text-[#64748b]">
            {resolveLocalizedText(locale, details.gradeNameAr, details.gradeNameEn) ||
              details.schoolName ||
              "—"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-[#64748b]">{t("totalProgress")}</span>
          <span className="font-bold text-[#2b415e]">
            {formatPercent(clampPercent(details.progressPercent))}
          </span>
        </div>
        <ParentProgressBar value={details.progressPercent} barClassName="bg-[#58cc02]" />
      </div>

      <div>
        <h4 className="mb-3 text-sm font-bold text-[#2b415e]">{t("upcomingTasks")}</h4>
        {upcomingTasks.length === 0 ? (
          <p className="text-sm text-[#64748b]">{t("noUpcomingTasks")}</p>
        ) : (
          <ul className="space-y-2.5">
            {upcomingTasks.slice(0, 5).map((task) => {
              const title = resolveLocalizedText(locale, task.titleAr, task.titleEn);
              const scheduled = resolveLocalizedText(
                locale,
                task.scheduledLabelAr,
                task.scheduledLabelEn,
              );
              return (
                <li
                  key={task.id}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5",
                    upcomingTaskTone[task.tone ?? "info"] ?? upcomingTaskTone.info,
                  )}
                >
                  <span className="min-w-0 truncate text-sm font-semibold text-[#2b415e]">
                    {title}
                  </span>
                  {scheduled ? (
                    <span className="shrink-0 text-xs text-[#64748b]">{scheduled}</span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Link
        href={ROUTES.USER.PARENT.CHILD_SCHEDULE(studentUserId)}
        className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#e2e8f0] bg-[#f8f9fa] py-3 text-sm font-bold text-[#2b415e] transition-colors hover:bg-[#eef1f4]"
      >
        <CalendarDays className="size-4" aria-hidden />
        {t("viewCalendar")}
      </Link>
    </article>
  );
}

export function ParentChildReportDashboard({ studentUserId }: { studentUserId: string }) {
  const t = useTranslations("parent.dashboard.childrenManagement.report");
  const tCommon = useTranslations("parent.dashboard.common");
  const locale = useLocale();
  const { isRtl } = useDirection();
  const { data: details, isLoading, isError, refetch, isFetching } =
    useParentChildDetails(studentUserId);

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-8">
        <Skeleton className="h-16 w-96" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-[16px]" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-12">
          <Skeleton className="h-[28rem] rounded-[20px] lg:col-span-5" />
          <Skeleton className="h-[28rem] rounded-[20px] lg:col-span-7" />
        </div>
      </div>
    );
  }

  if (isError || !details) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-[20px] border border-red-100 bg-white p-6">
        <p className="text-sm text-red-600">{tCommon("error")}</p>
        <Button type="button" onClick={() => refetch()} disabled={isFetching}>
          {tCommon("retry")}
        </Button>
      </div>
    );
  }

  const activityData = (details.weeklyActivity ?? []).map((point, index) => ({
    label:
      resolveLocalizedText(locale, point.labelAr, point.labelEn) ||
      `${locale === "en" ? "Day" : "يوم"} ${index + 1}`,
    activity: point.activityCount,
  }));

  const alerts = details.alerts ?? [];

  return (
    <div className="mx-auto flex w-full flex-col gap-8 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1 text-start">
          <p className="text-xs text-[#64748b]">{t("breadcrumb")}</p>
          <h1 className="text-2xl font-bold text-[#2b415e]">
            {t("title", { name: details.fullName })}
          </h1>
          <p className="text-sm text-[#64748b]">{t("subtitle", { name: details.fullName })}</p>
        </div>
        <Button
          type="button"
          className="h-12 gap-2 self-start rounded-xl bg-[#2b415e] px-6 text-sm font-bold text-white hover:bg-[#24384f]"
          onClick={() => notify.success(t("comingSoonDownload"))}
        >
          <Download className="size-4" aria-hidden />
          {t("download")}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t("totalProgress")}
          value={formatPercent(clampPercent(details.progressPercent))}
          accent="bg-[#58cc02]"
        />
        <KpiCard
          label={t("totalTests")}
          value={String(details.examStats?.totalAttempts ?? 0)}
          accent="bg-[#2b415e]"
        />
        <KpiCard label={t("totalPoints")} value={String(details.points)} accent="bg-[#c7af6d]" />
        <KpiCard
          label={t("badgesCount")}
          value={String(details.achievementsCount)}
          accent="bg-[#d33131]"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <ProfileCard details={details} studentUserId={studentUserId} />
        </div>

        <div className="space-y-6 lg:col-span-7">
          <article className="rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-[#2b415e]">{t("last7Days")}</h2>
            </div>
            {activityData.length === 0 ? (
              <p className="text-sm text-[#64748b]">{t("noWeeklyActivity")}</p>
            ) : (
              <ChartContainer
                config={activityChartConfig}
                className={`aspect-[16/8] ${chartResponsiveHeightClass}`}
              >
                <BarChart data={activityData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} orientation={isRtl ? "right" : "left"} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="activity" fill="#c7af6d" radius={[10, 10, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ChartContainer>
            )}
          </article>

          <article className="flex flex-col justify-between gap-6 rounded-[20px] bg-[#2b415e] p-6 shadow-[0px_4px_0px_#1e2e42] sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#c7af6d]">
                <GraduationCap className="size-6" aria-hidden />
              </span>
              <div className="text-start">
                <p className="text-xs text-white/70">{t("rankTitle")}</p>
                <p className="text-lg font-bold text-white">
                  {details.schoolRank != null
                    ? t("rankInSchool") + ` #${details.schoolRank}`
                    : "—"}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 self-start rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white sm:self-center">
              <Trophy className="size-4 text-[#c7af6d]" aria-hidden />
              {t("schoolAverage", {
                value: formatPercent(details.examStats?.averageScorePercent ?? 0),
              })}
            </span>
          </article>
        </div>
      </div>

      <article className="rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#2b415e]">
          <Award className="size-4 text-[#c7af6d]" aria-hidden />
          {t("alertsTitle")}
        </h2>
        {alerts.length === 0 ? (
          <p className="text-sm text-[#64748b]">{t("noAlerts")}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {alerts.map((alert, index) => {
              const tone = getChildAlertTone(alert.severity);
              const title = resolveLocalizedText(locale, alert.titleAr, alert.titleEn);
              const message = resolveLocalizedText(locale, alert.messageAr, alert.messageEn);
              return (
                <div
                  key={`${alert.type}-${index}`}
                  className={cn("rounded-xl p-4 text-start", tone.container)}
                >
                  <p className={cn("text-sm font-bold", tone.title)}>{title}</p>
                  {message ? (
                    <p className={cn("mt-1 text-xs", tone.message)}>{message}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </article>
    </div>
  );
}
