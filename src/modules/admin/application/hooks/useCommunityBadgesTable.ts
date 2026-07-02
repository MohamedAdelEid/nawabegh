"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getTableQueryState,
  keepPreviousTableData,
} from "@/shared/application/lib/tableQueryState";

import { useLocale } from "next-intl";
import type { CommunityBadgeRow } from "@/modules/admin/domain/types/communityBadges.types";
import { getCommunityBadgesPage } from "@/modules/admin/infrastructure/api/communityBadgesApi";

const DEFAULT_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

export const ADMIN_COMMUNITY_BADGES_TABLE_QUERY_KEY = "admin-community-badges-table";

export type CommunityBadgeFilterState = {
  keyword: string;
};

export const DEFAULT_COMMUNITY_BADGE_FILTERS: CommunityBadgeFilterState = {
  keyword: "",
};

function buildPages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 0) return [1];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);
  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

function filterRows(rows: CommunityBadgeRow[], keyword: string): CommunityBadgeRow[] {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) return rows;
  return rows.filter(
    (row) =>
      row.name.toLowerCase().includes(normalized) ||
      row.description.toLowerCase().includes(normalized),
  );
}

type UseCommunityBadgesTableOptions = {
  pageSize?: number;
  enabled?: boolean;
};

export function useCommunityBadgesTable(options: UseCommunityBadgesTableOptions = {}) {
  const locale = useLocale();
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
  const [filters, setFilters] = useState<CommunityBadgeFilterState>(DEFAULT_COMMUNITY_BADGE_FILTERS);
  const [pageNumber, setPageNumber] = useState(1);
  const [debouncedKeyword, setDebouncedKeyword] = useState(filters.keyword);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedKeyword(filters.keyword.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [filters.keyword]);

  useEffect(() => {
    setPageNumber(1);
  }, [debouncedKeyword]);

  const queryParams = useMemo(
    () => ({
      pageNumber,
      pageSize,
      keyword: debouncedKeyword,
    }),
    [debouncedKeyword, pageNumber, pageSize],
  );

  const query = useQuery({
    queryKey: [ADMIN_COMMUNITY_BADGES_TABLE_QUERY_KEY, locale, queryParams],
    queryFn: () => getCommunityBadgesPage(queryParams),
    enabled: options.enabled ?? true,
    placeholderData: keepPreviousTableData,
  });

  const rawPage = query.data?.data ?? null;
  const filteredRows = useMemo(() => {
    if (!rawPage) return null;
    const rows = filterRows(rawPage.rows, debouncedKeyword);
    return { ...rawPage, rows };
  }, [debouncedKeyword, rawPage]);

  const page = filteredRows;
  const totalPages = rawPage?.totalPages ?? 1;

  useEffect(() => {
    if (pageNumber > totalPages) {
      setPageNumber(Math.max(1, totalPages));
    }
  }, [pageNumber, totalPages]);

  const tableQueryState = getTableQueryState(query);
  return {
    filters,
    setFilters,
    pageNumber,
    setPageNumber,
    pages: buildPages(pageNumber, totalPages),
    data: query.data,
    page,
    rawPage,
    ...tableQueryState,
    isError: query.isError,
    errorMessage: query.data?.errorMessage,
    refetch: query.refetch,
  };
}
