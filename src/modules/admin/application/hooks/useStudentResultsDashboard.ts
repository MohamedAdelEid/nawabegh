"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  });

  return {
    dashboard: query.data?.data ?? null,
    isLoading: query.isLoading || query.isFetching,
    errorMessage: query.data?.errorMessage,
    period,
    setPeriod,
    refetch: query.refetch,
  };
}
