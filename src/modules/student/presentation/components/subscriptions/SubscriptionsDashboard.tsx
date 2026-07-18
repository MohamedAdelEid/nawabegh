"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMySubscriptions } from "@/modules/student/application/hooks/useMySubscriptions";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { SubscriptionCourseCard } from "./SubscriptionCourseCard";
import { SubscriptionsHeader } from "./SubscriptionsHeader";
import { SubscriptionsSkeleton } from "./SubscriptionsSkeleton";
import { SubscriptionsStatsRow } from "./SubscriptionsStatsRow";

export function SubscriptionsDashboard() {
  const t = useTranslations("student.dashboard.subscriptions");
  const {
    dashboardQuery,
    sortedCourses,
    refreshAll,
    handleContinueLearning,
    continuingCourseId,
    continueError,
    isLoading,
    errorMessage,
  } = useMySubscriptions();

  if (isLoading && !dashboardQuery.data) {
    return <SubscriptionsSkeleton />;
  }

  if (errorMessage && !dashboardQuery.data) {
    return (
      <div className="space-y-4">
        <ApiFailureAlert message={errorMessage} fallbackMessage={t("errors.load")} />
        <Button type="button" variant="outline" onClick={() => void refreshAll()}>
          {t("errors.retry")}
        </Button>
      </div>
    );
  }

  const dashboard = dashboardQuery.data;
  if (!dashboard) return null;

  const studentName = dashboard.studentName || t("fallbackName");

  return (
    <div className="space-y-12 pb-10">
      <SubscriptionsHeader studentName={studentName} />

      <SubscriptionsStatsRow stats={dashboard.stats} />

      {continueError ? (
        <ApiFailureAlert message={continueError} fallbackMessage={t("errors.continue")} />
      ) : null}

      <section className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-[#2c4260]">{t("courses.title")}</h2>
          {sortedCourses.length > 0 ? (
            <span className="text-sm font-semibold text-[#64748b]">
              {t("courses.count", { count: sortedCourses.length })}
            </span>
          ) : null}
        </div>

        {sortedCourses.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {sortedCourses.map((course) => (
              <SubscriptionCourseCard
                key={course.enrollmentId || course.courseId}
                course={course}
                isContinuing={continuingCourseId === course.courseId}
                onContinue={handleContinueLearning}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-6 py-16 text-center">
            <p className="mb-6 text-[#64748b]">{t("courses.empty")}</p>
            <Button asChild className="rounded-2xl bg-[#c7a55b] px-6 font-bold hover:bg-[#c7a55b]/90">
              <Link href={ROUTES.USER.STUDENT.COURSES}>{t("actions.explore")}</Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
