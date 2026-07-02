"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getTableQueryState,
  keepPreviousTableData,
} from "@/shared/application/lib/tableQueryState";

import { useLocale } from "next-intl";
import { getStudentResultsCertificates } from "@/modules/admin/infrastructure/api/resultsAnalyticsApi";

export const ADMIN_STUDENT_RESULTS_CERTIFICATES_QUERY_KEY = "admin-student-results-certificates";

export function useStudentResultsCertificates(studentId: string, enabled = true) {
  const locale = useLocale();

  const query = useQuery({
    queryKey: [ADMIN_STUDENT_RESULTS_CERTIFICATES_QUERY_KEY, locale, studentId],
    queryFn: () => getStudentResultsCertificates(studentId),
    enabled: Boolean(studentId) && enabled,
    placeholderData: keepPreviousTableData,
  });

  const tableQueryState = getTableQueryState(query);
  return {
    data: query.data?.data ?? null,
    ...tableQueryState,
    errorMessage: query.data?.errorMessage,
    refetch: query.refetch,
  };
}
