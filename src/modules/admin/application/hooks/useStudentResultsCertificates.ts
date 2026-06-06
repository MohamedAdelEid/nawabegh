"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { getStudentResultsCertificates } from "@/modules/admin/infrastructure/api/resultsAnalyticsApi";

export const ADMIN_STUDENT_RESULTS_CERTIFICATES_QUERY_KEY = "admin-student-results-certificates";

export function useStudentResultsCertificates(studentId: string, enabled = true) {
  const locale = useLocale();

  const query = useQuery({
    queryKey: [ADMIN_STUDENT_RESULTS_CERTIFICATES_QUERY_KEY, locale, studentId],
    queryFn: () => getStudentResultsCertificates(studentId),
    enabled: Boolean(studentId) && enabled,
  });

  return {
    data: query.data?.data ?? null,
    isLoading: query.isLoading || query.isFetching,
    errorMessage: query.data?.errorMessage,
    refetch: query.refetch,
  };
}
