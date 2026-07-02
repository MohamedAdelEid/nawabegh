"use client";

import Link from "next/link";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Lock,
  MessageCircle,
  PlayCircle,
  Trophy,
  Video,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTeacherCourseSubscriberProfile } from "@/modules/teacher/application/hooks/useTeacherCourseSubscriberProfile";
import {
  formatEnrolledDate,
  formatJoinedMonth,
  formatSubscriberPercent,
  formatSubscriberRelativeTime,
  progressBarTone,
} from "@/modules/teacher/domain/utils/courseSubscribersDisplay";
import { TeacherSubscriberWeeklyActivityChart } from "@/modules/teacher/presentation/components/courses/subscribers/charts/TeacherSubscriberWeeklyActivityChart";
import { TeacherCourseSubscriberProfileSkeleton } from "@/modules/teacher/presentation/components/courses/subscribers/TeacherCourseSubscriberProfileSkeleton";
import { formatNumber } from "@/shared/application/lib/format";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";
import {
  DashboardBadge,
  DashboardPageHeader,
  DashboardStatCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";

function ProgressRing({ percent, label }: { percent: number; label: string }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative flex h-36 w-36 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(#2C4260 ${clamped * 3.6}deg, #E2E8F0 0deg)`,
        }}
      >
        <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white text-center">
          <p className="text-3xl font-bold text-[#2C4260]">{clamped}%</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

export function TeacherCourseSubscriberProfileDashboard({
  courseId,
  studentUserId,
}: {
  courseId: string;
  studentUserId: string;
}) {
  const t = useTranslations("teacher.dashboard");
  const locale = useLocale();
  const { data, isLoading, isError } = useTeacherCourseSubscriberProfile(courseId, studentUserId);

  if (isLoading) {
    return <TeacherCourseSubscriberProfileSkeleton />;
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">{t("common.error")}</p>;
  }

  const { identity, courseKpis, interaction, learningPaths, quizResults, recentActivity, weeklyActivity } =
    data;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={identity.fullName}
        description={data.courseTitle}
        breadcrumbs={[
          { label: t("sidebar.nav.home"), href: ROUTES.USER.TEACHER.HOME },
          { label: t("sidebar.nav.courses"), href: ROUTES.USER.TEACHER.COURSES.LIST },
          {
            label: t("courses.subscribers.breadcrumb"),
            href: ROUTES.USER.TEACHER.COURSES.SUBSCRIBERS(courseId),
          },
          { label: identity.fullName },
        ]}
        action={
          <Button variant="outline" className="rounded-xl" asChild>
            <Link href={ROUTES.USER.TEACHER.COURSES.SUBSCRIBERS(courseId)}>
              {t("courses.subscribers.profile.backToList")}
            </Link>
          </Button>
        }
      />

      <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative">
              <UserAvatarImageOrInitials
                trackKey={identity.userId}
                name={identity.fullName}
                imageUrl={identity.profileImageUrl}
                size="xxxl"
                shape="square"
                circleClassName="bg-[#DCE6F5] text-[#2C4260]"
              />
              <DashboardBadge
                tone={identity.isActive ? "success" : "neutral"}
                withDot
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
              >
                {identity.isActive
                  ? t("courses.subscribers.profile.online")
                  : t("courses.subscribers.profile.offline")}
              </DashboardBadge>
            </div>
            <div className="space-y-2 text-right">
              <h1 className="text-2xl font-bold text-slate-800">{identity.fullName}</h1>
              <p className="text-sm text-slate-500">{identity.schoolName}</p>
              <div className="flex flex-wrap justify-end gap-2">
                <DashboardBadge tone="neutral">
                  {t("courses.subscribers.profile.joined", {
                    date: formatJoinedMonth(identity.enrolledAt, locale),
                  })}
                </DashboardBadge>
                {identity.gradeName ? (
                  <DashboardBadge tone="neutral">{identity.gradeName}</DashboardBadge>
                ) : null}
                {identity.countryName ? (
                  <DashboardBadge tone="neutral">{identity.countryName}</DashboardBadge>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        <DashboardStatCard
          label={t("courses.subscribers.profile.kpis.points")}
          value={formatNumber(courseKpis.coursePointsEarned, locale)}
          icon={Trophy}
          iconTone="warning"
        />
        <DashboardStatCard
          label={t("courses.subscribers.profile.kpis.progress")}
          value={formatSubscriberPercent(courseKpis.progressPercent, locale)}
          icon={BookOpen}
          iconTone="primary"
        />
        <DashboardStatCard
          label={t("courses.subscribers.profile.kpis.stations")}
          value={t("courses.subscribers.profile.kpis.stationsValue", {
            completed: courseKpis.completedStationsCount,
            total: courseKpis.totalStationsCount,
          })}
          icon={CheckCircle2}
          iconTone="success"
        />
        <DashboardStatCard
          label={t("courses.subscribers.profile.kpis.averageScore")}
          value={formatSubscriberPercent(courseKpis.averageScorePercent, locale)}
          icon={Award}
          iconTone="success"
        />
        <DashboardStatCard
          label={t("courses.subscribers.profile.kpis.quizzes")}
          value={formatNumber(courseKpis.quizAttemptsCount, locale)}
          icon={BookOpen}
          iconTone="primary"
        />
        <DashboardStatCard
          label={t("courses.subscribers.profile.kpis.attendance")}
          value={formatSubscriberPercent(courseKpis.attendancePercent, locale)}
          icon={Video}
          iconTone="info"
        />
        <DashboardStatCard
          label={t("courses.subscribers.profile.kpis.rank")}
          value={formatNumber(courseKpis.courseRank, locale)}
          icon={Trophy}
          iconTone="warning"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <TeacherSubscriberWeeklyActivityChart
            title={t("courses.subscribers.profile.weeklyActivity")}
            activityLabel={t("courses.subscribers.profile.activityCount")}
            rows={weeklyActivity}
          />

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-right text-xl font-bold text-slate-800">
                {t("courses.subscribers.profile.quizResults")}
              </h2>
              {quizResults.length === 0 ? (
                <p className="text-center text-sm text-slate-500">
                  {t("courses.subscribers.profile.quizResultsEmpty")}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[32rem] text-right text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500">
                        <th className="px-3 py-2 font-medium">{t("courses.subscribers.profile.quizTitle")}</th>
                        <th className="px-3 py-2 font-medium">{t("courses.subscribers.profile.quizScore")}</th>
                        <th className="px-3 py-2 font-medium">{t("courses.subscribers.profile.quizDate")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizResults.map((quiz) => (
                        <tr key={quiz.quizId} className="border-b border-slate-50">
                          <td className="px-3 py-3 font-medium text-slate-800">{quiz.title}</td>
                          <td className="px-3 py-3">
                            <DashboardBadge tone={quiz.passed ? "success" : "warning"}>
                              {formatSubscriberPercent(quiz.scorePercent, locale)}
                            </DashboardBadge>
                          </td>
                          <td className="px-3 py-3 text-slate-600">
                            {formatEnrolledDate(quiz.submittedAt, locale)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-right text-xl font-bold text-slate-800">
                {t("courses.subscribers.profile.interaction")}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    label: t("courses.subscribers.profile.interactionMessages"),
                    value: interaction.chatMessagesSent,
                    icon: MessageCircle,
                  },
                  {
                    label: t("courses.subscribers.profile.interactionStations"),
                    value: interaction.stationsCompleted,
                    icon: CheckCircle2,
                  },
                  {
                    label: t("courses.subscribers.profile.interactionQuizzes"),
                    value: interaction.quizzesSubmitted,
                    icon: BookOpen,
                  },
                  {
                    label: t("courses.subscribers.profile.interactionLive"),
                    value: interaction.liveSessionsAttended,
                    icon: Video,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex items-center gap-2 text-slate-600">
                      <item.icon className="h-5 w-5 text-[#2C4260]" aria-hidden />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">
                      {formatNumber(item.value, locale)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-right text-xl font-bold text-slate-800">
                {t("courses.subscribers.profile.recentActivity")}
              </h2>
              {recentActivity.length === 0 ? (
                <p className="text-center text-sm text-slate-500">
                  {t("courses.subscribers.profile.recentActivityEmpty")}
                </p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={`${activity.occurredAtUtc}-${index}`}
                      className="flex items-start justify-between gap-4 border-b border-slate-50 pb-4 last:border-0 last:pb-0"
                    >
                      <p className="whitespace-nowrap text-xs text-slate-400">
                        {formatSubscriberRelativeTime(activity.occurredAtUtc, locale)}
                      </p>
                      <div className="space-y-1 text-right">
                        <p className="font-medium text-slate-800">{activity.title}</p>
                        <p className="text-xs text-slate-500">
                          {activity.activityTypeLabelAr || activity.activityType}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6 text-center">
              <h2 className="text-right text-lg font-bold text-slate-800">
                {t("courses.subscribers.profile.overallProgress")}
              </h2>
              <ProgressRing
                percent={courseKpis.progressPercent}
                label={t("courses.subscribers.profile.progressLevel")}
              />
              {courseKpis.certificateEarned ? (
                <DashboardBadge tone="success">{t("courses.subscribers.profile.certificateEarned")}</DashboardBadge>
              ) : null}
              <p className="text-sm text-slate-500">
                {t("courses.subscribers.profile.lastActivity")}:{" "}
                {formatSubscriberRelativeTime(courseKpis.lastActivityAt, locale)}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-right text-lg font-bold text-slate-800">
                {t("courses.subscribers.profile.learningPaths")}
              </h2>
              {learningPaths.length === 0 ? (
                <p className="text-center text-sm text-slate-500">
                  {t("courses.subscribers.profile.learningPathsEmpty")}
                </p>
              ) : (
                <div className="space-y-4">
                  {learningPaths.map((path) => {
                    const isComplete = path.progressPercent >= 100;
                    const isLocked = path.progressPercent === 0 && path.completedStations === 0;
                    return (
                      <div key={path.learningPathId} className="flex items-start justify-between gap-3">
                        <div className="shrink-0 pt-1">
                          {isComplete ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden />
                          ) : isLocked ? (
                            <Lock className="h-5 w-5 text-slate-400" aria-hidden />
                          ) : (
                            <PlayCircle className="h-5 w-5 text-[#C9A227]" aria-hidden />
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-2 text-right">
                          <p className="font-medium text-slate-800">{path.title}</p>
                          {!isComplete && !isLocked ? (
                            <div className="space-y-1">
                              <p className="text-xs text-slate-500">
                                {formatSubscriberPercent(path.progressPercent, locale)}
                              </p>
                              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    progressBarTone(path.progressPercent),
                                  )}
                                  style={{ width: `${path.progressPercent}%` }}
                                />
                              </div>
                            </div>
                          ) : null}
                          {isComplete ? (
                            <p className="text-xs text-emerald-600">
                              {t("courses.subscribers.profile.pathCompleted")}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
