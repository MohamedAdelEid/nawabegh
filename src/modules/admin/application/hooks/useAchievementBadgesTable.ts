"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import {
  DEFAULT_ACHIEVEMENT_BADGE_FILTERS,
  type AchievementBadgeFilterState,
} from "@/modules/admin/domain/types/achievementBadgesFilters.types";
import type { AchievementBadgeRow } from "@/modules/admin/domain/types/achievementBadges.types";
import { getAchievementBadges } from "@/modules/admin/infrastructure/api/achievementBadgesApi";

const DEFAULT_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

export const ADMIN_ACHIEVEMENT_BADGES_TABLE_QUERY_KEY = "admin-achievement-badges-table";

function buildPages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 0) return [1];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);
  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

function filtersToIncludeInactive(status: AchievementBadgeFilterState["status"]): boolean {
  return status !== "active";
}

function filterRows(rows: AchievementBadgeRow[], filters: AchievementBadgeFilterState): AchievementBadgeRow[] {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((row) => {
    if (filters.status === "inactive" && row.isActive) return false;
    if (filters.status === "active" && !row.isActive) return false;
    if (!keyword) return true;
    return (
      row.name.toLowerCase().includes(keyword) ||
      row.description.toLowerCase().includes(keyword)
    );
  });
}

export function useAchievementBadgesTable() {
  const locale = useLocale();
  const [filters, setFilters] = useState<AchievementBadgeFilterState>(
    DEFAULT_ACHIEVEMENT_BADGE_FILTERS,
  );
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
  }, [debouncedKeyword, filters.status]);

  const queryParams = useMemo(
    () => ({
      includeInactive: filtersToIncludeInactive(filters.status),
      pageNumber,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    [filters.status, pageNumber],
  );

  const query = useQuery({
    queryKey: [ADMIN_ACHIEVEMENT_BADGES_TABLE_QUERY_KEY, locale, queryParams],
    queryFn: () => getAchievementBadges(queryParams),
  });

  const rawPage = query.data?.data ?? null;
  const filteredRows = useMemo(() => {
    if (!rawPage) return null;
    const rows = filterRows(rawPage.rows, { ...filters, keyword: debouncedKeyword });
    return { ...rawPage, rows };
  }, [debouncedKeyword, filters, rawPage]);

  const page = filteredRows;
  const totalPages = rawPage?.totalPages ?? 1;

  useEffect(() => {
    if (pageNumber > totalPages) {
      setPageNumber(Math.max(1, totalPages));
    }
  }, [pageNumber, totalPages]);

  return {
    filters,
    setFilters,
    pageNumber,
    setPageNumber,
    pages: buildPages(pageNumber, totalPages),
    data: query.data,
    page,
    rawPage,
    isLoading: query.isLoading || query.isFetching,
    refetch: query.refetch,
  };
}
