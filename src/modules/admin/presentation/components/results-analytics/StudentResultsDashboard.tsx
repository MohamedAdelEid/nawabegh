"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CreditCard,
  MessageSquare,
  Pencil,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useStudentResultsDashboard } from "@/modules/admin/application/hooks/useStudentResultsDashboard";
import {
  formatPercent,
  formatRelativeTime,
  resultStatusTone,
} from "@/modules/admin/domain/utils/resultsAnalyticsDisplay";
import { AcademicProgressBarChart } from "@/modules/admin/presentation/components/results-analytics/charts/AcademicProgressBarChart";
import {
  DisabledFeatureButton,
  ResultsAnalyticsAnimatedSection,
  StudentResultsCertificatesTab,
  StudentResultsDashboardSkeleton,
  StudentResultsExamsTab,
} from "@/modules/admin/presentation/components/results-analytics";
import { notify } from "@/shared/application/lib/toast";
import {
  DashboardBadge,
  DashboardPageHeader,
  DashboardSegmentedControl,
  DashboardStatCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export type StudentResultsDashboardProps = {
  studentId: string;
};

type TabId = "exams" | "certificates";

export function StudentResultsDashboard({ studentId }: StudentResultsDashboardProps) {
  const t = useTranslations("admin.dashboard.resultsAnalytics");
  const locale = useLocale();
  const router = useRouter();
  const { dashboard, isLoading, errorMessage, period, setPeriod } =
    useStudentResultsDashboard(studentId);
  const [activeTab, setActiveTab] = useState<TabId>("exams");

  useEffect(() => {
    if (errorMessage) notify.error(errorMessage);
  }, [errorMessage]);

  const periodOptions = useMemo(
    () => [
      { id: "30", label: t("student.charts.period30") },
      { id: "60", label: t("student.charts.period60") },
      { id: "90", label: t("student.charts.period90") },
    ],
    [t],
  );

  if (isLoading && !dashboard) {
    return <StudentResultsDashboardSkeleton />;
  }

  if (!dashboard) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500 shadow-[var(--dashboard-shadow-soft)]">
        {t("student.loadError")}
      </div>
    );
  }

  const { profile, inactivityAlert, kpis, weeklyProgress, parent, subscription, recentAssessments } =
    dashboard;

  return (
    <div className="space-y-8">
      {inactivityAlert.showAlert && inactivityAlert.message ? (
        <ResultsAnalyticsAnimatedSection>
          <div className="flex items-start gap-3 rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-right text-red-700">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold">{t("student.alert.title")}</p>
              <p className="text-sm">{inactivityAlert.message}</p>
            </div>
          </div>
        </ResultsAnalyticsAnimatedSection>
      ) : null}

      <ResultsAnalyticsAnimatedSection delay={0.02}>
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative">
              <UserAvatarImageOrInitials
                trackKey={profile.userId}
                name={profile.fullName}
                imageUrl={profile.profileImageUrl}
                size="xxxl"
                shape="square"
                circleClassName="bg-[#DCE6F5] text-[#2C4260]"
              />
              {profile.levelLabel ? (
                <span className="absolute -bottom-1  rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {profile.levelLabel}
                </span>
              ) : null}
            </div>
            <div className="space-y-2 text-right">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <h1 className="text-2xl font-bold text-slate-800">{profile.fullName}</h1>
                <DashboardBadge tone={profile.isActive ? "success" : "neutral"} withDot>
                  {profile.isActive ? t("student.profile.active") : t("student.profile.inactive")}
                </DashboardBadge>
              </div>
              <p className="text-sm text-slate-500">
                {profile.gradeName} - {profile.schoolName}
              </p>
              <p className="text-xs text-slate-400">
                {t("student.profile.studentId", { id: profile.username || profile.userId })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() =>
                router.push(`${ROUTES.ADMIN.USER_MANAGEMENT.VIEW(profile.userId)}?role=student`)
              }
            >
              <Pencil className="h-4 w-4" aria-hidden />
              {t("student.profile.editData")}
            </Button>
            <DisabledFeatureButton
              label={t("student.profile.instantMessage")}
              tooltip={t("comingSoon")}
              icon={MessageSquare}
              variant="default"
              className="rounded-2xl bg-[#2C4260] hover:bg-[#2C4260]"
            />
          </div>
        </div>
      </ResultsAnalyticsAnimatedSection>

      <ResultsAnalyticsAnimatedSection delay={0.06}>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-3 p-6">
              <p className="text-sm text-slate-500">{t("student.stats.averageScore")}</p>
              <p className="text-3xl font-bold text-slate-800">
                {formatPercent(kpis.averageScorePercent, locale)}
              </p>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#C7AF6E]"
                  style={{ width: `${Math.min(100, kpis.averageScorePercent)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <DashboardStatCard
            label={t("student.stats.totalAttempts")}
            value={new Intl.NumberFormat(locale).format(kpis.totalAttempts)}
            indicator={t("student.stats.attemptsThisMonth", { count: kpis.attemptsThisMonth })}
            icon={BookOpen}
            iconTone="info"
          />

          <DashboardStatCard
            label={t("student.stats.successfulExams")}
            value={new Intl.NumberFormat(locale).format(kpis.successfulExams)}
            icon={TrendingUp}
            iconTone="success"
          />

          <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-3 p-6">
              <p className="text-sm text-slate-500">{t("student.stats.failedExams")}</p>
              <p className="text-3xl font-bold text-red-500">
                {new Intl.NumberFormat(locale).format(kpis.failedExams)}
              </p>
              <p className="text-sm text-slate-400">
                {t("student.stats.lastFailure", {
                  time: formatRelativeTime(kpis.lastFailureAt, locale),
                })}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-3 p-6">
              <p className="text-sm text-slate-500">{t("student.stats.lastActivity")}</p>
              <p className="text-2xl font-bold text-slate-800">
                {formatRelativeTime(kpis.lastActivityAt, locale)}
              </p>
              <p className="text-sm text-slate-400">
                {t("student.stats.lastActivityDetail", { label: kpis.lastActivityLabel })}
              </p>
            </CardContent>
          </Card>
        </section>
      </ResultsAnalyticsAnimatedSection>

      <ResultsAnalyticsAnimatedSection delay={0.1}>
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            <AcademicProgressBarChart
              title={t("student.charts.academicProgress")}
              scoreLabel={t("student.charts.scoreLabel")}
              rows={weeklyProgress}
              periodControl={
                <DashboardSegmentedControl
                  options={periodOptions}
                  value={String(period)}
                  onChange={(value) => setPeriod(Number(value))}
                />
              }
            />

            <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
              <CardContent className="space-y-4 p-6">
                <h3 className="text-right text-xl font-bold text-slate-800">
                  {t("student.recentExams.title")}
                </h3>
                {recentAssessments.length === 0 ? (
                  <p className="text-center text-sm text-slate-500">{t("student.recentExams.empty")}</p>
                ) : (
                  <div className="space-y-3">
                    {recentAssessments.map((assessment) => (
                      <div
                        key={`${assessment.quizId}-${assessment.completedAt}`}
                        className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-[#FBFCFD] p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="space-y-1 text-right">
                          <p className="font-semibold text-slate-800">{assessment.quizTitle}</p>
                          <p className="text-xs text-slate-400">{assessment.courseTitle}</p>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-3">
                          <span className="font-semibold text-emerald-600">
                            {formatPercent(assessment.scorePercent, locale)}
                          </span>
                          <DashboardBadge tone={resultStatusTone(assessment.resultStatus)}>
                            {t(`resultStatus.${assessment.resultStatus}`)}
                          </DashboardBadge>
                          <span className="text-xs text-slate-400">
                            {formatRelativeTime(assessment.completedAt, locale)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {parent ? (
              <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-2 text-[#2C4260]">
                    <Users className="h-5 w-5" aria-hidden />
                    <h3 className="font-bold">{t("student.parent.title")}</h3>
                  </div>
                  <div className="space-y-2 text-right text-sm">
                    <p className="font-semibold text-slate-800">{parent.fullName}</p>
                    <p className="text-slate-500">
                      {t("student.parent.phone")}: {parent.phoneNumber}
                    </p>
                    <p className="text-slate-400">
                      {t("student.parent.linkedChildren", { count: parent.linkedChildrenCount })}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-2xl bg-[#F8EFD5] text-[#8F6C0B] hover:bg-[#F8EFD5]"
                    onClick={() =>
                      router.push(
                        `${ROUTES.ADMIN.USER_MANAGEMENT.VIEW(parent.parentUserId)}?role=parent`,
                      )
                    }
                  >
                    {t("student.parent.viewProfile")}
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            {subscription ? (
              <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-2 text-[#2C4260]">
                    <CreditCard className="h-5 w-5" aria-hidden />
                    <h3 className="font-bold">{t("student.subscription.title")}</h3>
                  </div>
                  <div className="space-y-2 text-right text-sm">
                    <p className="text-slate-500">
                      {t("student.subscription.enrolledCourses")}:{" "}
                      <span className="font-semibold text-slate-800">
                        {subscription.enrolledCoursesCount}
                      </span>
                    </p>
                    <p className="text-slate-500">
                      {t("student.subscription.completedCourses")}:{" "}
                      <span className="font-semibold text-slate-800">
                        {subscription.completedCoursesCount}
                      </span>
                    </p>
                    <p className="text-slate-500">
                      {t("student.subscription.latestPackage")}:{" "}
                      <span className="font-semibold text-slate-800">
                        {subscription.latestPackageLabel}
                      </span>
                    </p>
                    {subscription.latestEnrollmentAt ? (
                      <p className="text-slate-400">
                        {t("student.subscription.latestEnrollmentAt", {
                          date: new Date(subscription.latestEnrollmentAt).toLocaleDateString(locale),
                        })}
                      </p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </section>
      </ResultsAnalyticsAnimatedSection>

      <ResultsAnalyticsAnimatedSection delay={0.14}>
        <div className="space-y-4">
          <div className="flex">
            <DashboardSegmentedControl
              options={[
                { id: "exams", label: t("student.tabs.exams") },
                { id: "certificates", label: t("student.tabs.certificates") },
              ]}
              value={activeTab}
              onChange={setActiveTab}
            />
          </div>

          {activeTab === "exams" ? (
            <StudentResultsExamsTab studentId={studentId} />
          ) : (
            <StudentResultsCertificatesTab studentId={studentId} />
          )}
        </div>
      </ResultsAnalyticsAnimatedSection>
    </div>
  );
}
