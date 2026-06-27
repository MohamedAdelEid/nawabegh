"use client";

import { BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";

type ExploreCoursesEmptyStateProps = {
  variant?: "courses" | "subjects" | "teachers";
};

export function ExploreCoursesEmptyState({
  variant = "courses",
}: ExploreCoursesEmptyStateProps) {
  const t = useTranslations("student.dashboard.exploreCourses");

  return (
    <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#cbd5e1] bg-white px-6 py-16 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#f8fafc] text-[#2b415e]">
        <BookOpen className="size-7" aria-hidden />
      </div>
      <h3 className="mb-2 text-xl font-bold text-[#2b415e]">
        {t(`empty.${variant}.title`)}
      </h3>
      <p className="max-w-md text-sm leading-7 text-[#64748b]">
        {t(`empty.${variant}.description`)}
      </p>
    </div>
  );
}
