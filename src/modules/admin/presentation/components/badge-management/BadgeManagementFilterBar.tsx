"use client";

import { useTranslations } from "next-intl";
import {
  DEFAULT_ACHIEVEMENT_BADGE_FILTERS,
  type AchievementBadgeFilterState,
} from "@/modules/admin/domain/types/achievementBadgesFilters.types";
import {
  DashboardFilterSelect,
  DashboardFiltersPanel,
  DashboardSearchFilter,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";

export { DEFAULT_ACHIEVEMENT_BADGE_FILTERS };
export type { AchievementBadgeFilterState };

type BadgeManagementFilterBarProps = {
  value: AchievementBadgeFilterState;
  onChange: (next: AchievementBadgeFilterState) => void;
  onApply?: () => void;
};

export function BadgeManagementFilterBar({
  value,
  onChange,
  onApply,
}: BadgeManagementFilterBarProps) {
  const t = useTranslations("admin.dashboard.badgeManagement.filters");

  return (
    <DashboardFiltersPanel className="flex flex-wrap items-end gap-4" innerClassName="flex-1">
      <DashboardSearchFilter
        label={t("search.label")}
        placeholder={t("search.placeholder")}
        value={value.keyword}
        onChange={(keyword) => onChange({ ...value, keyword })}
        className="min-w-[14rem] flex-[2] flex-1"
      />
      <DashboardFilterSelect
        label={t("status.label")}
        value={value.status}
        options={[
          { id: "all", label: t("status.all") },
          { id: "active", label: t("status.active") },
          { id: "inactive", label: t("status.inactive") },
        ]}
        onChange={(status) =>
          onChange({ ...value, status: status as AchievementBadgeFilterState["status"] })
        }
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
