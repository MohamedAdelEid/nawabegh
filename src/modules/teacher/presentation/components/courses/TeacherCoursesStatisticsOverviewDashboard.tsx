"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  Bell,
  Download,
  SlidersHorizontal,
  TrendingDown,
  UserX,
  Users,
} from "lucide-react";
import { useTeacherCoursesStatisticsOverview } from "@/modules/teacher/application/hooks/useTeacherCoursesStatisticsOverview";
import { TeacherWeeklyInteractionBarChart } from "@/modules/teacher/presentation/components/charts/TeacherWeeklyInteractionBarChart";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { DashboardBadge } from "@/shared/presentation/components/dashboard/DashboardBadge";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard/DashboardPageHeader";
import { DashboardStatCard } from "@/shared/presentation/components/dashboard/DashboardStatCard";
import {
  DashboardFilterSelect,
  DashboardSegmentedControl,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { cn } from "@/shared/application/lib/cn";

const statIcons = {
  totalStudents: Users,
  avgAchievement: Users,
  attendanceRate: Users,
  testAverage: Users,
  strugglingStudents: UserX,
  activeStudents: Users,
} as const;

const alertIcons = {
  danger: UserX,
  warning: AlertTriangle,
  neutral: TrendingDown,
} as const;

const achievementColors = {
  primary: "bg-[#2C4260]",
  warning: "bg-[#C9A227]",
  success: "bg-emerald-500",
} as const;

export function TeacherCoursesStatisticsOverviewDashboard() {
  const t = useTranslations("teacher.dashboard");
  const { data, isLoading, isError } = useTeacherCoursesStatisticsOverview();
  const [timeframe, setTimeframe] = useState("7d");

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-[2rem]" />;
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">{t("common.error")}</p>;
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={t("coursesStatisticsOverview.title")}
        description={t("coursesStatisticsOverview.description")}
        action={
          <div className="flex flex-wrap gap-3">
            <Button className="rounded-xl bg-[#2C4260]">
              <Download className="ml-2 h-4 w-4" />
              {t("coursesStatisticsOverview.actions.exportReport")}
            </Button>
            <Button variant="outline" className="rounded-xl">
              <Bell className="ml-2 h-4 w-4" />
              {t("coursesStatisticsOverview.actions.sendAlert")}
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <DashboardSegmentedControl
          value={timeframe}
          onChange={setTimeframe}
          options={[
            { id: "7d", label: t("coursesStatisticsOverview.filters.days7") },
            { id: "30d", label: t("coursesStatisticsOverview.filters.days30") },
            { id: "custom", label: t("coursesStatisticsOverview.filters.custom") },
          ]}
        />
        <div className="flex flex-wrap items-end gap-3">
          <DashboardFilterSelect
            value="all"
            label={t("coursesStatisticsOverview.filters.allCourses")}
            onChange={() => undefined}
            options={[{ id: "all", label: t("coursesStatisticsOverview.filters.allCourses") }]}
          />
          <DashboardFilterSelect
            value="all"
            label={t("coursesStatisticsOverview.filters.allClasses")}
            onChange={() => undefined}
            options={[{ id: "all", label: t("coursesStatisticsOverview.filters.allClasses") }]}
          />
          <Button variant="outline" className="rounded-xl">
            <SlidersHorizontal className="ml-2 h-4 w-4" />
            {t("coursesStatisticsOverview.filters.advanced")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {data.stats.map((stat) => {
          const Icon = statIcons[stat.id as keyof typeof statIcons] ?? Users;
          return (
            <DashboardStatCard
              key={stat.id}
              label={t(stat.labelKey)}
              value={stat.value}
              indicator={stat.trend}
              indicatorClassName={
                stat.trendDirection === "down"
                  ? "text-red-500"
                  : stat.trendDirection === "up"
                    ? "text-emerald-600"
                    : stat.id === "strugglingStudents"
                      ? "text-red-500"
                      : "text-emerald-600"
              }
              icon={Icon}
              iconTone={stat.id === "strugglingStudents" ? "danger" : "primary"}
            />
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <DashboardBadge tone="danger">
                {t("coursesStatisticsOverview.alerts.badge", { count: data.alerts.length })}
              </DashboardBadge>
              <h2 className="font-bold text-slate-800">
                {t("coursesStatisticsOverview.alerts.title")}
              </h2>
            </div>
            <div className="space-y-3">
              {data.alerts.map((alert) => {
                const Icon = alertIcons[alert.tone];
                const toneClass =
                  alert.tone === "danger"
                    ? "border-red-100 bg-red-50"
                    : alert.tone === "warning"
                      ? "border-amber-100 bg-amber-50"
                      : "border-slate-100 bg-slate-50";
                return (
                  <div
                    key={alert.id}
                    className={cn("flex items-start gap-3 rounded-2xl border p-4 text-right", toneClass)}
                  >
                    <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">{t(alert.titleKey)}</p>
                      <p className="text-sm text-slate-500">{t(alert.descriptionKey)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <TeacherWeeklyInteractionBarChart
          title={t("coursesStatisticsOverview.activityChart.title")}
          legendLabel={t("coursesStatisticsOverview.activityChart.current")}
          rows={data.weeklyActivity.map((row) => ({
            ...row,
            dayLabel: t(row.dayKey),
          }))}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="link" asChild className="h-auto p-0">
            <Link href={ROUTES.USER.TEACHER.COURSES.LIST}>
              {t("coursesStatisticsOverview.coursePerformance.viewAll")}
            </Link>
          </Button>
          <h2 className="text-xl font-bold text-slate-800">
            {t("coursesStatisticsOverview.coursePerformance.title")}
          </h2>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {data.coursePerformance.map((course) => (
            <Card
              key={course.id}
              className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]"
            >
              <CardContent className="space-y-5 p-6 text-right">
                <div className="flex items-start justify-between gap-3">
                  <DashboardBadge tone={course.statusTone}>{t(course.statusKey)}</DashboardBadge>
                  <div>
                    <p className="font-bold text-slate-800">{t(course.titleKey)}</p>
                    <p className="text-sm text-slate-500">
                      {t("coursesStatisticsOverview.coursePerformance.students", {
                        count: course.studentCount,
                      })}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{course.achievementPercent}%</span>
                    <span className="text-slate-500">
                      {t("coursesStatisticsOverview.coursePerformance.achievement")}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        achievementColors[course.achievementTone],
                      )}
                      style={{ width: `${course.achievementPercent}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      label: t("coursesStatisticsOverview.coursePerformance.interaction"),
                      value: `${course.interactionPercent}%`,
                    },
                    {
                      label: t("coursesStatisticsOverview.coursePerformance.attendance"),
                      value: `${course.attendancePercent}%`,
                    },
                    {
                      label: t("coursesStatisticsOverview.coursePerformance.struggling"),
                      value: String(course.strugglingCount),
                    },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-slate-50 p-3 text-center">
                      <p className="text-lg font-bold text-slate-800">{item.value}</p>
                      <p className="text-[11px] text-slate-500">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
