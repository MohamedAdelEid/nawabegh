"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Filter } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  DashboardBreadcrumb,
  DashboardPageHeader,
  DashboardSectionHeader,
  DashboardViewToggle,
  type DashboardViewMode,
} from "@/shared/presentation/components/dashboard";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  useExploreCourses,
  type ExploreCoursesInitialData,
} from "@/modules/student/application/hooks/useExploreCourses";
import { ExploreCoursesEmptyState } from "./ExploreCoursesEmptyState";
import { ExploreCoursesFilters } from "./ExploreCoursesFilters";
import { ExploreCoursesGrid } from "./ExploreCoursesGrid";

type ExploreCoursesDashboardProps = {
  initial?: ExploreCoursesInitialData;
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

export function ExploreCoursesDashboard({ initial }: ExploreCoursesDashboardProps) {
  const t = useTranslations("student.dashboard.exploreCourses");
  const [viewMode, setViewMode] = useState<DashboardViewMode>("grid");

  const {
    keyword,
    setKeyword,
    subjectId,
    setSubjectId,
    teacherId,
    setTeacherId,
    teacherSearch,
    setTeacherSearch,
    subjectsQuery,
    teachersQuery,
    coursesQuery,
    courses,
  } = useExploreCourses({ initial });

  const subjects = subjectsQuery.data ?? [];
  const teachers = teachersQuery.data ?? [];
  const isInitialCoursesLoading = coursesQuery.isLoading && courses.length === 0;
  const coursesError = coursesQuery.error instanceof Error ? coursesQuery.error.message : null;

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <DashboardBreadcrumb
          items={[
            { label: t("page.breadcrumbHome"), href: ROUTES.USER.STUDENT.HOME },
            { label: t("page.breadcrumbCurrent") },
          ]}
        />
        <DashboardPageHeader
          title={t("page.title")}
          description={t("page.description")}
          action={
            <Button
              type="button"
              className="rounded-lg bg-[#2b415e] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#243650]"
            >
              {t("page.myCoursesAction")}
            </Button>
          }
        />
      </div>

      <ExploreCoursesFilters
        keyword={keyword}
        onKeywordChange={setKeyword}
        subjectId={subjectId}
        onSubjectChange={setSubjectId}
        teacherId={teacherId}
        onTeacherChange={setTeacherId}
        teacherSearch={teacherSearch}
        onTeacherSearchChange={setTeacherSearch}
        subjects={subjects}
        teachers={teachers}
        subjectsLoading={subjectsQuery.isLoading && subjects.length === 0}
        teachersLoading={teachersQuery.isLoading && teachers.length === 0}
        teachersError={teachersQuery.isError}
      />

      {subjectsQuery.isError && subjects.length === 0 ? (
        <ExploreCoursesEmptyState variant="subjects" />
      ) : null}

      {teachersQuery.isError && teachers.length === 0 ? (
        <ExploreCoursesEmptyState variant="teachers" />
      ) : null}

      <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
        <DashboardSectionHeader
          title={t("section.title")}
          actions={
            <div className="flex items-center gap-2">
              {/* <button
                type="button"
                aria-label={t("section.filter")}
                className="flex h-[38px] w-[38px] items-center justify-center rounded-lg border-2 border-[#cbd5e1] bg-white text-[#64748b] transition-colors hover:border-slate-300"
              >
                <Filter className="size-[18px]" aria-hidden />
              </button> */}
              <DashboardViewToggle
                value={viewMode}
                onChange={setViewMode}
                gridLabel={t("section.gridView")}
                listLabel={t("section.listView")}
              />
            </div>
          }
        />
      </motion.div>

      {coursesError ? (
        <ApiFailureAlert
          message={coursesError}
          fallbackMessage={t("errors.courses")}
          className="mb-4"
        />
      ) : null}

      {coursesError ? (
        <div className="flex justify-center">
          <Button type="button" variant="outline" onClick={() => void coursesQuery.refetch()}>
            {t("errors.retry")}
          </Button>
        </div>
      ) : null}

      {!coursesError && !isInitialCoursesLoading && courses.length === 0 ? (
        <ExploreCoursesEmptyState variant="courses" />
      ) : null}

      {!coursesError && (isInitialCoursesLoading || courses.length > 0) ? (
        <ExploreCoursesGrid
          courses={courses}
          viewMode={viewMode}
          isLoading={isInitialCoursesLoading}
          isFetchingNextPage={coursesQuery.isFetchingNextPage}
          hasNextPage={Boolean(coursesQuery.hasNextPage)}
          fetchNextPage={() => void coursesQuery.fetchNextPage()}
        />
      ) : null}
    </div>
  );
}
