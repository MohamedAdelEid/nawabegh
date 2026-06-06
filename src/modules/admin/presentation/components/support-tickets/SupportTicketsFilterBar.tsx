"use client";

import { SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SupportTicketsFilterState } from "@/modules/admin/domain/types/supportTicketsFilters.types";
import {
  DashboardFilterSelect,
  DashboardFiltersPanel,
  DashboardSearchFilter,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";

export type SupportTicketsFilterBarProps = {
  filters: SupportTicketsFilterState;
  onChange: (patch: Partial<SupportTicketsFilterState>) => void;
  onApply: () => void;
};

export function SupportTicketsFilterBar({
  filters,
  onChange,
  onApply,
}: SupportTicketsFilterBarProps) {
  const t = useTranslations("admin.dashboard.supportTickets.filters");

  return (
    <DashboardFiltersPanel className="flex flex-wrap items-end gap-4" innerClassName="flex-1">

      <DashboardFilterSelect
        label={t("status.label")}
        value={filters.status}
        options={[
          { id: "all", label: t("status.all") },
          { id: "1", label: t("status.1") },
          { id: "2", label: t("status.2") },
          { id: "3", label: t("status.3") },
        ]}
        onChange={(status) => onChange({ status })}
      />

      <DashboardFilterSelect
        label={t("priority.label")}
        value={filters.priority}
        options={[
          { id: "all", label: t("priority.all") },
          { id: "1", label: t("priority.1") },
          { id: "2", label: t("priority.2") },
          { id: "3", label: t("priority.3") },
          { id: "4", label: t("priority.4") },
        ]}
        onChange={(priority) => onChange({ priority })}
      />

<DashboardSearchFilter
        label={t("search.label")}
        placeholder={t("search.placeholder")}
        value={filters.search}
        onChange={(search) => onChange({ search })}
        className="min-w-[14rem] flex-[2]"
      />
      {/* <Button
        type="button"
        variant="outline"
        className="h-14 rounded-2xl border-slate-200 px-4"
        onClick={onApply}
        aria-label={t("apply")}
      >
        <SlidersHorizontal className="h-5 w-5" aria-hidden />
      </Button> */}
    </DashboardFiltersPanel>
  );
}
