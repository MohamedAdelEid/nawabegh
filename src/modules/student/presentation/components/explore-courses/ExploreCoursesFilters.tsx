"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Subject } from "@/shared/domain/types/subject.types";
import type { Teacher } from "@/shared/domain/types/teacher.types";
import { cn } from "@/shared/application/lib/cn";
import { SubjectFilterSelect } from "./SubjectFilterSelect";
import { TeacherFilterSelect } from "./TeacherFilterSelect";

type ExploreCoursesFiltersProps = {
  keyword: string;
  onKeywordChange: (value: string) => void;
  subjectId: number | null;
  onSubjectChange: (value: number | null) => void;
  teacherId: string | null;
  onTeacherChange: (value: string | null) => void;
  teacherSearch: string;
  onTeacherSearchChange: (value: string) => void;
  subjects: Subject[];
  teachers: Teacher[];
  subjectsLoading?: boolean;
  subjectsError?: boolean;
  teachersLoading?: boolean;
  teachersError?: boolean;
  className?: string;
};

export function ExploreCoursesFilters({
  keyword,
  onKeywordChange,
  subjectId,
  onSubjectChange,
  teacherId,
  onTeacherChange,
  teacherSearch,
  onTeacherSearchChange,
  subjects,
  teachers,
  subjectsLoading = false,
  subjectsError = false,
  teachersLoading = false,
  teachersError = false,
  className,
}: ExploreCoursesFiltersProps) {
  const t = useTranslations("student.dashboard.exploreCourses");

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
      className={cn(
        "relative rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-[0px_10px_25px_-5px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      <div className="relative mb-6">
        <input
          type="search"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder={t("filters.searchPlaceholder")}
          aria-label={t("filters.searchPlaceholder")}
          className="w-full rounded-md border border-transparent bg-[#f8fafc] px-6 py-5 ps-14 text-lg font-medium text-[#2b415e] outline-none transition-[box-shadow,border-color] placeholder:text-[#6b7280] focus:border-[#2b415e]/20 focus:shadow-[0_0_0_3px_rgba(43,65,94,0.08)]"
        />
        <Search
          className="pointer-events-none absolute start-6 top-1/2 size-[18px] -translate-y-1/2 text-[#64748b]"
          aria-hidden
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-[#2b415e]">
            {t("filters.subject")}
          </label>
          <SubjectFilterSelect
            subjects={subjects}
            value={subjectId}
            onChange={onSubjectChange}
            isLoading={subjectsLoading}
            isError={subjectsError}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-bold text-[#2b415e]">
            {t("filters.teacher")}
          </label>
          <TeacherFilterSelect
            teachers={teachers}
            value={teacherId}
            onChange={onTeacherChange}
            searchValue={teacherSearch}
            onSearchValueChange={onTeacherSearchChange}
            isLoading={teachersLoading}
            isError={teachersError}
          />
        </div>
      </div>
    </motion.section>
  );
}
