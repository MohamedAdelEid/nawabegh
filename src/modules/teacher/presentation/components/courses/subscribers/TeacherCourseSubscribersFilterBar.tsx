"use client";

import { Search, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/presentation/components/ui/button";
import { Input } from "@/shared/presentation/components/ui/input";
import { DashboardSearchFilter } from "@/shared/presentation/components/dashboard/filters/DashboardFilters";

export type TeacherCourseSubscribersFilterBarProps = {
  keyword: string;
  onKeywordChange: (value: string) => void;
  onReset: () => void;
};

export function TeacherCourseSubscribersFilterBar({
  keyword,
  onKeywordChange,
  onReset,
}: TeacherCourseSubscribersFilterBarProps) {
  const t = useTranslations("teacher.dashboard");

  return (
    <div className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-[var(--dashboard-shadow-soft)] md:flex-row md:items-center md:justify-between">
      {/* <Button
        type="button"
        variant="outline"
        className="h-11 rounded-xl border-slate-200 text-slate-700"
        onClick={onReset}
      >
        <RefreshCw className="ml-2 h-4 w-4" aria-hidden />
        {t("courses.subscribers.filters.reset")}
      </Button> */}

        <DashboardSearchFilter
          label={t("courses.subscribers.filters.searchLabel")}
          value={keyword}
          onChange={onKeywordChange}
          placeholder={t("courses.subscribers.filters.searchPlaceholder")}
        />

    </div>
  );
}
