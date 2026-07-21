"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { CourseCardModel } from "@/shared/domain/types/course.types";
import {
  DashboardPagination,
  DashboardSectionHeader,
  DashboardViewToggle,
  type DashboardViewMode,
} from "@/shared/presentation/components/dashboard";
import { CourseCard } from "@/modules/student/presentation/components/explore-courses/CourseCard";
import { FeaturedCourseCard } from "@/modules/student/presentation/components/explore-courses/FeaturedCourseCard";

type TeacherPublicProfileCoursesProps = {
  heroCourse: CourseCardModel | null;
  regularCourses: CourseCardModel[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
};

export function TeacherPublicProfileCourses({
  heroCourse,
  regularCourses,
  totalPages,
  currentPage,
  onPageChange,
  isLoading = false,
}: TeacherPublicProfileCoursesProps) {
  const t = useTranslations("student.dashboard.teacherPublicProfile");
  const [viewMode, setViewMode] = useState<DashboardViewMode>("grid");
  const hasCourses = Boolean(heroCourse) || regularCourses.length > 0;

  return (
    <section className="space-y-8">
      <DashboardSectionHeader
        title={t("courses.title")}
        actions={
          hasCourses ? (
            <DashboardViewToggle
              value={viewMode}
              onChange={setViewMode}
              gridLabel={t("courses.gridView")}
              listLabel={t("courses.listView")}
            />
          ) : null
        }
      />

      {isLoading ? (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[360px] animate-pulse rounded-[20px] bg-white/80" />
          ))}
        </div>
      ) : null}

      {!isLoading && !hasCourses ? (
        <div className="rounded-[24px] bg-white p-10 text-center shadow-[0px_8px_0px_0px_rgba(0,0,0,0.05)]">
          <p className="text-sm font-medium text-[#64748b]">{t("courses.empty")}</p>
        </div>
      ) : null}

      {!isLoading && hasCourses ? (
        <motion.div
          layout
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3"
              : "flex flex-col gap-6"
          }
        >
          {heroCourse ? <FeaturedCourseCard course={heroCourse} hideTeacher /> : null}
          {regularCourses.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              index={index + (heroCourse ? 1 : 0)}
              layout={viewMode === "list" ? "list" : "grid"}
              hideTeacher
            />
          ))}
        </motion.div>
      ) : null}

      {!isLoading && hasCourses && totalPages > 1 ? (
        <div className="flex justify-center">
          <DashboardPagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
            previousLabel={t("pagination.previous")}
            nextLabel={t("pagination.next")}
          />
        </div>
      ) : null}
    </section>
  );
}
