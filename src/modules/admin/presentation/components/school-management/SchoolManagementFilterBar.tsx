"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { SchoolManagementFilterState } from "@/modules/admin/domain/types/schoolManagementFilters.types";
import { getCountriesDropdown } from "@/modules/admin/infrastructure/api/userManagementApi";
import { findOmanCountry } from "@/shared/domain/utils/country.utils";
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
  const defaultCountryAppliedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await getCountriesDropdown();
      if (cancelled) return;
      if (result.data?.length) {
        const options = result.data.map((row) => ({
          id: row.name,
          label: row.name,
        }));
        setCountryOptions(options);

        const oman = findOmanCountry(result.data);
        if (oman && !defaultCountryAppliedRef.current && !value.country) {
          defaultCountryAppliedRef.current = true;
          onChange({ ...value, country: oman.name });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onChange, value]);

  const performanceOptions = useMemo(
    () => [
      { id: "all", label: t("schoolManagement.filters.performanceLevel.all") },
      { id: "ممتاز", label: t("schoolManagement.filters.performanceLevel.excellent") },
      { id: "جيد جداً", label: t("schoolManagement.filters.performanceLevel.veryGood") },
      { id: "جيد", label: t("schoolManagement.filters.performanceLevel.good") },
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
        label={t("schoolManagement.filters.city.label")}
        placeholder={t("schoolManagement.filters.city.placeholder")}
        value={value.city}
        onChange={(city) => onChange({ ...value, city })}
        className="min-w-[10rem] max-w-[12rem]"
      />
      <DashboardFilterSelect
        label={t("schoolManagement.filters.performanceLevel.label")}
        value={value.performanceLevel}
        options={performanceOptions}
        onChange={(performanceLevel) => onChange({ ...value, performanceLevel })}
      />
      <DashboardFilterSelect
        label={t("schoolManagement.filters.status.label")}
        value={value.status}
        options={[
          { id: "all", label: t("schoolManagement.filters.status.all") },
          { id: "1", label: t("schoolManagement.status.active") },
          { id: "2", label: t("schoolManagement.status.inactive") },
          { id: "0", label: t("schoolManagement.status.pending") },
        ]}
        onChange={(status) => onChange({ ...value, status })}
      />
      <DashboardSearchFilter
        label={t("schoolManagement.filters.keyword.label")}
        placeholder={t("schoolManagement.filters.keyword.placeholder")}
        value={value.keyword}
        onChange={(keyword) => onChange({ ...value, keyword })}
        className="min-w-0 w-full sm:min-w-[14rem] xl:min-w-[16rem]"
      />
    </DashboardFiltersPanel>
  );
}
