"use client";

import { BookOpen, Clock, Pencil, Route, Sparkles, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useTeacherCourses } from "@/modules/teacher/application/hooks/useTeacherCourses";
import type { TeacherCourseListRow } from "@/modules/teacher/domain/types/teacher.types";
import {
  JourneyEditorAnimatedSection,
  JourneyEditorDashboardSkeleton,
} from "@/modules/admin/presentation/components/journey-editor";
import { CourseCoverPreview } from "@/modules/admin/presentation/components/course-management";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import { DashboardPageHeader, DashboardSearchFilter } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { DashboardBadge } from "@/shared/presentation/components/dashboard/DashboardBadge";

const SEARCH_DEBOUNCE_MS = 350;

function computeReadinessPercent(row: TeacherCourseListRow): number {
  const pathCount = row.learningPathCount ?? 0;
  const stationCount = row.stationCount ?? 0;
  if (stationCount > 0) return 100;
  if (pathCount > 0) return 55;
  return 0;
}

function CourseJourneyCard({
  course,
  onOpen,
}: {
  course: TeacherCourseListRow;
  onOpen: () => void;
}) {
  const t = useTranslations("teacher.dashboard.journeyEditor");
  const readiness = computeReadinessPercent(course);
  const pathCount = course.learningPathCount ?? 0;
  const stationCount = course.stationCount ?? 0;

  return (
    <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_8px_0px_0px_#0000000D] transition-shadow hover:shadow-lg">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <CourseCoverPreview
            tone={course.coverTone}
            label={course.coverLabel}
            imageUrl={course.coverImageUrl}
            className="h-14 w-14"
          />
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
            {t("dashboard.readyBadge", { percent: readiness })}
          </span>
        </div>

        <div>
          <h3 className="text-right text-lg font-bold text-slate-800">{course.title}</h3>
          <p className="mt-1 text-right text-sm text-slate-400">
            {[course.subject, course.grade].filter(Boolean).join(" · ")}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <Route className="h-3.5 w-3.5" />
            <span>{t("dashboard.paths", { count: pathCount })}</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-[#C8AC59]" />
            <span>{t("dashboard.stations", { count: stationCount })}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{t("dashboard.students", { count: course.studentCount ?? 0 })}</span>
          </div>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#C8AC59] transition-all duration-500"
            style={{ width: `${readiness}%` }}
          />
        </div>

        <Button
          className="h-11 w-full cursor-pointer gap-2 rounded-lg bg-[#2C4260] text-white shadow-[0px_4px_0px_0px_#1E3050] hover:bg-[#1E3050]"
          onClick={onOpen}
        >
          <Pencil className="h-4 w-4" />
          {t("dashboard.openEditor")}
        </Button>
      </CardContent>
    </Card>
  );
}

export function TeacherJourneyEditorDashboard() {
  const t = useTranslations("teacher.dashboard.journeyEditor");
  const router = useRouter();
  const routes = useScopedDashboardRoutes();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const { data, isPending, isError } = useTeacherCourses({
    query: debouncedQuery,
    page: 1,
    pageSize: 50,
    status: "all",
  });

  const courses = useMemo(() => data?.rows ?? [], [data?.rows]);

  return (
    <div className="space-y-7">
      <JourneyEditorAnimatedSection>
        <DashboardPageHeader
          title={t("page.title")}
          description={t("page.description")}
          action={
            <DashboardSearchFilter
              label={t("page.searchLabel")}
              value={query}
              onChange={setQuery}
              placeholder={t("page.searchPlaceholder")}
            />
          }
        />
      </JourneyEditorAnimatedSection>

      {isPending && !data ? (
        <div role="status" aria-label={t("dashboard.loading")}>
          <JourneyEditorDashboardSkeleton />
        </div>
      ) : isError ? (
        <Card className="rounded-[1.75rem] border-red-100 bg-red-50/50">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-red-600">{t("page.loadError")}</p>
          </CardContent>
        </Card>
      ) : courses.length === 0 ? (
        <Card className="rounded-[1.75rem] border-dashed border-slate-200 bg-slate-50/50">
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF2FB] text-[#2C4260]">
              <BookOpen className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">{t("page.emptyTitle")}</h3>
              <p className="text-sm text-slate-500">{t("page.emptyDescription")}</p>
            </div>
            <DashboardBadge tone="info">{t("page.emptyHint")}</DashboardBadge>
          </CardContent>
        </Card>
      ) : (
        <JourneyEditorAnimatedSection delay={0.08}>
          <div className="mb-4 flex items-center justify-end gap-2 text-sm text-slate-500">
            <Clock className="h-4 w-4" />
            <span>{t("page.courseCount", { count: courses.length })}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <CourseJourneyCard
                key={course.id}
                course={course}
                onOpen={() => router.push(routes.journeyEditor.EDITOR(course.id))}
              />
            ))}
          </div>
        </JourneyEditorAnimatedSection>
      )}
    </div>
  );
}
