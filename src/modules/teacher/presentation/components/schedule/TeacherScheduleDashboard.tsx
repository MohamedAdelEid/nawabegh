"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useTeacherSchedule } from "@/modules/teacher/application/hooks/useTeacherSchedule";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard/DashboardPageHeader";
import { DashboardBadge } from "@/shared/presentation/components/dashboard/DashboardBadge";
import { DashboardSegmentedControl } from "@/shared/presentation/components/dashboard/DashboardSegmentedControl";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

type ViewMode = "weekly" | "monthly";

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftAnchorDate(anchorDate: string | undefined, viewMode: ViewMode, direction: -1 | 1): string {
  const base = anchorDate ? new Date(`${anchorDate}T12:00:00`) : new Date();
  if (viewMode === "monthly") {
    base.setMonth(base.getMonth() + direction);
  } else {
    base.setDate(base.getDate() + direction * 7);
  }
  return toDateInputValue(base);
}

export function TeacherScheduleDashboard() {
  const t = useTranslations("teacher.dashboard");
  const formatter = useFormatter();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [anchorDate, setAnchorDate] = useState<string | undefined>(undefined);
  const { data, isPending, isFetching, isError } = useTeacherSchedule({ view: viewMode, anchorDate });

  const calendarTitle = useMemo(() => {
    if (!data?.rangeStart || !data?.rangeEnd) {
      return viewMode === "monthly" ? t("schedule.calendar.titleMonthly") : t("schedule.calendar.title");
    }
    try {
      const start = formatter.dateTime(new Date(`${data.rangeStart}T12:00:00`), {
        month: "short",
        day: "numeric",
      });
      const end = formatter.dateTime(new Date(`${data.rangeEnd}T12:00:00`), {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return t("schedule.calendar.rangeTitle", { start, end });
    } catch {
      return viewMode === "monthly" ? t("schedule.calendar.titleMonthly") : t("schedule.calendar.title");
    }
  }, [data?.rangeEnd, data?.rangeStart, formatter, t, viewMode]);

  const navigateToSession = (sessionId: string) => {
    router.push(ROUTES.USER.TEACHER.SESSION_DETAILS(sessionId));
  };

  if (isPending && !data) {
    return <Skeleton className="h-96 w-full rounded-[2rem]" />;
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">{t("common.error")}</p>;
  }

  const { featuredSession } = data;
  const progressPercent =
    data.plannedSessions > 0
      ? Math.round((data.completedSessions / data.plannedSessions) * 100)
      : Math.round(data.completionPercent);

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
            onChange={(nextView) => {
              setViewMode(nextView);
              setAnchorDate(undefined);
            }}
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
              <p className="text-sm text-white/80">{data.performanceMessage}</p>
              <Button variant="outline" className="w-full rounded-xl border-white/30 bg-transparent text-white" asChild>
                <Link href={`${ROUTES.USER.TEACHER.LIVE_SESSIONS}?tab=analytics`}>
                  {t("schedule.performance.viewReport")}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-right text-lg font-bold text-slate-800">
                {t("schedule.topics.title")}
              </h2>
              {data.topics.length === 0 ? (
                <p className="text-right text-sm text-slate-500">{t("schedule.topics.empty")}</p>
              ) : (
                data.topics.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => {
                      if (topic.liveSessionId) {
                        navigateToSession(topic.liveSessionId);
                      }
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-100 p-4 text-right transition-colors hover:bg-slate-50"
                  >
                    <DashboardBadge tone="gold">{topic.badge}</DashboardBadge>
                    <p className="font-medium text-slate-800">{topic.title}</p>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {featuredSession.id ? (
            <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
              <CardContent className="space-y-6 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2 text-right">
                    {featuredSession.status === "live" ? (
                      <DashboardBadge tone="danger" withDot>
                        {t("schedule.featured.liveNow")}
                      </DashboardBadge>
                    ) : null}
                    <h2 className="text-2xl font-bold text-slate-800">{featuredSession.title}</h2>
                    <p className="text-sm text-slate-500">{featuredSession.level}</p>
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
                        value: featuredSession.statusLabel,
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
                    onClick={() => navigateToSession(featuredSession.id)}
                  >
                    {featuredSession.canStartBroadcast
                      ? t("schedule.featured.startStream")
                      : t("schedule.featured.viewDetails")}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => navigateToSession(featuredSession.id)}
                  >
                    {t("schedule.featured.edit")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">{calendarTitle}</h2>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="rounded-xl"
                    aria-label={t("schedule.calendar.nextPeriod")}
                    onClick={() => setAnchorDate((current) => shiftAnchorDate(current, viewMode, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="rounded-xl"
                    aria-label={t("schedule.calendar.previousPeriod")}
                    onClick={() => setAnchorDate((current) => shiftAnchorDate(current, viewMode, -1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {data.calendarDays.map((day) => (
                  <div
                    key={day.dateUtc}
                    className={`min-h-[120px] rounded-2xl border p-3 text-right ${
                      day.isToday
                        ? "border-[#C9A227] bg-[#F8EFD5]/40"
                        : "border-slate-100 bg-slate-50"
                    }`}
                  >
                    <p className="text-xs text-slate-500">{day.dayLabel}</p>
                    <p className="text-lg font-bold text-slate-800">{day.dayNumber}</p>
                    {day.sessions.length === 0 ? (
                      <p className="mt-2 text-xs text-slate-400">{t("schedule.calendar.noSessions")}</p>
                    ) : (
                      <div className="mt-2 space-y-1">
                        {day.sessions.map((session) => (
                          <button
                            key={session.id}
                            type="button"
                            onClick={() => navigateToSession(session.id)}
                            className="block w-full rounded-lg bg-white px-2 py-1 text-left text-xs hover:bg-[#2C4260]/10"
                          >
                            <span className="font-medium text-slate-700">{session.title}</span>
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
                <h2 className="text-lg font-bold text-slate-800">{t("schedule.sessions.title")}</h2>
                <Button variant="ghost" className="text-[#2C4260]" asChild>
                  <Link href={`${ROUTES.USER.TEACHER.LIVE_SESSIONS}?tab=manage`}>
                    {t("schedule.sessions.viewLiveSessions")}
                  </Link>
                </Button>
              </div>
              {data.sessions.length === 0 ? (
                <p className="text-right text-sm text-slate-500">{t("schedule.sessions.empty")}</p>
              ) : (
                data.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex cursor-pointer flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4 transition-colors hover:bg-slate-50"
                    onClick={() => navigateToSession(session.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        navigateToSession(session.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex flex-1 flex-wrap items-center gap-4 text-right">
                      <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-[#2C4260] text-center text-white">
                        <span className="text-[10px] leading-tight opacity-80">
                          {session.dateBadge.split(" ")[0]}
                        </span>
                        <span className="text-lg font-bold leading-none">
                          {session.dateBadge.split(" ").slice(1).join(" ")}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{session.title}</p>
                        <p className="text-sm text-slate-500">
                          {session.level} · {session.instructor}
                        </p>
                      </div>
                      <span className="text-sm text-slate-500">{session.timeRangeLabel}</span>
                      <span className="text-sm text-slate-500">
                        {t("schedule.sessions.students", { count: session.studentCount })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* <Button size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button> */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToSession(session.id);
                        }}
                      >
                        {t("schedule.sessions.edit")}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {isFetching && !isPending ? (
        <p className="text-xs text-slate-400">{t("common.loading")}</p>
      ) : null}
    </div>
  );
}
