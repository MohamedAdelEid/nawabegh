"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import {
  DEFAULT_EDUCATION_LEVELS_FILTERS,
  type EducationLevelsFilterState,
} from "@/modules/admin/domain/types/curriculumManagementFilters.types";
import { getEducationLevels } from "@/modules/admin/infrastructure/api/educationLevelsApi";

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

function buildPages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 0) return [1];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);
  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

export function useEducationLevelsTable() {
  const locale = useLocale();
  const [filters, setFilters] = useState<EducationLevelsFilterState>(
    DEFAULT_EDUCATION_LEVELS_FILTERS,
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
  }, [debouncedKeyword, filters.countryId]);

  const queryParams = useMemo(
    () => ({
      ...(filters.countryId !== "all" ? { countryId: Number(filters.countryId) } : {}),
      ...(debouncedKeyword ? { keyword: debouncedKeyword } : {}),
      pageNumber,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    [debouncedKeyword, filters.countryId, pageNumber],
  );

  const query = useQuery({
    queryKey: ["admin-education-levels-table", locale, queryParams],
    queryFn: () => getEducationLevels(queryParams),
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
