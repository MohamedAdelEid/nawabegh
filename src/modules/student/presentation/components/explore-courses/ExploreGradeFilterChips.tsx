"use client";

import { useLocale, useTranslations } from "next-intl";
import type { ExploreGradeFilterOption } from "@/shared/domain/types/course.types";
import { cn } from "@/shared/application/lib/cn";

type ExploreGradeFilterChipsProps = {
  grades: ExploreGradeFilterOption[];
  selectedGradeId: number | null;
  onChange: (gradeId: number | null) => void;
  totalCoursesCount: number;
  className?: string;
};

export function ExploreGradeFilterChips({
  grades,
  selectedGradeId,
  onChange,
  totalCoursesCount,
  className,
}: ExploreGradeFilterChipsProps) {
  const t = useTranslations("student.dashboard.exploreCourses");
  const locale = useLocale();
  const isArabic = locale.startsWith("ar");

  if (grades.length === 0 && selectedGradeId == null) return null;

  const allGradesCount =
    grades.reduce((sum, grade) => sum + grade.coursesCount, 0) || totalCoursesCount;

  return (
    <div className={cn("space-y-3", className)}>
      <div
        role="tablist"
        aria-label={t("filters.grades")}
        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <button
          type="button"
          role="tab"
          aria-selected={selectedGradeId == null}
          onClick={() => onChange(null)}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
            selectedGradeId == null
              ? "border-[#2b415e] bg-[#2b415e] text-white"
              : "border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#2b415e]/40 hover:text-[#2b415e]",
          )}
        >
          <span>{t("filters.allGrades")}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-bold",
              selectedGradeId == null
                ? "bg-white/20 text-white"
                : "bg-[#f1f5f9] text-[#64748b]",
            )}
          >
            {t("filters.coursesCount", { count: allGradesCount })}
          </span>
        </button>

        {grades.map((grade) => {
          const isActive = selectedGradeId === grade.id;
          const label = isArabic
            ? grade.nameAr || grade.nameEn
            : grade.nameEn || grade.nameAr;

          return (
            <button
              key={grade.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(grade.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                isActive
                  ? "border-[#2b415e] bg-[#2b415e] text-white"
                  : "border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#2b415e]/40 hover:text-[#2b415e]",
              )}
            >
              <span>{label}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-bold",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-[#f1f5f9] text-[#64748b]",
                )}
              >
                {t("filters.coursesCount", { count: grade.coursesCount })}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
