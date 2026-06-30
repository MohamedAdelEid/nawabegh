"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Subject } from "@/shared/domain/types/subject.types";
import { SearchableSelect } from "@/shared/presentation/components/ui/searchable-select";

type SubjectFilterSelectProps = {
  subjects: Subject[];
  value: number | null;
  onChange: (subjectId: number | null) => void;
  isLoading?: boolean;
  isError?: boolean;
};

export function SubjectFilterSelect({
  subjects,
  value,
  onChange,
  isLoading = false,
  isError = false,
}: SubjectFilterSelectProps) {
  const t = useTranslations("student.dashboard.exploreCourses");
  const locale = useLocale();
  const isArabic = locale.startsWith("ar");
  const [search, setSearch] = useState("");

  const subjectLabel = (subject: Subject) =>
    isArabic ? subject.nameAr : subject.nameEn || subject.nameAr;

  const options = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = normalizedSearch
      ? subjects.filter((subject) =>
          subjectLabel(subject).toLowerCase().includes(normalizedSearch),
        )
      : subjects;

    return [
      { value: "", label: t("filters.allSubjects") },
      ...filtered.map((subject) => ({
        value: String(subject.id),
        label: subjectLabel(subject),
      })),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects, search, isArabic, t]);

  return (
    <SearchableSelect
      value={value != null ? String(value) : ""}
      options={options}
      onChange={(next) => onChange(next ? Number(next) : null)}
      placeholder={t("filters.subjectPlaceholder")}
      searchPlaceholder={t("filters.subjectSearch")}
      emptyMessage={t("filters.noSubjects")}
      loadErrorMessage={t("filters.subjectsError")}
      isLoading={isLoading}
      isError={isError}
      searchValue={search}
      onSearchValueChange={setSearch}
    />
  );
}
