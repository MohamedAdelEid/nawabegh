"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getTableQueryState,
  keepPreviousTableData,
} from "@/shared/application/lib/tableQueryState";

import { useLocale } from "next-intl";
import {
  DEFAULT_GRADES_FILTERS,
  type GradesFilterState,
} from "@/modules/admin/domain/types/curriculumManagementFilters.types";
import { getGrades } from "@/modules/admin/infrastructure/api/gradesApi";

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

function buildPages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 0) return [1];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);
  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

export function useGradesTable() {
  const locale = useLocale();
  const [filters, setFilters] = useState<GradesFilterState>(DEFAULT_GRADES_FILTERS);
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
  }, [debouncedKeyword, filters.countryId, filters.educationLevelId]);

  const queryParams = useMemo(
    () => ({
      ...(filters.countryId !== "all" ? { countryId: Number(filters.countryId) } : {}),
      ...(filters.educationLevelId !== "all"
        ? { educationLevelId: Number(filters.educationLevelId) }
        : {}),
      ...(debouncedKeyword ? { keyword: debouncedKeyword } : {}),
      pageNumber,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    [debouncedKeyword, filters.countryId, filters.educationLevelId, pageNumber],
  );

  const query = useQuery({
    queryKey: ["admin-grades-table", locale, queryParams],
    queryFn: () => getGrades(queryParams),
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
    filters,
    setFilters,
    pageNumber,
    setPageNumber,
    pages: buildPages(pageNumber, totalPages),
    data: query.data,
    page,
    ...tableQueryState,
    refetch: query.refetch,
  };
}
