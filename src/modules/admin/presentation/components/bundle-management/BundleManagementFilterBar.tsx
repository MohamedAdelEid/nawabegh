"use client";

import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import type { BundleManagementFilterState } from "@/modules/admin/domain/types/bundleManagement.types";
import { DEFAULT_BUNDLE_MANAGEMENT_FILTERS } from "@/modules/admin/domain/types/bundleManagement.types";
import {
  DashboardFilterSelect,
  DashboardFiltersPanel,
  DashboardSearchFilter,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { AddUserDateField } from "@/modules/admin/presentation/components/add-user/AddUserDateField";
import CalendarIcon from "@/modules/admin/presentation/assets/icons/CalenderIcon";

type BundleManagementFilterBarProps = {
  value: BundleManagementFilterState;
  onChange: (next: BundleManagementFilterState) => void;
  onReset: () => void;
};

export function BundleManagementFilterBar({
  value,
  onChange,
  onReset,
}: BundleManagementFilterBarProps) {
  const t = useTranslations("admin.dashboard.bundleManagement");

  const statusOptions = [
    { id: "all", label: t("filters.status.all") },
    { id: "0", label: t("filters.status.active") },
    { id: "1", label: t("filters.status.inactive") },
  ];

  return (
    <DashboardFiltersPanel>
      <DashboardSearchFilter
        label={t("filters.search.label")}
        placeholder={t("filters.search.placeholder")}
        value={value.keyword}
        onChange={(keyword) => onChange({ ...value, keyword })}
        className="min-w-0 w-full flex-1 sm:min-w-[14rem] xl:min-w-[18rem]"
      />
      <DashboardFilterSelect
        label={t("filters.status.label")}
        value={value.status}
        options={statusOptions}
        onChange={(status) =>
          onChange({ ...value, status: status as BundleManagementFilterState["status"] })
        }
      />
      <div className="flex min-w-[12rem] flex-col gap-2 text-right">
        <span className="text-sm font-medium text-[#64748B]">{t("filters.dateRange.label")}</span>
        <div className="grid grid-cols-2 gap-2">
          <AddUserDateField
            label={t("filters.dateRange.from")}
            value={value.createdFrom}
            onChange={(createdFrom) => onChange({ ...value, createdFrom })}
            placeholder={t("filters.dateRange.placeholder")}
            icon={CalendarIcon}
          />
          <AddUserDateField
            label={t("filters.dateRange.to")}
            value={value.createdTo}
            onChange={(createdTo) => onChange({ ...value, createdTo })}
            placeholder={t("filters.dateRange.placeholder")}
            icon={CalendarIcon}
          />
        </div>
      </div>
      <LabeledInput
        label={t("filters.minPrice.label")}
        value={value.minPrice}
        placeholder="0"
        onChange={(minPrice) => onChange({ ...value, minPrice })}
        className="min-w-[8rem] max-w-[10rem]"
      />
      <LabeledInput
        label={t("filters.maxPrice.label")}
        value={value.maxPrice}
        placeholder="5000"
        onChange={(maxPrice) => onChange({ ...value, maxPrice })}
        className="min-w-[8rem] max-w-[10rem]"
      />
      <Button
        type="button"
        variant="ghost"
        className="h-14 gap-2 self-end rounded-2xl px-4 text-sm font-semibold text-slate-500 hover:bg-slate-100"
        onClick={() => {
          onChange(DEFAULT_BUNDLE_MANAGEMENT_FILTERS);
          onReset();
        }}
      >
        <RotateCcw className="h-4 w-4" aria-hidden />
        {t("filters.reset")}
      </Button>
    </DashboardFiltersPanel>
  );
}
