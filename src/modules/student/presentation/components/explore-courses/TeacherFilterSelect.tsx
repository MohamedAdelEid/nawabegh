"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { Teacher } from "@/shared/domain/types/teacher.types";
import { SearchableSelect } from "@/shared/presentation/components/ui/searchable-select";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user/UserAvatarImageOrInitials";

type TeacherFilterSelectProps = {
  teachers: Teacher[];
  value: string | null;
  onChange: (teacherId: string | null) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  isLoading?: boolean;
  isError?: boolean;
};

export function TeacherFilterSelect({
  teachers,
  value,
  onChange,
  searchValue,
  onSearchValueChange,
  isLoading = false,
  isError = false,
}: TeacherFilterSelectProps) {
  const t = useTranslations("student.dashboard.exploreCourses");

  const options = useMemo(
    () => [
      { value: "", label: t("filters.allTeachers") },
      ...teachers.map((teacher) => ({
        value: teacher.teacherId,
        label: teacher.fullName,
      })),
    ],
    [teachers, t],
  );

  return (
    <SearchableSelect
      // label={t("filters.teacher")}
      value={value ?? ""}
      options={options}
      onChange={(next) => onChange(next ? next : null)}
      placeholder={t("filters.teacherPlaceholder")}
      searchPlaceholder={t("filters.teacherSearch")}
      emptyMessage={t("filters.noTeachers")}
      loadErrorMessage={t("filters.teachersError")}
      isLoading={isLoading}
      isError={isError}
      searchValue={searchValue}
      onSearchValueChange={onSearchValueChange}
      renderTriggerLeading={(option) => {
        const teacher = teachers.find((item) => item.teacherId === option.value);
        return teacher ? (
          <UserAvatarImageOrInitials
            trackKey={teacher.teacherId}
            name={teacher.fullName}
            imageUrl={teacher.profileImageUrl}
            size="sm"
            circleClassName="!h-6 !w-6 !text-[10px]"
          />
        ) : null;
      }}
      renderOptionLeading={(option) => {
        const teacher = teachers.find((item) => item.teacherId === option.value);
        return teacher ? (
          <UserAvatarImageOrInitials
            trackKey={`${teacher.teacherId}-option`}
            name={teacher.fullName}
            imageUrl={teacher.profileImageUrl}
            size="sm"
            circleClassName="!h-7 !w-7 !text-[10px]"
          />
        ) : null;
      }}
    />
  );
}
