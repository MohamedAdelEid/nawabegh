"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  Download,
  Eye,
  Lightbulb,
  List,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTeacherLiveAnalytics } from "@/modules/teacher/application/hooks/useTeacherLiveAnalytics";
import { TeacherAttendanceBarChart } from "@/modules/teacher/presentation/components/charts/TeacherAttendanceBarChart";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard/DashboardPageHeader";
import { DashboardStatCard } from "@/shared/presentation/components/dashboard/DashboardStatCard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Input } from "@/shared/presentation/components/ui/input";
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

const SEARCH_DEBOUNCE_MS = 350;

type TeacherLiveAnalyticsDashboardProps = {
  embedded?: boolean;
  onManageSessions?: () => void;
};

export function TeacherLiveAnalyticsDashboard({
  embedded = false,
  onManageSessions,
}: TeacherLiveAnalyticsDashboardProps) {
  const t = useTranslations("teacher.dashboard");
  const router = useRouter();
  const [chartPeriod, setChartPeriod] = useState<"weekly" | "monthly">("weekly");
  const [absentKeyword, setAbsentKeyword] = useState("");
  const [debouncedAbsentKeyword, setDebouncedAbsentKeyword] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedAbsentKeyword(absentKeyword.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [absentKeyword]);

  const { data, isPending, isFetching, isError } = useTeacherLiveAnalytics({
    chartPeriod,
    absentKeyword: debouncedAbsentKeyword,
    absentPage: 1,
    absentPageSize: 5,
  });

  const manageSessionsAction = useMemo(() => {
    if (onManageSessions) {
      return (
        <Button className="rounded-xl bg-[#2C4260] hover:bg-[#2C4260]/90" onClick={onManageSessions}>
          <List className="ml-2 h-4 w-4" />
          {t("liveAnalytics.actions.manageSessions")}
        </Button>
      );
    }
    return (
      <Button className="rounded-xl bg-[#2C4260] hover:bg-[#2C4260]/90" asChild>
        <Link href={`${ROUTES.USER.TEACHER.LIVE_SESSIONS}?tab=manage`}>
          <List className="ml-2 h-4 w-4" />
          {t("liveAnalytics.actions.manageSessions")}
        </Link>
      </Button>
    );
  }, [onManageSessions, t]);

  if (isPending && !data) {
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
            {manageSessionsAction}
            
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">

      <div className="space-y-6">
          <TeacherAttendanceBarChart
            title={t("liveAnalytics.chart.title")}
            subtitle={t("liveAnalytics.chart.subtitle")}
            rows={data.attendanceChart}
            weeklyLabel={t("liveAnalytics.chart.weekly")}
            monthlyLabel={t("liveAnalytics.chart.monthly")}
            period={chartPeriod}
            onPeriodChange={setChartPeriod}
            isLoading={isFetching && !isPending}
          />

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-col gap-3 text-right sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {t("liveAnalytics.absent.title")}
                  </h2>
                  {data.absentSessionTitle ? (
                    <p className="text-sm text-slate-500">{data.absentSessionTitle}</p>
                  ) : null}
                  {data.absentSessionTime ? (
                    <p className="text-xs text-slate-400">{data.absentSessionTime}</p>
                  ) : null}
                </div>
                <Button variant="outline" className="border-none border-b border-[#2C4260] text-[#2C4260]">
                  {t("liveAnalytics.absent.alertAll")}
                </Button>
              </div>

              <Input
                placeholder={t("liveAnalytics.absent.search")}
                className="rounded-xl text-right"
                value={absentKeyword}
                onChange={(event) => setAbsentKeyword(event.target.value)}
              />

              {data.absentStudents.length === 0 ? (
                <p className="text-right text-sm text-slate-500">{t("liveAnalytics.absent.empty")}</p>
              ) : (
                data.absentStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4"
                  >
                    <div className="flex items-center gap-3 text-right">
                      {student.profileImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={student.profileImageUrl}
                          alt={student.fullName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2C4260] text-xs font-bold text-white">
                          {student.avatarInitials}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-800">{student.fullName}</p>
                        <p className="text-xs text-slate-500">{student.lastSeenLabel}</p>
                        {student.sessionTitle ? (
                          <p className="text-xs text-slate-400">{student.sessionTitle}</p>
                        ) : null}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-xl">
                      {t("liveAnalytics.absent.sendReminder")}
                    </Button>
                  </div>
                ))
              )}
              {data.totalAbsentCount > data.absentStudents.length ? (
                <Button variant="link" className="w-full text-[#2C4260]" asChild>
                  <Link href={ROUTES.USER.TEACHER.LIVE_SESSIONS_ABSENT_STUDENTS}>
                    {t("liveAnalytics.absent.viewAll", { count: data.totalAbsentCount })}
                  </Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-right text-lg font-bold text-slate-800">
                {t("liveAnalytics.upcoming.title")}
              </h2>
              {data.upcomingSessions.length === 0 ? (
                <p className="text-right text-sm text-slate-500">
                  {t("liveAnalytics.upcoming.empty")}
                </p>
              ) : (
                data.upcomingSessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => router.push(ROUTES.USER.TEACHER.SESSION_DETAILS(session.id))}
                    className="w-full rounded-2xl border border-slate-100 p-4 text-right transition-colors hover:border-[#2C4260]/20 hover:bg-slate-50"
                  >
                    <p className="font-semibold text-slate-800">{session.title}</p>
                    {session.courseTitle ? (
                      <p className="mt-1 text-xs text-slate-400">{session.courseTitle}</p>
                    ) : null}
                    <p className="mt-1 text-sm text-slate-500">
                      {session.dateLabel} · {session.timeLabel}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {t("liveAnalytics.upcoming.students", { count: session.studentCount })}
                    </p>
                  </button>
                ))
              )}
              <Button className="w-full rounded-xl bg-[#C9A227] text-[#2C4260] hover:bg-[#C9A227]/90" asChild>
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
                    <span className="font-semibold text-slate-700">
                      {metric.value ?? `${metric.percent}%`}
                    </span>
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
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
