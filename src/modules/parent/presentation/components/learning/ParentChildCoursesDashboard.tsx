"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, MessageCircle, Sparkles, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  classifyCourseTab,
  resolveCourseActionKey,
  type CourseFilterTab,
} from "@/modules/parent/application/lib/parentLearning.utils";
import { useParentChildCourses } from "@/modules/parent/application/hooks/useParentLearning";
import {
  clampPercent,
  formatPercent,
  resolveLocalizedText,
} from "@/modules/parent/application/lib/parentHome.utils";
import { ParentAvatar } from "@/modules/parent/presentation/components/home/ParentAvatar";
import { ParentProgressBar } from "@/modules/parent/presentation/components/home/ParentProgressBar";
import type { ParentChildCourseItem } from "@/modules/parent/domain/types/parentLearning.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { cn } from "@/shared/application/lib/cn";

const FILTER_TABS: CourseFilterTab[] = ["all", "active", "completed", "needsFollowUp"];

function filterLabelKey(tab: CourseFilterTab) {
  switch (tab) {
    case "active":
      return "activeCourses";
    case "completed":
      return "completedCourses";
    case "needsFollowUp":
      return "needsFollowUp";
    default:
      return "allCourses";
  }
}

function actionLabelKey(action: ReturnType<typeof resolveCourseActionKey>) {
  switch (action) {
    case "start":
      return "viewJourney";
    case "continue":
      return "viewJourney";
    case "renew":
      return "subscribeNow";
    default:
      return "details";
  }
}

function CourseCard({
  course,
  studentUserId,
  locale,
}: {
  course: ParentChildCourseItem;
  studentUserId: string;
  locale: string;
}) {
  const t = useTranslations("parent.dashboard.learning");
  const coverUrl = resolveFileUrl(course.coverImageUrl);
  const subjectTitle = resolveLocalizedText(
    locale,
    course.subjectNameAr,
    course.subjectNameEn,
    course.title,
  );
  const actionKey = resolveCourseActionKey(course);
  const isRenew = actionKey === "renew";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[20px] border border-[#eef2f6] bg-white shadow-[0px_8px_0px_rgba(0,0,0,0.04)]">
      <div className="relative h-32 w-full shrink-0 bg-[#eef4ff]">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt={course.title} className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <BookOpen className="size-10 text-[#1e88e5]" aria-hidden />
          </div>
        )}
        <span className="absolute end-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#2b415e] shadow-sm">
          {subjectTitle}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-1 text-start">
          <h3 className="truncate text-base font-bold text-[#2b415e]">{course.title}</h3>
          <p className="text-xs text-[#64748b]">
            {t("lessonsProgress", {
              completed: course.completedLessonsCount,
              total: course.lessonsCount,
            })}
          </p>
        </div>

        {course.instructorName ? (
          <div className="flex items-center gap-2">
            <ParentAvatar
              url={course.instructorImageUrl}
              name={course.instructorName}
              className="size-7"
              roundedClassName="rounded-full"
            />
            <span className="truncate text-xs font-medium text-[#64748b]">
              {course.instructorName}
            </span>
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#2b415e]">
              {formatPercent(clampPercent(course.progressPercent))}
            </span>
            <span className="text-[#64748b]">{t("completionRate")}</span>
          </div>
          <ParentProgressBar value={course.progressPercent} barClassName="bg-[#58cc02]" />
        </div>

        {course.attendancePercent != null || course.quizAverageScorePercent != null ? (
          <div className="grid grid-cols-2 gap-2">
            {course.attendancePercent != null ? (
              <div className="rounded-xl bg-[#f8f9fa] p-2.5 text-center">
                <p className="text-sm font-bold text-[#2b415e]">
                  {formatPercent(course.attendancePercent)}
                </p>
                <p className="text-[10px] text-[#64748b]">{t("attendance")}</p>
              </div>
            ) : null}
            {course.quizAverageScorePercent != null ? (
              <div className="rounded-xl bg-[#f8f9fa] p-2.5 text-center">
                <p className="text-sm font-bold text-[#2b415e]">
                  {formatPercent(course.quizAverageScorePercent)}
                </p>
                <p className="text-[10px] text-[#64748b]">{t("quizAverage")}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex flex-col gap-2 border-t border-[#eef2f6] pt-4">
          {isRenew ? (
            <Button
              asChild
              className="h-10 w-full rounded-xl bg-[#c7af6d] text-sm font-bold text-white hover:bg-[#b89f5d]"
            >
              <Link
                href={`${ROUTES.USER.PARENT.COURSE_CHECKOUT(course.courseId)}?studentUserId=${encodeURIComponent(studentUserId)}`}
              >
                {t(actionLabelKey(actionKey))}
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              className="h-10 w-full rounded-xl bg-[#1e88e5] text-sm font-bold text-white hover:bg-[#1976d2]"
            >
              <Link href={ROUTES.USER.PARENT.CHILD_COURSE_JOURNEY(studentUserId, course.courseId)}>
                {t(actionLabelKey(actionKey))}
              </Link>
            </Button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button
              asChild
              variant="outline"
              className="h-9 gap-1.5 rounded-xl border-[#e2e8f0] bg-[#f8f9fa] text-xs font-bold text-[#2b415e]"
            >
              <Link href={ROUTES.USER.PARENT.CHILD_COURSE_RESULTS(studentUserId, course.courseId)}>
                <Sparkles className="size-3.5" aria-hidden />
                {t("results")}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-9 gap-1.5 rounded-xl border-[#e2e8f0] bg-[#f8f9fa] text-xs font-bold text-[#2b415e]"
            >
              <Link href={ROUTES.USER.PARENT.CHILD_COURSE_CHAT(studentUserId, course.courseId)}>
                <MessageCircle className="size-3.5" aria-hidden />
                {t("courseChat")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ParentChildCoursesDashboard({ studentUserId }: { studentUserId: string }) {
  const t = useTranslations("parent.dashboard.learning");
  const tCommon = useTranslations("parent.dashboard.common");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectFilter = searchParams.get("subject");
  const [tab, setTab] = useState<CourseFilterTab>("all");

  const coursesQuery = useParentChildCourses(studentUserId);

  const clearSubjectFilter = () => {
    router.push(ROUTES.USER.PARENT.CHILD_COURSES(studentUserId));
  };

  const allCourses = coursesQuery.data?.courses ?? [];
  const bySubject = useMemo(() => {
    if (!subjectFilter) return allCourses;
    return allCourses.filter((course) => {
      const subjectTitle = resolveLocalizedText(
        locale,
        course.subjectNameAr,
        course.subjectNameEn,
        course.title,
      );
      return subjectTitle.trim() === subjectFilter.trim();
    });
  }, [allCourses, subjectFilter, locale]);

  const filteredCourses = useMemo(() => {
    if (tab === "all") return bySubject;
    return bySubject.filter((course) => classifyCourseTab(course) === tab);
  }, [bySubject, tab]);

  if (coursesQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full flex-col gap-8 pb-8">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-12 w-72 rounded-2xl" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-96 rounded-[20px]" />
          ))}
        </div>
      </div>
    );
  }

  if (coursesQuery.isError || !coursesQuery.data) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-[20px] border border-red-100 bg-white p-6">
        <p className="text-sm text-red-600">{tCommon("error")}</p>
        <Button type="button" onClick={() => coursesQuery.refetch()}>
          {tCommon("retry")}
        </Button>
      </div>
    );
  }

  const title = subjectFilter
    ? t("coursesTitle", { subject: subjectFilter })
    : t("myCoursesTitle");

  return (
    <div className="mx-auto flex w-full flex-col gap-8 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="order-2 sm:order-1">
          <Button
            asChild
            variant="outline"
            className="h-12 gap-2 rounded-xl border-[#e2e8f0] bg-[#f8f9fa] px-6 text-sm font-bold text-[#2b415e]"
          >
            <Link href={ROUTES.USER.PARENT.COURSES_CATALOG}>
              <BookOpen className="size-4" aria-hidden />
              {t("browseCatalog")}
            </Link>
          </Button>
        </div>
        <div className="order-1 text-end sm:order-2">
          <p className="mb-1 text-sm text-[#94a3b8]">{t("breadcrumbCourses")}</p>
          <h1 className="text-2xl font-bold text-[#2b415e] md:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-[#64748b]">{t("coursesSubtitle")}</p>
        </div>
      </header>

      {subjectFilter ? (
        <button
          type="button"
          onClick={clearSubjectFilter}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-[#e8f0ff] px-4 py-2 text-xs font-bold text-[#1e88e5]"
        >
          <X className="size-3.5" aria-hidden />
          {subjectFilter}
        </button>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setTab(option)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-bold transition",
              tab === option
                ? "bg-[#2b415e] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            {t(filterLabelKey(option))}
          </button>
        ))}
      </div>

      {filteredCourses.length === 0 ? (
        <p className="rounded-2xl bg-white p-10 text-center text-[#64748b] shadow-[0px_8px_0px_rgba(0,0,0,0.04)]">
          {t("emptyCourses")}
        </p>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.enrollmentId}
              course={course}
              studentUserId={studentUserId}
              locale={locale}
            />
          ))}
        </section>
      )}
    </div>
  );
}
