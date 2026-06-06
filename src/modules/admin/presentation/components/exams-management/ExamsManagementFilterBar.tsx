"use client";

import { useTranslations } from "next-intl";
import type { ExamsManagementFilterState } from "@/modules/admin/domain/types/examsManagementFilters.types";
import {
  DashboardFilterSelect,
  DashboardFiltersPanel,
  DashboardSearchFilter,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";

export type ExamsManagementFilterBarProps = {
  filters: ExamsManagementFilterState;
  courseOptions: Array<{ value: string; label: string }>;
  onChange: (patch: Partial<ExamsManagementFilterState>) => void;
  onApply: () => void;
};

export function ExamsManagementFilterBar({
  filters,
  courseOptions,
  onChange,
  onApply,
}: ExamsManagementFilterBarProps) {
  const t = useTranslations("admin.dashboard.examsManagement.filters");

  return (
    <DashboardFiltersPanel className="flex flex-wrap items-end gap-4">
      <DashboardSearchFilter
        label={t("search.label")}
        placeholder={t("search.placeholder")}
        value={filters.search}
        onChange={(search) => onChange({ search })}
        className="min-w-[14rem] flex-[2]"
      />

      <DashboardFilterSelect
        label={t("course.label")}
        value={filters.courseId || "all"}
        options={[
          { id: "all", label: t("course.all") },
          ...courseOptions.map((option) => ({ id: option.value, label: option.label })),
        ]}
        onChange={(courseId) => onChange({ courseId: courseId === "all" ? "" : courseId })}
      />

      <DashboardFilterSelect
        label={t("status.label")}
        value={filters.status || "all"}
        options={[
          { id: "all", label: t("status.all") },
          { id: "0", label: t("status.0") },
          { id: "1", label: t("status.1") },
          { id: "2", label: t("status.2") },
          { id: "3", label: t("status.3") },
        ]}
        onChange={(status) => onChange({ status: status === "all" ? "" : status })}
      />

      <Button type="button" className="h-12 rounded-xl px-6" onClick={onApply}>
        {t("apply")}
      </Button>
    </DashboardFiltersPanel>
  );
}
