"use client";

import { useMemo, useState } from "react";
import {
  Award,
  Bell,
  BookOpen,
  CheckCircle2,
  Download,
  GraduationCap,
  MessageCircle,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTeacherCourseStatistics } from "@/modules/teacher/application/hooks/useTeacherCourseStatistics";
import { TeacherCourseWeeklyPerformanceChart } from "@/modules/teacher/presentation/components/charts/TeacherCourseWeeklyPerformanceChart";
import type {
  TeacherInteractionBoost,
  TeacherInteractiveStudent,
  TeacherStationInsight,
} from "@/modules/teacher/domain/types/teacher.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { DashboardBadge } from "@/shared/presentation/components/dashboard/DashboardBadge";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard/DashboardPageHeader";
import { DashboardStatCard } from "@/shared/presentation/components/dashboard/DashboardStatCard";
import { DashboardSegmentedControl } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Input } from "@/shared/presentation/components/ui/input";
import { TeacherCourseStatisticsSkeleton } from "@/modules/teacher/presentation/components/courses/TeacherCourseStatisticsSkeleton";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";

const statIcons = {
  enrolledStudents: Users,
  completionRate: CheckCircle2,
  avgGrades: Award,
  sessionAttendance: Users,
  activeStudents: Zap,
} as const;

type InteractionTier = "onTrack" | "needsHelp" | "atRisk";

const tierStyles: Record<
  InteractionTier,
  { bar: string; badge: string }
> = {
  onTrack: { bar: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700" },
  needsHelp: { bar: "bg-amber-500", badge: "bg-amber-50 text-amber-700" },
  atRisk: { bar: "bg-red-500", badge: "bg-red-50 text-red-700" },
};

function getInteractionTier(percent: number): InteractionTier {
  if (percent >= 70) return "onTrack";
  if (percent >= 35) return "needsHelp";
  return "atRisk";
}

function TeacherCourseTopStudentsTable({
  students,
  locale,
}: {
  students: TeacherInteractiveStudent[];
  locale: string;
}) {
  const t = useTranslations("teacher.dashboard");
  const [search, setSearch] = useState("");

  const maxPoints = useMemo(
    () => Math.max(...students.map((student) => student.interactionPoints), 1),
    [students],
  );

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) => student.name.toLowerCase().includes(query));
  }, [search, students]);

  return (
    <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-right text-lg font-bold text-slate-800">
            {t("courses.statistics.table.title")}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-xl border-slate-200"
              aria-label={t("courses.statistics.table.filter")}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("courses.statistics.table.searchPlaceholder")}
                className="h-10 rounded-xl border-slate-200 pr-10 text-right"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-500">
                <th className="px-4 py-3 font-medium">{t("courses.statistics.table.student")}</th>
                <th className="px-4 py-3 font-medium">{t("courses.statistics.table.interaction")}</th>
                <th className="px-4 py-3 font-medium">{t("courses.statistics.table.status")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                    {t("courses.statistics.table.empty")}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const percent = Math.round((student.interactionPoints / maxPoints) * 100);
                  const tier = getInteractionTier(percent);
                  const styles = tierStyles[tier];

                  return (
                    <tr key={student.id} className="border-t border-slate-100">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatarImageOrInitials
                            trackKey={student.id}
                            name={student.name}
                            imageUrl={student.profileImageUrl ?? null}
                            size="sm"
                          />
                          <span className="font-medium text-slate-800">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="font-semibold text-slate-700">
                              {student.interactionPoints.toLocaleString(locale)}
                            </span>
                            <span className="text-slate-500">{percent}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={cn("h-full rounded-full transition-all", styles.bar)}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                            styles.badge,
                          )}
                        >
                          {t(`courses.statistics.studentStatus.${tier}`)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function TeacherCourseChatInteractionCard({
  students,
  interactionBoost,
  locale,
}: {
  students: TeacherInteractiveStudent[];
  interactionBoost: TeacherInteractionBoost | null | undefined;
  locale: string;
}) {
  const t = useTranslations("teacher.dashboard");
  const totalInteraction = students.reduce((sum, student) => sum + student.interactionPoints, 0);

  return (
    <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
      <CardContent className="flex h-full flex-col space-y-5 p-6 text-right">
        <h3 className="text-lg font-bold text-slate-800">{t("courses.statistics.chat.title")}</h3>

        <div className="flex items-center justify-between gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#DCE6F5]">
            <MessageCircle className="h-5 w-5 text-[#2C4260]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500">{t("courses.statistics.chat.volumeLabel")}</p>
            <p className="text-3xl font-bold text-slate-800">
              {totalInteraction.toLocaleString(locale)}
            </p>
          </div>
        </div>

        {interactionBoost ? (
          <div className="space-y-3 rounded-2xl bg-sky-50 p-4">
            <div className="flex items-center justify-end gap-2">
              <p className="text-sm font-bold text-slate-800">
                {t("courses.statistics.chat.aiPredictions")}
              </p>
              <Sparkles className="h-4 w-4 shrink-0 text-violet-500" />
            </div>
            {interactionBoost.titleAr ? (
              <p className="text-sm font-semibold text-slate-800">{interactionBoost.titleAr}</p>
            ) : null}
            {interactionBoost.descriptionAr ? (
              <p className="text-sm leading-relaxed text-slate-600">{interactionBoost.descriptionAr}</p>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
            {t("courses.statistics.topStudents.empty")}
          </div>
        )}

        {interactionBoost?.actionLabelAr ? (
          <Button
            type="button"
            variant="outline"
            className="mt-auto w-full rounded-xl border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
          >
            {interactionBoost.actionLabelAr}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="mt-auto w-full rounded-xl border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
          >
            {t("courses.statistics.chat.openDiscussion")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function formatSessionTime(scheduledAtUtc: string, locale: string): string {
  if (!scheduledAtUtc) return "";
  const date = new Date(scheduledAtUtc);
  if (Number.isNaN(date.getTime())) return scheduledAtUtc;
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function StationInsightCard({
  insight,
  title,
  tone,
  actionLabel,
}: {
  insight: TeacherStationInsight;
  title: string;
  tone: "success" | "warning";
  actionLabel: string;
}) {
  const isSuccess = tone === "success";

  return (
    <Card
      className={cn(
        "rounded-[2rem] shadow-[var(--dashboard-shadow-soft)]",
        isSuccess ? "border-emerald-100 bg-emerald-50" : "border-amber-100 bg-amber-50",
      )}
    >
      <CardContent className="space-y-4 p-6 text-right">
        <div className="flex items-start justify-between gap-3">
          <DashboardBadge tone={isSuccess ? "success" : "warning"}>
            {insight.metricPercent}%
            {insight.metricType ? ` · ${insight.metricType}` : ""}
          </DashboardBadge>
          <h3 className="font-bold text-slate-800">{title}</h3>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-800">{insight.stationName}</p>
          <p className="text-xs text-slate-500">{insight.learningPathTitle}</p>
        </div>
        {insight.descriptionAr ? (
          <p className="text-sm text-slate-600">{insight.descriptionAr}</p>
        ) : null}
        <Button variant="outline" className="rounded-xl border-slate-300 bg-white">
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

export function TeacherCourseStatisticsDashboard({ courseId }: { courseId: string }) {
  const t = useTranslations("teacher.dashboard");
  const locale = useLocale();
  const [periodDays, setPeriodDays] = useState(30);
  const { data, isLoading, isError } = useTeacherCourseStatistics(courseId, { periodDays });

  if (isLoading) {
    return <TeacherCourseStatisticsSkeleton label={t("common.loading")} />;
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">{t("common.error")}</p>;
  }

  const { header } = data;
  const coverImageSrc = resolveFileUrl(header.coverImageUrl);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={header.title}
        description={t("courses.statistics.subtitleMeta", {
          students: header.enrolledStudentCount.toLocaleString(locale),
          paths: header.learningPathCount,
          performance: `${header.averageCompletionPercent}%`,
        })}
        breadcrumbs={[
          { label: t("sidebar.nav.home"), href: ROUTES.USER.TEACHER.HOME },
          { label: t("sidebar.nav.courses"), href: ROUTES.USER.TEACHER.COURSES.LIST },
          { label: header.title },
        ]}
        action={
          <div className="flex flex-wrap gap-3">
            <Button className="rounded-xl bg-[#2C4260]">
              <Download className="ml-2 h-4 w-4" />
              {t("courses.statistics.actions.exportReport")}
            </Button>
            <Button variant="outline" className="rounded-xl">
              <Bell className="ml-2 h-4 w-4" />
              {t("courses.statistics.actions.sendAlert")}
            </Button>
          </div>
        }
      />

      <div
        className={cn(
          "relative min-h-[12rem] overflow-hidden rounded-[2rem] p-6 text-white",
          coverImageSrc ? "bg-[#2C4260]" : "bg-gradient-to-br from-[#1e293b] via-[#2C4260] to-[#334155]",
        )}
      >
        {coverImageSrc ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImageSrc}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b]/95 via-[#2C4260]/75 to-[#2C4260]/40" />
          </>
        ) : null}
        <div className="relative space-y-4 text-right">
          <div className="flex flex-wrap items-center justify-end gap-2">
            {header.subjectNameAr ? (
              <DashboardBadge tone="neutral" className="bg-white/15 text-white">
                <BookOpen className="ml-1 h-3.5 w-3.5" />
                {header.subjectNameAr}
              </DashboardBadge>
            ) : null}
            {header.gradeNameAr ? (
              <DashboardBadge tone="neutral" className="bg-white/15 text-white">
                <GraduationCap className="ml-1 h-3.5 w-3.5" />
                {header.gradeNameAr}
              </DashboardBadge>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs text-white/70">{t("courses.statistics.header.enrolledStudents")}</p>
              <p className="text-2xl font-bold">{header.enrolledStudentCount.toLocaleString(locale)}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs text-white/70">{t("courses.statistics.header.learningPaths")}</p>
              <p className="text-2xl font-bold">{header.learningPathCount.toLocaleString(locale)}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs text-white/70">{t("courses.statistics.header.avgCompletion")}</p>
              <p className="text-2xl font-bold">{header.averageCompletionPercent}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* <DashboardSegmentedControl
        value={String(periodDays)}
        onChange={(value) => setPeriodDays(Number(value))}
        options={[
          { id: "7", label: t("coursesStatisticsOverview.filters.days7") },
          { id: "30", label: t("coursesStatisticsOverview.filters.days30") },
          { id: "90", label: t("coursesStatisticsOverview.filters.days90") },
        ]}
      /> */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {data.stats.map((stat) => {
          const Icon = statIcons[stat.id as keyof typeof statIcons] ?? Users;
          const indicator =
            stat.trend && stat.trend.startsWith("courses.") ? t(stat.trend) : stat.trend;
          return (
            <DashboardStatCard
              key={stat.id}
              label={t(stat.labelKey)}
              value={stat.value}
              indicator={indicator}
              indicatorClassName={
                stat.trendDirection === "down"
                  ? "text-red-500"
                  : stat.trendDirection === "neutral"
                    ? "text-slate-500"
                    : "text-emerald-600"
              }
              icon={Icon}
              iconTone="primary"
            />
          );
        })}
      </div>
      <div className="space-y-6">
        {data.performanceChart.length > 0 ? (
          <TeacherCourseWeeklyPerformanceChart
            title={t("courses.statistics.weeklyPerformance.title")}
            currentLabel={t("courses.statistics.weeklyPerformance.currentPeriod")}
            previousLabel={t("courses.statistics.weeklyPerformance.previousPeriod")}
            rows={data.performanceChart}
          />
        ) : (
          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="p-6 text-center text-sm text-slate-500">
              {t("courses.statistics.weeklyPerformance.empty")}
            </CardContent>
          </Card>
        )}

        {data.upcomingLiveSessions.length > 0 ? (
          <Card className="rounded-[2rem] border-[#2C4260] bg-[#2C4260] text-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6 text-right">
              <DashboardBadge tone="warning">{t("courses.statistics.upcoming.soon")}</DashboardBadge>
              <h3 className="font-bold">{t("courses.statistics.upcoming.title")}</h3>
              {data.upcomingLiveSessions.map((session) => (
                <div key={session.id} className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{session.title}</p>
                    <p className="text-xs text-white/70">
                      {formatSessionTime(session.scheduledAtUtc, locale)}
                    </p>
                  </div>
                  {session.relativeLabelAr ? (
                    <div className="shrink-0 rounded-lg bg-white/20 px-2 py-3 text-center text-xs font-bold">
                      {session.relativeLabelAr}
                    </div>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {(data.highestAchievement || data.hardestLesson) && (
          <div className="grid gap-4 md:grid-cols-2">
            {data.highestAchievement ? (
              <StationInsightCard
                insight={data.highestAchievement}
                title={t("courses.statistics.insights.highestAchievement")}
                tone="success"
                actionLabel={t("courses.statistics.insights.viewStation")}
              />
            ) : null}
            {data.hardestLesson ? (
              <StationInsightCard
                insight={data.hardestLesson}
                title={t("courses.statistics.insights.hardestLesson")}
                tone="warning"
                actionLabel={t("courses.statistics.insights.reviewContent")}
              />
            ) : null}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2.5fr)_minmax(280px,1fr)]">
        <TeacherCourseTopStudentsTable students={data.topInteractingStudents} locale={locale} />
        <TeacherCourseChatInteractionCard
          students={data.topInteractingStudents}
          interactionBoost={data.interactionBoost}
          locale={locale}
        />
      </div>

    </div>
  );
}
