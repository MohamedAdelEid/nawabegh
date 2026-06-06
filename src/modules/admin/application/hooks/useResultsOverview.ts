"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import {
  DEFAULT_RESULTS_ANALYTICS_FILTERS,
  type ResultsAnalyticsFilterState,
} from "@/modules/admin/domain/types/resultsAnalyticsFilters.types";
import {
  filtersToOverviewParams,
  getResultsOverview,
} from "@/modules/admin/infrastructure/api/resultsAnalyticsApi";

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

export const ADMIN_RESULTS_OVERVIEW_QUERY_KEY = "admin-results-overview";

function buildPages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 0) return [1];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);
  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

export function useResultsOverview(pageSize = DEFAULT_PAGE_SIZE) {
  const locale = useLocale();
  const [filters, setFilters] = useState<ResultsAnalyticsFilterState>(
    DEFAULT_RESULTS_ANALYTICS_FILTERS,
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
  }, [debouncedSearch, filters.quizId, filters.schoolId, filters.scoreMode]);

  const queryParams = useMemo(
    () => filtersToOverviewParams(filters, debouncedSearch, pageNumber, pageSize),
    [debouncedSearch, filters, pageNumber, pageSize],
  );

  const query = useQuery({
    queryKey: [ADMIN_RESULTS_OVERVIEW_QUERY_KEY, locale, queryParams],
    queryFn: () => getResultsOverview(queryParams),
  });

  const page = query.data?.data ?? null;
  const totalPages = page?.totalPages ?? 1;

  useEffect(() => {
    if (page && pageNumber > totalPages) {
      setPageNumber(totalPages);
    }
  }, [page, pageNumber, totalPages]);

  return {
    filters,
    setFilters,
    pageNumber,
    setPageNumber,
    pages: buildPages(pageNumber, totalPages),
    page,
    isLoading: query.isLoading || query.isFetching,
    errorMessage: query.data?.errorMessage,
    refetch: query.refetch,
  };
}
