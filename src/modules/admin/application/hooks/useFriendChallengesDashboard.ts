"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getTableQueryState,
  keepPreviousTableData,
} from "@/shared/application/lib/tableQueryState";

import { useLocale } from "next-intl";
import {
  DEFAULT_FRIEND_CHALLENGES_FILTERS,
  type FriendChallengesFilterState,
} from "@/modules/admin/domain/types/friendChallengesFilters.types";
import {
  filtersToDashboardParams,
  getFriendChallengesDashboard,
} from "@/modules/admin/infrastructure/api/friendChallengesApi";

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

export const ADMIN_FRIEND_CHALLENGES_DASHBOARD_QUERY_KEY = "admin-friend-challenges-dashboard";

function buildPages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 0) return [1];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);
  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

export function useFriendChallengesDashboard(pageSize = DEFAULT_PAGE_SIZE) {
  const locale = useLocale();
  const [filters, setFilters] = useState<FriendChallengesFilterState>(
    DEFAULT_FRIEND_CHALLENGES_FILTERS,
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
  }, [
    debouncedSearch,
    filters.difficulty,
    filters.subjectId,
    filters.fromDate,
    filters.toDate,
    filters.status,
  ]);

  const queryParams = useMemo(
    () => filtersToDashboardParams(filters, debouncedSearch, pageNumber, pageSize),
    [debouncedSearch, filters, pageNumber, pageSize],
  );

  const query = useQuery({
    queryKey: [ADMIN_FRIEND_CHALLENGES_DASHBOARD_QUERY_KEY, locale, queryParams],
    queryFn: () => getFriendChallengesDashboard(queryParams),
    placeholderData: keepPreviousTableData,
  });

  const data = query.data?.data ?? null;
  const totalPages = data?.challenges.totalPages ?? 1;

  useEffect(() => {
    if (data && pageNumber > totalPages) {
      setPageNumber(totalPages);
    }
  }, [data, pageNumber, totalPages]);

  const tableQueryState = getTableQueryState(query);
  return {
    filters,
    setFilters,
    pageNumber,
    setPageNumber,
    pages: buildPages(pageNumber, totalPages),
    data,
    ...tableQueryState,
    errorMessage: query.data?.errorMessage,
    refetch: query.refetch,
  };
}
