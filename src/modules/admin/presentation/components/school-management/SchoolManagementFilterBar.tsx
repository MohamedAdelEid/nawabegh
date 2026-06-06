"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { schoolEducationStages } from "@/modules/admin/domain/data/schoolFormOptions";
import type { SchoolManagementFilterState } from "@/modules/admin/domain/types/schoolManagementFilters.types";
import { getCountriesDropdown } from "@/modules/admin/infrastructure/api/userManagementApi";
import {
  DashboardFilterSelect,
  DashboardFiltersPanel,
  DashboardSearchFilter,
  type DashboardFilterOption,
} from "@/shared/presentation/components/dashboard";

export type { SchoolManagementFilterState } from "@/modules/admin/domain/types/schoolManagementFilters.types";
export { DEFAULT_SCHOOL_MANAGEMENT_FILTERS } from "@/modules/admin/domain/types/schoolManagementFilters.types";

type SchoolManagementFilterBarProps = {
  value: SchoolManagementFilterState;
  onChange: (next: SchoolManagementFilterState) => void;
};

export function SchoolManagementFilterBar({
  value,
  onChange,
}: SchoolManagementFilterBarProps) {
  const t = useTranslations("admin.dashboard");
  const [countryOptions, setCountryOptions] = useState<DashboardFilterOption<string>[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await getCountriesDropdown();
      if (cancelled) return;
      if (result.data?.length) {
        setCountryOptions(
          result.data.map((row) => ({
            id: row.name,
            label: row.name,
          })),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const performanceOptions = useMemo(
    () => [
      { id: "all", label: t("schoolManagement.filters.performanceLevel.all") },
      ...schoolEducationStages.map((stage) => ({
        id: stage.id,
        label: t(stage.labelKey),
      })),
    ],
    [t],
  );

  const countrySelectOptions = useMemo(
    () => [
      { id: "", label: t("schoolManagement.filters.country.all") },
      ...countryOptions,
    ],
    [countryOptions, t],
  );

  return (
    <DashboardFiltersPanel>
      <DashboardFilterSelect
        label={t("schoolManagement.filters.country.label")}
        value={value.country}
        options={countrySelectOptions}
        onChange={(country) => onChange({ ...value, country })}
      />
      <DashboardSearchFilter
        label={t("schoolManagement.filters.points.label")}
        placeholder={t("schoolManagement.filters.points.placeholder")}
        value={value.points}
        onChange={(points) => onChange({ ...value, points })}
        className="min-w-[8rem] max-w-[10rem]"
      />
      <DashboardFilterSelect
        label={t("schoolManagement.filters.performanceLevel.label")}
        value={value.performanceLevel}
        options={performanceOptions}
        onChange={(performanceLevel) => onChange({ ...value, performanceLevel })}
      />
      <DashboardSearchFilter
        label={t("schoolManagement.filters.keyword.label")}
        placeholder={t("schoolManagement.filters.keyword.placeholder")}
        value={value.keyword}
        onChange={(keyword) => onChange({ ...value, keyword })}
        className="min-w-[14rem] xl:min-w-[16rem]"
      />
    </DashboardFiltersPanel>
  );
}
