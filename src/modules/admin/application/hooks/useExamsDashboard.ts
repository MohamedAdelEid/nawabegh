"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getTableQueryState,
  keepPreviousTableData,
} from "@/shared/application/lib/tableQueryState";

import { useLocale } from "next-intl";
import {
  DEFAULT_EXAMS_MANAGEMENT_FILTERS,
  type ExamsManagementFilterState,
} from "@/modules/admin/domain/types/examsManagementFilters.types";
import { getExamsDashboard } from "@/modules/admin/infrastructure/api/finalExamsApi";

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

function buildPages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 0) return [1];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);
  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

export function useExamsDashboard(initialPageSize = DEFAULT_PAGE_SIZE) {
  const locale = useLocale();
  const [filters, setFilters] = useState<ExamsManagementFilterState>(
    DEFAULT_EXAMS_MANAGEMENT_FILTERS,
  );
  const [pageNumber, setPageNumber] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [filters.search]);

  useEffect(() => {
    setPageNumber(1);
  }, [debouncedSearch, filters.courseId, filters.status]);

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch,
      courseId: filters.courseId,
      ...(filters.status !== "" ? { status: Number(filters.status) } : {}),
      quizType: 1 as const,
      pageNumber,
      pageSize: initialPageSize,
    }),
    [debouncedSearch, filters.courseId, filters.status, initialPageSize, pageNumber],
  );

  const query = useQuery({
    queryKey: ["admin-exams-dashboard", locale, queryParams],
    queryFn: () => getExamsDashboard(queryParams),
    placeholderData: keepPreviousTableData,
  });

  const dashboard = query.data?.data ?? null;
  const totalPages = dashboard?.pagination.totalPages ?? 1;

  useEffect(() => {
    if (dashboard && pageNumber > totalPages) {
      setPageNumber(totalPages);
    }
  }, [dashboard, pageNumber, totalPages]);

  const tableQueryState = getTableQueryState(query);
  return {
    filters,
    setFilters,
    pageNumber,
    setPageNumber,
    pages: buildPages(pageNumber, totalPages),
    dashboard,
    ...tableQueryState,
    errorMessage: query.data?.errorMessage,
    refetch: query.refetch,
  };
}
