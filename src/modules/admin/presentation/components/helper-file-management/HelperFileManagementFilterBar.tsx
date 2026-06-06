"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  getResourceFileCoursesDropdown,
  getStationsList,
} from "@/modules/admin/infrastructure/api/resourceFileApi";
import { ResourceFileType } from "@/shared/domain/enums/cms.enums";
import {
  DashboardFilterSelect,
  DashboardSearchFilter,
  type DashboardFilterOption,
} from "@/shared/presentation/components/dashboard";

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
  const [stationOptions, setStationOptions] = useState<DashboardFilterOption<string>[]>([]);
  const [courseOptions, setCourseOptions] = useState<DashboardFilterOption<string>[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const loadOptions = async () => {
      setOptionsLoading(true);
      const [stationsResult, coursesResult] = await Promise.all([
        getStationsList(),
        getResourceFileCoursesDropdown(),
      ]);
      if (!alive) return;

      if (stationsResult.data) {
        setStationOptions(
          stationsResult.data.map((station) => ({
            id: station.id,
            label: station.learningPathTitle
              ? `${station.name} — ${station.learningPathTitle}`
              : station.name,
          })),
        );
      } else {
        setStationOptions([]);
      }

      if (coursesResult.data) {
        setCourseOptions(
          coursesResult.data.map((course) => ({
            id: course.id,
            label: course.teacherName
              ? `${course.courseName} — ${course.teacherName}`
              : course.courseName,
          })),
        );
      } else {
        setCourseOptions([]);
      }

      setOptionsLoading(false);
    };

    void loadOptions();
    return () => {
      alive = false;
    };
  }, []);

  const stationSelectOptions = useMemo<DashboardFilterOption<string>[]>(() => {
    if (optionsLoading) {
      return [{ id: "all", label: t("filters.station.loading") }];
    }
    return [{ id: "all", label: t("filters.station.all") }, ...stationOptions];
  }, [optionsLoading, stationOptions, t]);

  const courseSelectOptions = useMemo<DashboardFilterOption<string>[]>(() => {
    if (optionsLoading) {
      return [{ id: "all", label: t("filters.course.loading") }];
    }
    return [{ id: "all", label: t("filters.course.all") }, ...courseOptions];
  }, [courseOptions, optionsLoading, t]);

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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardFilterSelect
          label={t("filters.station.label")}
          value={value.stationId}
          options={stationSelectOptions}
          onChange={(stationId) => onChange({ ...value, stationId })}
          disabled={optionsLoading}
        />
        <DashboardFilterSelect
          label={t("filters.course.label")}
          value={value.courseId}
          options={courseSelectOptions}
          onChange={(courseId) => onChange({ ...value, courseId })}
          disabled={optionsLoading}
        />
        <DashboardFilterSelect
          label={t("filters.resourceFileType.label")}
          value={value.resourceFileType}
          options={resourceFileTypeOptions}
          onChange={(resourceFileType) => onChange({ ...value, resourceFileType })}
        />
        <DashboardSearchFilter
          label={t("filters.search.label")}
          placeholder={t("filters.search.placeholder")}
          value={value.keyword}
          onChange={(keyword) => onChange({ ...value, keyword })}
          className="w-full"
        />
      </div>
    </section>
  );
}
