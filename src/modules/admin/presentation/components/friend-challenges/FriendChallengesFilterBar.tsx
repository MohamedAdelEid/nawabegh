"use client";

import { useTranslations } from "next-intl";
import type { FriendChallengesFilterState } from "@/modules/admin/domain/types/friendChallengesFilters.types";
import CalendarIcon from "@/modules/admin/presentation/assets/icons/CalenderIcon";
import { AddUserDateField } from "@/modules/admin/presentation/components/add-user/AddUserDateField";
import {
  DashboardFilterSelect,
  DashboardFiltersPanel,
  DashboardSearchFilter,
} from "@/shared/presentation/components/dashboard";

export type FriendChallengesFilterBarProps = {
  filters: FriendChallengesFilterState;
  subjectOptions: Array<{ value: string; label: string }>;
  onChange: (patch: Partial<FriendChallengesFilterState>) => void;
};

export function FriendChallengesFilterBar({
  filters,
  subjectOptions,
  onChange,
}: FriendChallengesFilterBarProps) {
  const t = useTranslations("admin.dashboard.friendChallenges.overview.filters");

  return (
    <DashboardFiltersPanel className="flex flex-wrap items-end gap-4" innerClassName="flex-1">
      <DashboardFilterSelect
        label={t("difficulty.label")}
        value={filters.difficulty}
        options={[
          { id: "all", label: t("difficulty.all") },
          { id: "Easy", label: t("difficulty.easy") },
          { id: "Medium", label: t("difficulty.medium") },
          { id: "Hard", label: t("difficulty.hard") },
        ]}
        onChange={(difficulty) => onChange({ difficulty })}
      />

      <DashboardFilterSelect
        label={t("subject.label")}
        value={filters.subjectId}
        options={[
          { id: "all", label: t("subject.all") },
          ...subjectOptions.map((option) => ({ id: option.value, label: option.label })),
        ]}
        onChange={(subjectId) => onChange({ subjectId })}
      />

      <div className="flex min-w-[12rem] flex-col gap-2 text-right">
        {/* <span className="text-sm font-medium text-[#64748B]">{t("fromDate")}</span> */}
        <AddUserDateField
          label={t("fromDate")}
          value={filters.fromDate}
          onChange={(fromDate) => onChange({ fromDate })}
          placeholder="..."
          icon={CalendarIcon}
        />
      </div>

      <div className="flex min-w-[12rem] flex-col gap-2 text-right">
        {/* <span className="text-sm font-medium text-[#64748B]">{t("toDate")}</span> */}
        <AddUserDateField
          label={t("toDate")}
          value={filters.toDate}
          onChange={(toDate) => onChange({ toDate })}
          placeholder="..."
          icon={CalendarIcon}
        />
      </div>
      <DashboardSearchFilter
        label={t("search.label")}
        placeholder={t("search.placeholder")}
        value={filters.search}
        onChange={(search) => onChange({ search })}
        className="min-w-0 w-full flex-[2] sm:min-w-[14rem]"
      />
    </DashboardFiltersPanel>
  );
}
