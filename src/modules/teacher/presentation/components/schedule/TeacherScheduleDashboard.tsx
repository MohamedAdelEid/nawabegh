"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useTeacherSchedule } from "@/modules/teacher/application/hooks/useTeacherSchedule";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard/DashboardPageHeader";
import { DashboardBadge } from "@/shared/presentation/components/dashboard/DashboardBadge";
import { DashboardSegmentedControl } from "@/shared/presentation/components/dashboard/DashboardSegmentedControl";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

type ViewMode = "weekly" | "monthly";

export function TeacherScheduleDashboard() {
  const t = useTranslations("teacher.dashboard");
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const { data, isLoading, isError } = useTeacherSchedule();

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-[2rem]" />;
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">{t("common.error")}</p>;
  }

  const { featuredSession } = data;
  const progressPercent = Math.round(
    (data.completedSessions / data.plannedSessions) * 100,
  );

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={t("schedule.title")}
        description={t("schedule.description")}
        action={
          <DashboardSegmentedControl<ViewMode>
            options={[
              { id: "weekly", label: t("schedule.viewToggle.weekly") },
              { id: "monthly", label: t("schedule.viewToggle.monthly") },
            ]}
            value={viewMode}
            onChange={setViewMode}
          />
        }
      />

      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <Card className="rounded-[2rem] border-transparent bg-[#2C4260] text-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6 text-right">
              <h2 className="text-lg font-bold">{t("schedule.performance.title")}</h2>
              <p className="text-3xl font-bold">
                {t("schedule.performance.sessions", {
                  completed: data.completedSessions,
                  planned: data.plannedSessions,
                })}
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-[#C9A227]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-sm text-white/80">{t(data.performanceMessageKey)}</p>
              <Button variant="outline" className="w-full rounded-xl border-white/30 bg-transparent text-white">
                {t("schedule.performance.viewReport")}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-right text-lg font-bold text-slate-800">
                {t("schedule.topics.title")}
              </h2>
              {data.topics.map((topic) => (
                <div
                  key={topic.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 p-4 text-right"
                >
                  <DashboardBadge tone="gold">{t(topic.badgeKey)}</DashboardBadge>
                  <p className="font-medium text-slate-800">{t(topic.titleKey)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2 text-right">
                  {featuredSession.status === "live" ? (
                    <DashboardBadge tone="danger" withDot>
                      {t("schedule.featured.liveNow")}
                    </DashboardBadge>
                  ) : null}
                  <h2 className="text-2xl font-bold text-slate-800">
                    {t(featuredSession.titleKey)}
                  </h2>
                  <p className="text-sm text-slate-500">{t(featuredSession.levelKey)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    {
                      label: t("schedule.featured.registered"),
                      value: t("schedule.featured.students", {
                        count: featuredSession.registeredCount,
                      }),
                    },
                    {
                      label: t("schedule.featured.duration"),
                      value: t("schedule.featured.minutes", {
                        count: featuredSession.durationMinutes,
                      }),
                    },
                    {
                      label: t("schedule.featured.resources"),
                      value: t("schedule.featured.files", {
                        count: featuredSession.resourceCount,
                      }),
                    },
                    {
                      label: t("schedule.featured.status"),
                      value: t(featuredSession.statusLabelKey),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-right"
                    >
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  className="rounded-xl bg-[#C9A227] text-[#2C4260]"
                  onClick={() =>
                    router.push(ROUTES.USER.TEACHER.SESSION_DETAILS(featuredSession.id))
                  }
                >
                  {t("schedule.featured.startStream")}
                </Button>
                <Button variant="outline" className="rounded-xl">
                  {t("schedule.featured.edit")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" className="rounded-xl">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="rounded-xl">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
                <h2 className="text-lg font-bold text-slate-800">{t("schedule.calendar.title")}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {data.calendarDays.map((day) => (
                  <div
                    key={day.dateKey}
                    className={`min-h-[120px] rounded-2xl border p-3 text-right ${
                      day.isToday
                        ? "border-[#C9A227] bg-[#F8EFD5]/40"
                        : "border-slate-100 bg-slate-50"
                    }`}
                  >
                    <p className="text-xs text-slate-500">{t(day.dateKey)}</p>
                    <p className="text-lg font-bold text-slate-800">{day.dayNumber}</p>
                    {day.sessions.length === 0 ? (
                      <p className="mt-2 text-xs text-slate-400">{t("schedule.calendar.noSessions")}</p>
                    ) : (
                      <div className="mt-2 space-y-1">
                        {day.sessions.map((session) => (
                          <button
                            key={session.id}
                            type="button"
                            onClick={() =>
                              router.push(ROUTES.USER.TEACHER.SESSION_DETAILS(session.id))
                            }
                            className="block w-full rounded-lg bg-white px-2 py-1 text-left text-xs hover:bg-[#2C4260]/10"
                          >
                            <span className="font-medium text-slate-700">{t(session.titleKey)}</span>
                            <span className="block text-slate-400">{session.timeLabel}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-4">
                <Button variant="ghost" className="text-[#2C4260]" asChild>
                  <Link href={ROUTES.USER.TEACHER.LIVE_SESSIONS}>
                    {t("schedule.sessions.viewLiveSessions")}
                  </Link>
                </Button>
                <h2 className="text-lg font-bold text-slate-800">{t("schedule.sessions.title")}</h2>
              </div>
              {data.sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex cursor-pointer flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4 transition-colors hover:bg-slate-50"
                  onClick={() => router.push(ROUTES.USER.TEACHER.SESSION_DETAILS(session.id))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      router.push(ROUTES.USER.TEACHER.SESSION_DETAILS(session.id));
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t("schedule.sessions.edit")}
                    </Button>
                  </div>
                  <div className="flex flex-1 flex-wrap items-center justify-end gap-4 text-right">
                    <span className="text-sm text-slate-500">{session.timeRangeLabel}</span>
                    <span className="text-sm text-slate-500">
                      {t("schedule.sessions.students", { count: session.studentCount })}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800">{t(session.titleKey)}</p>
                      <p className="text-sm text-slate-500">
                        {t(session.levelKey)} · {t(session.instructorKey)}
                      </p>
                    </div>
                    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-[#2C4260] text-white">
                      <span className="text-[10px] opacity-80">{t(session.dateBadgeKey).split(" ")[0]}</span>
                      <span className="text-lg font-bold">{t(session.dateBadgeKey).split(" ")[1]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
