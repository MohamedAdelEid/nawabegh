"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  getResourceFileCoursesDropdown,
  getStationsList,
} from "@/modules/admin/infrastructure/api/resourceFileApi";
import { fetchTeacherMyCoursesOptions } from "@/modules/teacher/infrastructure/api/teacherCoursesApi";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import { formatCourseContextLabel } from "@/shared/domain/utils/grade.utils";
import { ResourceFileType } from "@/shared/domain/enums/cms.enums";
import {
  DashboardFilterSelect,
  DashboardSearchFilter,
  type DashboardFilterOption,
} from "@/shared/presentation/components/dashboard";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/shared/presentation/components/ui/searchable-select";

export type HelperFileManagementFilterState = {
  stationId: string;
  courseId: string;
  resourceFileType: string;
  keyword: string;
};

type HelperFileManagementFilterBarProps = {
  value: HelperFileManagementFilterState;
  onChange: (next: HelperFileManagementFilterState) => void;
};

export function HelperFileManagementFilterBar({
  value,
  onChange,
}: HelperFileManagementFilterBarProps) {
  const t = useTranslations("admin.dashboard.contentManagement");
  const locale = useLocale();
  const routes = useScopedDashboardRoutes();
  const isTeacherScope = routes.scope === "teacher";
  const [stationOptions, setStationOptions] = useState<DashboardFilterOption<string>[]>([]);
  const [courseOptions, setCourseOptions] = useState<DashboardFilterOption<string>[]>([]);
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [optionsLoading, setOptionsLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const loadOptions = async () => {
      setOptionsLoading(true);

      try {
        if (isTeacherScope) {
          const courses = await fetchTeacherMyCoursesOptions({ pageSize: 100 });
          if (!alive) return;
          setStationOptions([]);
          setCourseOptions(
            courses.map((course) => ({
              id: course.courseId,
              label: formatCourseContextLabel(locale, course.title, course.subject, course),
            })),
          );
        } else {
          const [stationsResult, coursesResult] = await Promise.all([
            getStationsList(),
            getResourceFileCoursesDropdown(),
          ]);
          if (!alive) return;

          setStationOptions(
            stationsResult.data
              ? stationsResult.data.map((station) => ({
                  id: station.id,
                  label: station.learningPathTitle
                    ? `${station.name} — ${station.learningPathTitle}`
                    : station.name,
                }))
              : [],
          );

          setCourseOptions(
            coursesResult.data
              ? coursesResult.data.map((course) => ({
                  id: course.id,
                  label: course.teacherName
                    ? `${course.courseName} — ${course.teacherName}`
                    : course.courseName,
                }))
              : [],
          );
        }
      } finally {
        if (alive) setOptionsLoading(false);
      }
    };

    void loadOptions();
    return () => {
      alive = false;
    };
  }, [isTeacherScope, locale]);

  const stationSelectOptions = useMemo<DashboardFilterOption<string>[]>(() => {
    if (optionsLoading) {
      return [{ id: "all", label: t("filters.station.loading") }];
    }
    return [{ id: "all", label: t("filters.station.all") }, ...stationOptions];
  }, [optionsLoading, stationOptions, t]);

  const courseSelectOptions = useMemo<SearchableSelectOption<string>[]>(
    () =>
      courseOptions.map((course) => ({
        value: course.id,
        label: course.label,
      })),
    [courseOptions],
  );

  const filteredCourseSelectOptions = useMemo(() => {
    if (optionsLoading) return [];

    const allOption: SearchableSelectOption<string> = {
      value: "all",
      label: t("filters.course.all"),
    };
    const query = courseSearchQuery.trim().toLowerCase();

    if (!query) return [allOption, ...courseSelectOptions];

    return courseSelectOptions.filter((option) => option.label.toLowerCase().includes(query));
  }, [courseSearchQuery, courseSelectOptions, optionsLoading, t]);

  const resourceFileTypeOptions = useMemo<DashboardFilterOption<string>[]>(
    () => [
      { id: "all", label: t("filters.resourceFileType.all") },
      {
        id: String(ResourceFileType.ForStation),
        label: t("filters.resourceFileType.station"),
      },
      {
        id: String(ResourceFileType.ForCourse),
        label: t("filters.resourceFileType.course"),
      },
    ],
    [t],
  );

  return (
    <section
      className="rounded-[1.75rem] border border-white/80 bg-white p-5"
      style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {/* <DashboardFilterSelect
          label={t("filters.station.label")}
          value={value.stationId}
          options={stationSelectOptions}
          onChange={(stationId) => onChange({ ...value, stationId })}
          disabled={optionsLoading}
        /> */}
        <SearchableSelect
          label={t("filters.course.label")}
          value={value.courseId}
          options={filteredCourseSelectOptions}
          onChange={(courseId) => onChange({ ...value, courseId })}
          placeholder={t("filters.course.all")}
          searchPlaceholder={t("filters.course.searchPlaceholder")}
          emptyMessage={t("filters.course.empty")}
          disabled={optionsLoading}
          isLoading={optionsLoading}
          searchValue={courseSearchQuery}
          onSearchValueChange={setCourseSearchQuery}
        />
        {/* <DashboardFilterSelect
          label={t("filters.resourceFileType.label")}
          value={value.resourceFileType}
          options={resourceFileTypeOptions}
          onChange={(resourceFileType) => onChange({ ...value, resourceFileType })}
        /> */}
        <DashboardSearchFilter
          label={t("filters.search.label")}
          placeholder={t("filters.search.placeholder")}
          value={value.keyword}
          onChange={(keyword) => onChange({ ...value, keyword })}
          className="w-full flex-1"
        />
      </div>
    </section>
  );
}
