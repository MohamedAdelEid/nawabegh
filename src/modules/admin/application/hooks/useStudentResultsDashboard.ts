"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getTableQueryState,
  keepPreviousTableData,
} from "@/shared/application/lib/tableQueryState";

import { useLocale } from "next-intl";
import { getStudentResultsDashboard } from "@/modules/admin/infrastructure/api/resultsAnalyticsApi";

export const ADMIN_STUDENT_RESULTS_DASHBOARD_QUERY_KEY = "admin-student-results-dashboard";

export function useStudentResultsDashboard(studentId: string, periodDays = 30) {
  const locale = useLocale();
  const [period, setPeriod] = useState(periodDays);

  const query = useQuery({
    queryKey: [ADMIN_STUDENT_RESULTS_DASHBOARD_QUERY_KEY, locale, studentId, period],
    queryFn: () => getStudentResultsDashboard(studentId, period),
    enabled: Boolean(studentId),
    placeholderData: keepPreviousTableData,
  });

  const tableQueryState = getTableQueryState(query);
  return {
    dashboard: query.data?.data ?? null,
    ...tableQueryState,
    errorMessage: query.data?.errorMessage,
    period,
    setPeriod,
    refetch: query.refetch,
  };
}
