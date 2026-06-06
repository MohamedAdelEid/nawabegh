"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { CurriculumManagementTab } from "@/modules/admin/domain/types/curriculumManagementFilters.types";
import {
  DEFAULT_EDUCATION_LEVELS_FILTERS,
  DEFAULT_GRADES_FILTERS,
  DEFAULT_SUBJECTS_FILTERS,
  type EducationLevelsFilterState,
  type GradesFilterState,
  type SubjectsFilterState,
} from "@/modules/admin/domain/types/curriculumManagementFilters.types";
import {
  getCountriesDropdown,
  getEducationLevelsDropdown,
} from "@/modules/admin/infrastructure/api/userManagementApi";
import {
  DashboardFilterOption,
  DashboardFilterSelect,
  DashboardFiltersPanel,
  DashboardSearchFilter,
} from "@/shared/presentation/components/dashboard";

export {
  DEFAULT_EDUCATION_LEVELS_FILTERS,
  DEFAULT_GRADES_FILTERS,
  DEFAULT_SUBJECTS_FILTERS,
};
export type { EducationLevelsFilterState, GradesFilterState, SubjectsFilterState };

type CurriculumManagementFilterBarProps =
  | {
      activeTab: "educationLevels";
      value: EducationLevelsFilterState;
      onChange: (next: EducationLevelsFilterState) => void;
    }
  | {
      activeTab: "grades";
      value: GradesFilterState;
      onChange: (next: GradesFilterState) => void;
    }
  | {
      activeTab: "subjects";
      value: SubjectsFilterState;
      onChange: (next: SubjectsFilterState) => void;
    };

export function CurriculumManagementFilterBar(props: CurriculumManagementFilterBarProps) {
  const t = useTranslations("admin.dashboard.curriculumManagement.filters");
  const [countryOptions, setCountryOptions] = useState<DashboardFilterOption<string>[]>([
    { id: "all", label: t("country.all") },
  ]);
  const [educationLevelOptions, setEducationLevelOptions] = useState<
    DashboardFilterOption<string>[]
  >([{ id: "all", label: t("educationLevel.all") }]);

  useEffect(() => {
    let cancelled = false;

    void getCountriesDropdown().then((result) => {
      if (cancelled) return;
      const rows = result.data ?? [];
      setCountryOptions([
        { id: "all", label: t("country.all") },
        ...rows.map((row) => ({ id: String(row.id), label: row.name })),
      ]);
    });

    return () => {
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    if (props.activeTab !== "grades") return;

    const countryId = props.value.countryId;
    if (countryId === "all") {
      setEducationLevelOptions([{ id: "all", label: t("educationLevel.all") }]);
      return;
    }

    let cancelled = false;

    void getEducationLevelsDropdown(Number(countryId)).then((result) => {
      if (cancelled) return;
      const rows = result.data ?? [];
      setEducationLevelOptions([
        { id: "all", label: t("educationLevel.all") },
        ...rows.map((row) => ({ id: String(row.id), label: row.name })),
      ]);
    });

    return () => {
      cancelled = true;
    };
  }, [props, t]);

  if (props.activeTab === "subjects") {
    return (
      <DashboardFiltersPanel innerClassName="flex-1">
        <DashboardSearchFilter
          label={t("search.label")}
          placeholder={t("search.placeholder")}
          value={props.value.keyword}
          onChange={(keyword) => props.onChange({ ...props.value, keyword })}
          className="min-w-[14rem] flex-[2]"
        />
      </DashboardFiltersPanel>
    );
  }

  if (props.activeTab === "educationLevels") {
    return (
      <DashboardFiltersPanel innerClassName="flex-1">
        <DashboardFilterSelect
          label={t("country.label")}
          value={props.value.countryId}
          options={countryOptions}
          onChange={(countryId) => props.onChange({ ...props.value, countryId })}
        />
        <DashboardSearchFilter
          label={t("search.label")}
          placeholder={t("search.placeholder")}
          value={props.value.keyword}
          onChange={(keyword) => props.onChange({ ...props.value, keyword })}
          className="min-w-[14rem] flex-[2]"
        />
      </DashboardFiltersPanel>
    );
  }

  return (
    <DashboardFiltersPanel innerClassName="flex-1">
      <DashboardFilterSelect
        label={t("country.label")}
        value={props.value.countryId}
        options={countryOptions}
        onChange={(countryId) =>
          props.onChange({ ...props.value, countryId, educationLevelId: "all" })
        }
      />
      <DashboardFilterSelect
        label={t("educationLevel.label")}
        value={props.value.educationLevelId}
        options={educationLevelOptions}
        disabled={props.value.countryId === "all"}
        onChange={(educationLevelId) => props.onChange({ ...props.value, educationLevelId })}
      />
      <DashboardSearchFilter
        label={t("search.label")}
        placeholder={t("search.placeholder")}
        value={props.value.keyword}
        onChange={(keyword) => props.onChange({ ...props.value, keyword })}
        className="min-w-[14rem] flex-[2]"
      />
    </DashboardFiltersPanel>
  );
}
