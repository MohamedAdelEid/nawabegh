"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ENROLLMENT_ACCESS_FILTER } from "@/modules/admin/domain/types/payments.types";
import { AddUserDateField } from "@/modules/admin/presentation/components/add-user/AddUserDateField";
import CalendarIcon from "@/modules/admin/presentation/assets/icons/CalenderIcon";
import {
  DashboardFilterSelect,
  DashboardFiltersPanel,
  DashboardSearchFilter,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";

export type StudentEnrollmentsFilterState = {
  search: string;
  status: string;
  startsFrom: string;
  startsTo: string;
  endsFrom: string;
  endsTo: string;
};

export const DEFAULT_STUDENT_ENROLLMENTS_FILTERS: StudentEnrollmentsFilterState = {
  search: "",
  status: "all",
  startsFrom: "",
  startsTo: "",
  endsFrom: "",
  endsTo: "",
};

export type StudentEnrollmentsFilterBarProps = {
  filters: StudentEnrollmentsFilterState;
  onChange: (filters: StudentEnrollmentsFilterState) => void;
  onReset: () => void;
};

export function StudentEnrollmentsFilterBar({
  filters,
  onChange,
  onReset,
}: StudentEnrollmentsFilterBarProps) {
  const t = useTranslations("admin.dashboard.paymentManagement.enrollments.filters");

  const statusOptions = useMemo(
    () => [
      { id: "all", label: t("status.all") },
      { id: String(ENROLLMENT_ACCESS_FILTER.active), label: t("status.active") },
      { id: String(ENROLLMENT_ACCESS_FILTER.expired), label: t("status.expired") },
      { id: String(ENROLLMENT_ACCESS_FILTER.inactive), label: t("status.inactive") },
    ],
    [t],
  );

  return (
    <DashboardFiltersPanel>
      <DashboardSearchFilter
        label={t("search.label")}
        placeholder={t("search.placeholder")}
        value={filters.search}
        onChange={(search) => onChange({ ...filters, search })}
        className="min-w-[14rem] flex-1 xl:min-w-[18rem]"
      />
      <DashboardFilterSelect
        label={t("status.label")}
        value={filters.status}
        options={statusOptions}
        onChange={(status) => onChange({ ...filters, status })}
      />
      <div className="grid min-w-[14rem] grid-cols-2 gap-2">
        <AddUserDateField
          label={t("startsFrom")}
          value={filters.startsFrom}
          onChange={(startsFrom) => onChange({ ...filters, startsFrom })}
          placeholder="..."
          icon={CalendarIcon}
        />
        <AddUserDateField
          label={t("startsTo")}
          value={filters.startsTo}
          onChange={(startsTo) => onChange({ ...filters, startsTo })}
          placeholder="..."
          icon={CalendarIcon}
        />
      </div>
      <div className="grid min-w-[14rem] grid-cols-2 gap-2">
        <AddUserDateField
          label={t("endsFrom")}
          value={filters.endsFrom}
          onChange={(endsFrom) => onChange({ ...filters, endsFrom })}
          placeholder="..."
          icon={CalendarIcon}
        />
        <AddUserDateField
          label={t("endsTo")}
          value={filters.endsTo}
          onChange={(endsTo) => onChange({ ...filters, endsTo })}
          placeholder="..."
          icon={CalendarIcon}
        />
      </div>
      <Button type="button" variant="outline" className="h-12 rounded-xl" onClick={onReset}>
        {t("reset")}
      </Button>
    </DashboardFiltersPanel>
  );
}
