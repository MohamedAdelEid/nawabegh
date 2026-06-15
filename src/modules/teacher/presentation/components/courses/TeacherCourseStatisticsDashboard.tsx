"use client";

import { useMemo, useState } from "react";
import {
  Award,
  Beaker,
  Bell,
  CheckCircle2,
  Download,
  Flag,
  Lightbulb,
  Lock,
  Map,
  MessageCircle,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  Wand2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useTeacherCourseStatistics } from "@/modules/teacher/application/hooks/useTeacherCourseStatistics";
import { TeacherCourseWeeklyPerformanceChart } from "@/modules/teacher/presentation/components/charts/TeacherCourseWeeklyPerformanceChart";
import { TeacherWeeklyInteractionBarChart } from "@/modules/teacher/presentation/components/charts/TeacherWeeklyInteractionBarChart";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { DashboardBadge } from "@/shared/presentation/components/dashboard/DashboardBadge";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard/DashboardPageHeader";
import { DashboardStatCard } from "@/shared/presentation/components/dashboard/DashboardStatCard";
import {
  DashboardDataTable,
  DashboardTableCard,
  type DashboardDataTableColumn,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";
import type { TeacherCourseStudentProgressRow } from "@/modules/teacher/domain/types/teacher.types";

const statIcons = {
  totalStudents: Users,
  completionRate: CheckCircle2,
  avgTestScores: Award,
  avgGrades: Award,
  sessionAttendance: Users,
  studyTime: Zap,
  activeStudents: Zap,
  activeToday: Zap,
} as const;

const stationColors = {
  primary: "bg-[#2C4260]",
  warning: "bg-[#C9A227]",
  success: "bg-emerald-500",
  neutral: "bg-slate-400",
} as const;

const journeyIcons = {
  s1: Map,
  s2: Beaker,
  s3: Sparkles,
  s4: Lock,
  final: Flag,
} as const;

const statusTone = {
  onTrack: "success",
  needsHelp: "warning",
  atRisk: "danger",
} as const;

export function TeacherCourseStatisticsDashboard({ courseId }: { courseId: string }) {
  const t = useTranslations("teacher.dashboard");
  const [studentQuery, setStudentQuery] = useState("");
  const { data, isLoading, isError } = useTeacherCourseStatistics(courseId);

  const columns = useMemo<DashboardDataTableColumn<TeacherCourseStudentProgressRow>[]>(
    () => [
      {
        id: "name",
        header: t("courses.statistics.table.student"),
        renderCell: (row) => (
          <div className="flex items-center justify-end gap-3">
            <span className="font-medium text-slate-800">{t(row.nameKey)}</span>
            <UserAvatarImageOrInitials
              trackKey={row.id}
              name={t(row.nameKey)}
              imageUrl={null}
              size="sm"
            />
          </div>
        ),
      },
      {
        id: "completion",
        header: t("courses.statistics.table.completion"),
        renderCell: (row) => (
          <div className="space-y-2">
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#2C4260]"
                style={{ width: `${row.completionPercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">{row.completionPercent}%</p>
          </div>
        ),
      },
      {
        id: "lastActivity",
        header: t("courses.statistics.table.lastActivity"),
        renderCell: (row) => (
          <span className="text-slate-500">
            {row.lastActivityKey ? t(row.lastActivityKey) : "—"}
          </span>
        ),
      },
      {
        id: "status",
        header: t("courses.statistics.table.status"),
        renderCell: (row) => (
          <DashboardBadge tone={statusTone[row.status]}>
            {t(`courses.statistics.studentStatus.${row.status}`)}
          </DashboardBadge>
        ),
      },
    ],
    [t],
  );

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-[2rem]" />;
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">{t("common.error")}</p>;
  }

  const filteredStudents = data.studentProgress.filter((row) => {
    if (!studentQuery.trim()) return true;
    return t(row.nameKey).toLowerCase().includes(studentQuery.trim().toLowerCase());
  });

  const hasEnhancedLayout = Boolean(data.weeklyPerformance?.length);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={t(data.titleKey)}
        description={
          data.subtitleMeta
            ? t("courses.statistics.subtitleMeta", {
                students: data.subtitleMeta.students.toLocaleString(),
                paths: data.subtitleMeta.learningPaths,
                performance: data.subtitleMeta.avgPerformance,
              })
            : t("courses.statistics.description")
        }
        breadcrumbs={[
          { label: t("sidebar.nav.home"), href: ROUTES.USER.TEACHER.HOME },
          { label: t("sidebar.nav.courses"), href: ROUTES.USER.TEACHER.COURSES.LIST },
          { label: t(data.titleKey) },
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
        className={
          hasEnhancedLayout
            ? "grid gap-4 md:grid-cols-2 xl:grid-cols-5"
            : "grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        }
      >
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
                  : stat.id === "activeToday"
                    ? "text-red-500"
                    : "text-emerald-600"
              }
              icon={Icon}
              iconTone={stat.id === "activeToday" ? "danger" : "primary"}
            />
          );
        })}
      </div>

      {hasEnhancedLayout ? (
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4">
            <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
              <CardContent className="space-y-4 p-6 text-right">
                <h3 className="font-bold text-slate-800">
                  {t("courses.statistics.topStudents.title")}
                </h3>
                {(data.topStudents ?? []).map((student) => (
                  <div key={student.id} className="flex items-center justify-between gap-3">
                    <DashboardBadge tone="primary">LVL {student.level}</DashboardBadge>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-slate-800">{t(student.nameKey)}</p>
                        <p className="text-xs text-slate-500">
                          {t("courses.statistics.topStudents.points", {
                            count: student.interactionPoints.toLocaleString(),
                          })}
                        </p>
                      </div>
                      <UserAvatarImageOrInitials
                        trackKey={student.id}
                        name={t(student.nameKey)}
                        imageUrl={null}
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-[#2C4260] bg-[#2C4260] text-white shadow-[var(--dashboard-shadow-soft)]">
              <CardContent className="space-y-4 p-6 text-right">
                <DashboardBadge tone="warning">{t("courses.statistics.upcoming.soon")}</DashboardBadge>
                <h3 className="font-bold">{t("courses.statistics.upcoming.title")}</h3>
                {(data.upcomingSessions ?? []).map((session) => (
                  <div key={session.id} className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{t(session.titleKey)}</p>
                      <p className="text-xs text-white/70">
                        {session.timeLabel} ·{" "}
                        {t("courses.statistics.upcoming.registered", {
                          count: session.registeredCount,
                        })}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/20 px-2 py-3 text-center text-xs font-bold">
                      {session.dateLabel}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {data.interactionTipKey ? (
              <Card className="rounded-[2rem] border-emerald-100 bg-emerald-50 shadow-[var(--dashboard-shadow-soft)]">
                <CardContent className="space-y-3 p-6 text-right">
                  <Lightbulb className="h-6 w-6 text-emerald-600" />
                  <p className="text-sm text-emerald-900">{t(data.interactionTipKey)}</p>
                  <Button variant="link" className="h-auto p-0 text-emerald-700">
                    {t("courses.statistics.interactionTipAction")}
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="space-y-6">
            {data.weeklyPerformance ? (
              <TeacherCourseWeeklyPerformanceChart
                title={t("courses.statistics.weeklyPerformance.title")}
                lessonLabel={t("courses.statistics.weeklyPerformance.lessonCompletion")}
                testLabel={t("courses.statistics.weeklyPerformance.testResults")}
                rows={data.weeklyPerformance.map((row) => ({
                  ...row,
                  weekLabel: t(row.weekKey),
                }))}
              />
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              {(data.highlightCards ?? []).map((card) => (
                <Card
                  key={card.id}
                  className={
                    card.tone === "warning"
                      ? "rounded-[2rem] border-amber-100 bg-amber-50"
                      : "rounded-[2rem] border-rose-100 bg-rose-50"
                  }
                >
                  <CardContent className="space-y-4 p-6 text-right">
                    <h3 className="font-bold text-slate-800">{t(card.titleKey)}</h3>
                    <p className="text-sm text-slate-600">{t(card.descriptionKey)}</p>
                    <Button
                      variant="outline"
                      className="rounded-xl border-slate-300 bg-white"
                    >
                      {t(card.actionKey)}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <TeacherWeeklyInteractionBarChart
            title={t("courses.statistics.weeklyInteraction.title")}
            legendLabel={t("courses.statistics.weeklyInteraction.legend")}
            rows={data.weeklyInteraction.map((row) => ({
              ...row,
              dayLabel: t(row.dayKey),
            }))}
          />

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-6 p-6">
              <h2 className="text-right text-xl font-bold text-slate-800">
                {t("courses.statistics.stationPerformance.title")}
              </h2>
              <div className="space-y-4">
                {data.stationPerformance.map((station) => (
                  <div key={station.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{station.percent}%</span>
                      <span className="text-slate-600">{t(station.labelKey)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${stationColors[station.tone]}`}
                        style={{ width: `${station.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-right">
                <Lightbulb className="mt-1 h-5 w-5 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-900">{t(data.insightKey)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
        <CardContent className="space-y-6 p-6">
          <h2 className="text-right text-xl font-bold text-slate-800">
            {t("courses.statistics.journey.title")}
          </h2>
          <div className="flex flex-wrap items-start justify-between gap-4">
            {data.journeyStations.map((station) => {
              const Icon = journeyIcons[station.id as keyof typeof journeyIcons] ?? Map;
              const circleClass =
                station.status === "completed"
                  ? "bg-[#2C4260] text-white"
                  : station.status === "current"
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-500";
              return (
                <div key={station.id} className="flex min-w-[120px] flex-1 flex-col items-center gap-2 text-center">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${circleClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">{t(station.labelKey)}</p>
                  <p className="text-xs text-slate-500">
                    {station.status === "locked"
                      ? t(`courses.statistics.journey.status.${station.status}`)
                      : t("courses.statistics.journey.completedCount", {
                          count: station.completedCount,
                        })}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <DashboardTableCard title={t("courses.statistics.table.title")}>
          <div className="border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="rounded-xl" aria-label={t("courses.statistics.table.filter")}>
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={studentQuery}
                  onChange={(event) => setStudentQuery(event.target.value)}
                  placeholder={t("courses.statistics.table.searchPlaceholder")}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pr-10 pl-4 text-right text-sm outline-none focus:border-[#2C4260]"
                />
              </div>
            </div>
          </div>
          <DashboardDataTable
            rows={filteredStudents}
            columns={columns}
            getRowKey={(row) => row.id}
            emptyMessage={t("courses.statistics.table.empty")}
          />
        </DashboardTableCard>

        <div className="space-y-4">
          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6 text-right">
              <div className="flex items-center justify-between">
                <MessageCircle className="h-6 w-6 text-[#2C4260]" />
                <h3 className="font-bold text-slate-800">{t("courses.statistics.chat.title")}</h3>
              </div>
              <p className="text-3xl font-bold text-slate-800">{data.chatMessagesToday.toLocaleString()}</p>
              <p className="text-sm text-slate-500">{t("courses.statistics.chat.messagesToday")}</p>
              <div className="flex flex-wrap justify-end gap-2">
                {data.chatTags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-blue-100 bg-blue-50 shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-3 p-6 text-right">
              <Wand2 className="h-6 w-6 text-blue-600" />
              <p className="text-sm text-blue-900">{t(data.aiPredictionKey)}</p>
            </CardContent>
          </Card>

          <Button variant="secondary" className="w-full rounded-xl">
            {t("courses.statistics.chat.openDiscussion")}
          </Button>
        </div>
      </div>
    </div>
  );
}
