"use client";

import {
  Clock,
  Download,
  Eye,
  Lightbulb,
  Plus,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useTeacherLiveAnalytics } from "@/modules/teacher/application/hooks/useTeacherLiveAnalytics";
import { TeacherAttendanceBarChart } from "@/modules/teacher/presentation/components/charts/TeacherAttendanceBarChart";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard/DashboardPageHeader";
import { DashboardStatCard } from "@/shared/presentation/components/dashboard/DashboardStatCard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

const statIcons = {
  totalAttendance: Users,
  avgWatchTime: Clock,
  peakViews: Eye,
  interactionRate: Zap,
} as const;

const metricColors = {
  success: "bg-emerald-500",
  warning: "bg-[#C9A227]",
  primary: "bg-[#2C4260]",
} as const;

export function TeacherLiveAnalyticsDashboard() {
  const t = useTranslations("teacher.dashboard");
  const { data, isLoading, isError } = useTeacherLiveAnalytics();

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-[2rem]" />;
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">{t("common.error")}</p>;
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={t("liveAnalytics.title")}
        description={t("liveAnalytics.description")}
        action={
          <div className="flex flex-wrap gap-3">
            <Button className="rounded-xl bg-[#2C4260]">
              <Plus className="ml-2 h-4 w-4" />
              {t("liveAnalytics.actions.startSession")}
            </Button>
            <Button variant="outline" className="rounded-xl">
              <Download className="ml-2 h-4 w-4" />
              {t("liveAnalytics.actions.exportReport")}
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat) => {
          const Icon = statIcons[stat.id as keyof typeof statIcons] ?? Users;
          const value =
            stat.id === "avgWatchTime"
              ? `${stat.value} ${t("liveAnalytics.stats.minutesSuffix")}`
              : stat.value;
          return (
            <DashboardStatCard
              key={stat.id}
              label={t(stat.labelKey)}
              value={value}
              indicator={stat.trend}
              indicatorClassName={
                stat.trendDirection === "up"
                  ? "text-emerald-600"
                  : stat.trendDirection === "down"
                    ? "text-red-500"
                    : undefined
              }
              icon={Icon}
            />
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-right text-lg font-bold text-slate-800">
                {t("liveAnalytics.upcoming.title")}
              </h2>
              {data.upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-2xl border border-slate-100 p-4 text-right"
                >
                  <p className="font-semibold text-slate-800">{t(session.titleKey)}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {t(session.dateLabelKey)} · {session.timeLabel}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {t("liveAnalytics.upcoming.students", { count: session.studentCount })}
                  </p>
                </div>
              ))}
              <Button className="w-full rounded-xl bg-[#C9A227] text-[#2C4260]" asChild>
                <Link href={ROUTES.USER.TEACHER.SCHEDULE}>
                  {t("liveAnalytics.upcoming.manageSchedule")}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-right text-lg font-bold text-slate-800">
                {t("liveAnalytics.metrics.title")}
              </h2>
              {data.instructorMetrics.map((metric) => (
                <div key={metric.id} className="space-y-2 text-right">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">{metric.percent}%</span>
                    <span className="text-slate-500">{t(metric.labelKey)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${metricColors[metric.tone]}`}
                      style={{ width: `${metric.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-amber-100 bg-amber-50 shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-3 p-6 text-right">
              <div className="flex items-center justify-end gap-2">
                <h3 className="font-bold text-slate-800">{t("liveAnalytics.tip.title")}</h3>
                <Lightbulb className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-sm text-slate-600">{t(data.tipKey)}</p>
              <Button variant="link" className="h-auto p-0 text-[#2C4260]">
                {t("liveAnalytics.tip.readMore")} →
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <TeacherAttendanceBarChart
            title={t("liveAnalytics.chart.title")}
            subtitle={t("liveAnalytics.chart.subtitle")}
            rows={data.attendanceChart.map((row) => ({
              ...row,
              dayKey: t(row.dayKey),
            }))}
            weeklyLabel={t("liveAnalytics.chart.weekly")}
            monthlyLabel={t("liveAnalytics.chart.monthly")}
          />

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-col gap-3 text-right sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {t("liveAnalytics.absent.title")}
                  </h2>
                  <p className="text-sm text-slate-500">{t(data.absentSessionTitleKey)}</p>
                  <p className="text-xs text-slate-400">{t(data.absentSessionTimeKey)}</p>
                </div>
                <Button variant="outline" className="rounded-xl border-[#2C4260] text-[#2C4260]">
                  {t("liveAnalytics.absent.alertAll")}
                </Button>
              </div>
              {data.absentStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4"
                >
                  <Button size="sm" variant="outline" className="rounded-xl">
                    {t("liveAnalytics.absent.sendReminder")}
                  </Button>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <p className="font-semibold text-slate-800">{t(student.nameKey)}</p>
                      <p className="text-xs text-slate-500">{t(student.lastSeenKey)}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2C4260] text-xs font-bold text-white">
                      {student.avatarInitials}
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="link" className="w-full text-[#2C4260]">
                {t("liveAnalytics.absent.viewAll", { count: data.totalAbsentCount })}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
