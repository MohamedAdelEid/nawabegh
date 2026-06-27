"use client";

import { BookOpen, Headphones, Users, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useTeacherDashboard } from "@/modules/teacher/application/hooks/useTeacherDashboard";
import { TeacherLevelCard } from "@/modules/teacher/presentation/components/dashboard/TeacherLevelCard";
import { TeacherPerformanceLineChart } from "@/modules/teacher/presentation/components/charts/TeacherPerformanceLineChart";
import { DashboardStatCard } from "@/shared/presentation/components/dashboard/DashboardStatCard";
import { DashboardBadge } from "@/shared/presentation/components/dashboard/DashboardBadge";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { TeacherHomeDashboardSkeleton } from "@/modules/teacher/presentation/components/dashboard/TeacherHomeDashboardSkeleton";

const statIcons = {
  todaySessions: Video,
  totalStudents: Users,
  activeCourses: BookOpen,
} as const;

export function TeacherHomeDashboard() {
  const t = useTranslations("teacher.dashboard");
  const { data, isLoading, isError } = useTeacherDashboard();

  if (isLoading) {
    return <TeacherHomeDashboardSkeleton label={t("common.loading")} />;
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">{t("common.error")}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        <TeacherLevelCard
          level={data.level}
          title={t("home.level.title", { level: data.level.level })}
          qualityLabel={t(data.level.qualityLabelKey)}
          xpLabel={t("home.level.xp", {
            current: data.level.currentXp,
            max: data.level.maxXp,
          })}
        />
        {data.stats.map((stat) => {
          const Icon = statIcons[stat.id as keyof typeof statIcons] ?? Video;
          return (
            <DashboardStatCard
              key={stat.id}
              label={t(stat.labelKey)}
              value={stat.value}
              indicator={stat.trend}
              indicatorClassName={
                stat.trendDirection === "up"
                  ? "text-emerald-600"
                  : stat.trendDirection === "down"
                    ? "text-red-500"
                    : undefined
              }
              icon={Icon}
              iconTone={stat.id === "todaySessions" ? "danger" : "success"}
            />
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <TeacherPerformanceLineChart
            title={t("home.chart.title")}
            subtitle={t("home.chart.subtitle")}
            currentWeekRows={data.performanceChart.currentWeek}
            previousWeekRows={data.performanceChart.previousWeek}
            currentWeekLabel={t("home.chart.currentWeek")}
            previousWeekLabel={t("home.chart.previousWeek")}
            interactionRateLabel={t("home.chart.interactionRate")}
            referenceAverageLabel={t("home.chart.referenceAverage")}
          />

          <Card className="border-none bg-transparent shadow-none">
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-slate-800 border-r-6 border-r-[#C7AF6D] pr-4">{t("home.courses.title")}</h2>
                <Button variant="ghost" className="text-[#2C4260]" asChild>
                  <Link href={ROUTES.USER.TEACHER.COURSES.LIST}>
                    {t("home.courses.viewAll")}
                  </Link>
                </Button>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {data.courses.length === 0 ? (
                  <p className="col-span-full text-sm text-slate-500">{t("home.courses.empty")}</p>
                ) : (
                  data.courses.map((course) => (
                  <div
                    key={course.id}
                    className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-[var(--dashboard-shadow-soft)]"
                  >
                    <div
                      className="h-28 bg-gradient-to-br from-[#2C4260] to-[#4A6280] bg-cover bg-center"
                      style={
                        course.imageUrl
                          ? { backgroundImage: `url(${course.imageUrl})` }
                          : undefined
                      }
                    />
                    <div className="space-y-4 p-4 text-right">
                      <h3 className="font-bold text-slate-800">{course.title}</h3>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>{t("home.courses.weeks", { count: course.durationWeeks })}</span>
                        <span>{t("home.courses.students", { count: course.studentCount })}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-[#2C4260]"
                            style={{ width: `${course.progressPercent}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500">{course.progressPercent}%</p>
                      </div>
                      <Button className="w-full rounded-xl bg-[#2C4260] hover:bg-[#2C4260]/90 hover:shadow-none" asChild>
                        <Link href={ROUTES.USER.TEACHER.COURSES.DETAILS(course.id)}>
                          {t("home.courses.enterTrack")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-right text-lg font-bold text-slate-800">
                {t("home.liveClasses.title")}
              </h2>
              {data.liveClasses.length === 0 ? (
                <p className="text-sm text-slate-500">{t("home.liveClasses.empty")}</p>
              ) : (
                data.liveClasses.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-100 p-4 text-right"
                >
                  <p className="font-semibold text-slate-800">{item.title}</p>
                  {item.courseTitle ? (
                    <p className="mt-0.5 text-xs text-slate-400">{item.courseTitle}</p>
                  ) : null}
                  <p className="mt-1 text-sm text-slate-500">{item.timeLabel}</p>
                  {item.status === "active" ? (
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <DashboardBadge tone="danger" withDot>
                        {t("home.liveClasses.activeNow")}
                      </DashboardBadge>
                      <Button size="sm" className="rounded-xl bg-[#2C4260]" asChild>
                        <Link href={ROUTES.USER.TEACHER.SESSION_DETAILS(item.id)}>
                          {t("home.liveClasses.enter")}
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="mt-3 w-full rounded-xl">
                      {t("home.liveClasses.remindMe")}
                    </Button>
                  )}
                </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-right text-lg font-bold text-slate-800">
                {t("home.alerts.title")}
              </h2>
              {data.alerts.length === 0 ? (
                <p className="text-sm text-slate-500">{t("home.alerts.empty")}</p>
              ) : (
                data.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-2xl border p-4 text-right ${
                    alert.tone === "danger"
                      ? "border-red-100 bg-red-50"
                      : "border-amber-100 bg-amber-50"
                  }`}
                >
                  <p className="font-semibold text-slate-800">{alert.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{alert.description}</p>
                </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-transparent bg-[#2C4260] text-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6 text-right">
              <div className="flex items-center justify-between">
                <Headphones className="h-8 w-8 text-[#C9A227]" />
                <div>
                  <h3 className="font-bold">{t("home.support.title")}</h3>
                  <p className="mt-1 text-sm text-white/70">{t("home.support.description")}</p>
                </div>
              </div>
              <Button className="w-full rounded-xl bg-[#C9A227] text-[#2C4260] hover:bg-[#C9A227]/90">
                {t("home.support.cta")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
