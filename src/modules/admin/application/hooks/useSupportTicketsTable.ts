"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import {
  DEFAULT_SUPPORT_TICKETS_FILTERS,
  type SupportTicketsFilterState,
} from "@/modules/admin/domain/types/supportTicketsFilters.types";
import {
  filtersToQueryParams,
  getSupportTickets,
} from "@/modules/admin/infrastructure/api/supportTicketsApi";

const DEFAULT_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

export const ADMIN_SUPPORT_TICKETS_TABLE_QUERY_KEY = "admin-support-tickets-table";

function buildPages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 0) return [1];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);
  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

export function useSupportTicketsTable() {
  const locale = useLocale();
  const [filters, setFilters] = useState<SupportTicketsFilterState>(DEFAULT_SUPPORT_TICKETS_FILTERS);
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
  }, [debouncedSearch, filters.status, filters.priority]);

  const queryParams = useMemo(
    () => ({
      ...filtersToQueryParams(filters, debouncedSearch),
      pageNumber,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    [debouncedSearch, filters.priority, filters.status, pageNumber],
  );

  const query = useQuery({
    queryKey: [ADMIN_SUPPORT_TICKETS_TABLE_QUERY_KEY, locale, queryParams],
    queryFn: () => getSupportTickets(queryParams),
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
    data: query.data,
    page,
    isLoading: query.isLoading || query.isFetching,
    refetch: query.refetch,
  };
}
