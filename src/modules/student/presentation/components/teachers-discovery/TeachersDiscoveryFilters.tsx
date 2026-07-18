"use client";

import { SlidersHorizontal } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Subject } from "@/shared/domain/types/subject.types";
import type { TeachersDiscoverySort } from "@/modules/student/application/hooks/useTeachersDiscovery";
import { cn } from "@/shared/application/lib/cn";

type TeachersDiscoveryFiltersProps = {
  subjects: Subject[];
  subjectId: number | null;
  onSubjectChange: (subjectId: number | null) => void;
  sort: TeachersDiscoverySort;
  onSortChange: (sort: TeachersDiscoverySort) => void;
  subjectsLoading?: boolean;
  className?: string;
};

export function TeachersDiscoveryFilters({
  subjects,
  subjectId,
  onSubjectChange,
  sort,
  onSortChange,
  subjectsLoading = false,
  className,
}: TeachersDiscoveryFiltersProps) {
  const t = useTranslations("student.dashboard.teachersDiscovery.filters");
  const locale = useLocale();

  const resolveSubjectLabel = (subject: Subject) =>
    locale.startsWith("ar") ? subject.nameAr : subject.nameEn;

  return (
    <section
      className={cn(
        "grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]",
        className,
      )}
    >
      <div className="flex h-14 items-center gap-2 rounded-2xl bg-white px-4 shadow-[0px_10px_25px_-5px_rgba(0,0,0,0.04)]">
        <SlidersHorizontal className="size-[18px] shrink-0 text-[#64748b]" aria-hidden />
        <label className="sr-only" htmlFor="teachers-sort">
          {t("sortLabel")}
        </label>
        <select
          id="teachers-sort"
          value={sort}
          onChange={(event) => onSortChange(event.target.value as TeachersDiscoverySort)}
          className="w-full appearance-none bg-transparent text-sm font-bold text-[#475569] outline-none"
        >
          <option value="topRated">{t("sortTopRated")}</option>
        </select>
      </div>

      <div className="flex min-h-14 flex-wrap items-center justify-end gap-2 rounded-2xl bg-white px-2 py-2 shadow-[0px_10px_25px_-5px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          disabled={subjectsLoading}
          onClick={() => onSubjectChange(null)}
          className={cn(
            "rounded-xl px-6 py-2.5 text-sm font-bold transition-colors",
            subjectId == null
              ? "bg-[#2c4260] text-white"
              : "text-[#475569] hover:bg-[#f8fafc]",
          )}
        >
          {t("allSubjects")}
        </button>

        {subjects.map((subject) => {
          const isActive = subjectId === subject.id;
          return (
            <button
              key={subject.id}
              type="button"
              disabled={subjectsLoading}
              onClick={() => onSubjectChange(subject.id)}
              className={cn(
                "rounded-xl px-6 py-2.5 text-sm font-bold transition-colors",
                isActive
                  ? "bg-[#2c4260] text-white"
                  : "text-[#475569] hover:bg-[#f8fafc]",
              )}
            >
              {resolveSubjectLabel(subject)}
            </button>
          );
        })}
      </div>
    </section>
  );
}
