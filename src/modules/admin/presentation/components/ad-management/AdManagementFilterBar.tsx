"use client";

import { useTranslations } from "next-intl";
import {
  DEFAULT_AD_MANAGEMENT_FILTERS,
  type AdManagementFilterState,
} from "@/modules/admin/domain/types/adManagementFilters.types";
import {
  DashboardFilterSelect,
  DashboardFiltersPanel,
  DashboardSearchFilter,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";

export { DEFAULT_AD_MANAGEMENT_FILTERS };
export type { AdManagementFilterState };

type AdManagementFilterBarProps = {
  value: AdManagementFilterState;
  onChange: (next: AdManagementFilterState) => void;
  onApply?: () => void;
};

export function AdManagementFilterBar({ value, onChange, onApply }: AdManagementFilterBarProps) {
  const t = useTranslations("admin.dashboard.adManagement.filters");

  return (
    <DashboardFiltersPanel className="flex flex-wrap items-end gap-4" innerClassName="flex-1">
      <DashboardFilterSelect
        label={t("type.label")}
        value={value.type}
        options={[
          { id: "all", label: t("type.all") },
          { id: "banner", label: t("type.banner") },
          { id: "popup", label: t("type.popup") },
          { id: "card", label: t("type.card") },
        ]}
        onChange={(type) => onChange({ ...value, type })}
      />
      <DashboardFilterSelect
        label={t("placement.label")}
        value={value.placement}
        options={[
          { id: "all", label: t("placement.all") },
          { id: "Banner", label: t("placement.banner") },
          { id: "Popup", label: t("placement.popup") },
          { id: "Card", label: t("placement.card") },
        ]}
        onChange={(placement) => onChange({ ...value, placement })}
      />
      <DashboardFilterSelect
        label={t("status.label")}
        value={value.status}
        options={[
          { id: "all", label: t("status.all") },
          { id: "active", label: t("status.active") },
          { id: "scheduled", label: t("status.scheduled") },
          { id: "expired", label: t("status.expired") },
          { id: "draft", label: t("status.draft") },
          { id: "paused", label: t("status.paused") },
        ]}
        onChange={(status) => onChange({ ...value, status })}
      />
      <DashboardSearchFilter
        label={t("search.label")}
        placeholder={t("search.placeholder")}
        value={value.keyword}
        onChange={(keyword) => onChange({ ...value, keyword })}
        className="min-w-[14rem] flex-[2] flex-1"
      />
      <Button
        type="button"
        variant="outline"
        className="h-14 rounded-2xl border-slate-200 px-6"
        onClick={onApply}
      >
        {t("apply")}
      </Button>
    </DashboardFiltersPanel>
  );
}
