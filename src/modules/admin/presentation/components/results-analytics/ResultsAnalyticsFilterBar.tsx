"use client";

import { useTranslations } from "next-intl";
import type { ResultsAnalyticsFilterState } from "@/modules/admin/domain/types/resultsAnalyticsFilters.types";
import { SCORE_MODE, type ScoreMode } from "@/modules/admin/domain/types/resultsAnalytics.types";
import {
  DashboardFilterSelect,
  DashboardFiltersPanel,
  DashboardSearchFilter,
} from "@/shared/presentation/components/dashboard";

export type ResultsAnalyticsFilterBarProps = {
  filters: ResultsAnalyticsFilterState;
  examOptions: Array<{ value: string; label: string }>;
  schoolOptions: Array<{ value: string; label: string }>;
  onChange: (patch: Partial<ResultsAnalyticsFilterState>) => void;
};

export function ResultsAnalyticsFilterBar({
  filters,
  examOptions,
  schoolOptions,
  onChange,
}: ResultsAnalyticsFilterBarProps) {
  const t = useTranslations("admin.dashboard.resultsAnalytics.overview.filters");

  return (
    <DashboardFiltersPanel className="flex flex-wrap items-end gap-4" innerClassName="flex-1">
      <DashboardFilterSelect
        label={t("exam.label")}
        value={filters.quizId || "all"}
        options={[
          { id: "all", label: t("exam.all") },
          ...examOptions.map((option) => ({ id: option.value, label: option.label })),
        ]}
        onChange={(quizId) => onChange({ quizId: quizId === "all" ? "" : quizId })}
      />

      <DashboardFilterSelect
        label={t("school.label")}
        value={filters.schoolId || "all"}
        options={[
          { id: "all", label: t("school.all") },
          ...schoolOptions.map((option) => ({ id: option.value, label: option.label })),
        ]}
        onChange={(schoolId) => onChange({ schoolId: schoolId === "all" ? "" : schoolId })}
      />

      <DashboardFilterSelect
        label={t("scoreMode.label")}
        value={String(filters.scoreMode)}
        options={[
          { id: String(SCORE_MODE.bestAttempt), label: t("scoreMode.best") },
          { id: String(SCORE_MODE.latestAttempt), label: t("scoreMode.latest") },
          { id: String(SCORE_MODE.firstAttempt), label: t("scoreMode.first") },
        ]}
        onChange={(scoreMode) => onChange({ scoreMode: Number(scoreMode) as ScoreMode })}
      />

      <DashboardSearchFilter
        label={t("search.label")}
        placeholder={t("search.placeholder")}
        value={filters.search}
        onChange={(search) => onChange({ search })}
        className="min-w-[14rem] flex-[2]"
      />
    </DashboardFiltersPanel>
  );
}
