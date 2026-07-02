"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getTableQueryState,
  keepPreviousTableData,
} from "@/shared/application/lib/tableQueryState";

import { useLocale } from "next-intl";
import { SCORE_MODE } from "@/modules/admin/domain/types/resultsAnalytics.types";
import { getStudentResultsExams } from "@/modules/admin/infrastructure/api/resultsAnalyticsApi";

const DEFAULT_PAGE_SIZE = 10;

export const ADMIN_STUDENT_RESULTS_EXAMS_QUERY_KEY = "admin-student-results-exams";

function buildPages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 0) return [1];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);
  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

export function useStudentResultsExams(studentId: string, scoreMode = SCORE_MODE.bestAttempt) {
  const locale = useLocale();
  const [pageNumber, setPageNumber] = useState(1);

  const queryParams = useMemo(
    () => ({
      studentId,
      scoreMode,
      pageNumber,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    [pageNumber, scoreMode, studentId],
  );

  const query = useQuery({
    queryKey: [ADMIN_STUDENT_RESULTS_EXAMS_QUERY_KEY, locale, queryParams],
    queryFn: () => getStudentResultsExams(queryParams),
    enabled: Boolean(studentId),
    placeholderData: keepPreviousTableData,
  });

  const page = query.data?.data ?? null;
  const totalPages = page?.totalPages ?? 1;

  useEffect(() => {
    if (page && pageNumber > totalPages) {
      setPageNumber(totalPages);
    }
  }, [page, pageNumber, totalPages]);

  const tableQueryState = getTableQueryState(query);
  return {
    page,
    pageNumber,
    setPageNumber,
    pages: buildPages(pageNumber, totalPages),
    ...tableQueryState,
    errorMessage: query.data?.errorMessage,
    refetch: query.refetch,
  };
}
