"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getTableQueryState,
  keepPreviousTableData,
} from "@/shared/application/lib/tableQueryState";

import { useLocale } from "next-intl";
import { getSchools } from "@/modules/admin/infrastructure/api/schoolApi";
import {
  DEFAULT_SCHOOL_MANAGEMENT_FILTERS,
  type SchoolManagementFilterState,
} from "@/modules/admin/domain/types/schoolManagementFilters.types";

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

function buildPages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 0) return [1];

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);

  return Array.from(
    { length: end - adjustedStart + 1 },
    (_, index) => adjustedStart + index,
  );
}

function parsePointsFilter(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function useSchoolsTable() {
  const locale = useLocale();
  const [filters, setFilters] = useState<SchoolManagementFilterState>(
    DEFAULT_SCHOOL_MANAGEMENT_FILTERS,
  );
  const [pageNumber, setPageNumber] = useState(1);
  const [debouncedKeyword, setDebouncedKeyword] = useState(filters.keyword);
  const [debouncedCity, setDebouncedCity] = useState(filters.city);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedKeyword(filters.keyword.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [filters.keyword]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedCity(filters.city.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [filters.city]);

  useEffect(() => {
    setPageNumber(1);
  }, [
    debouncedKeyword,
    debouncedCity,
    filters.country,
    filters.points,
    filters.performanceLevel,
  ]);

  const queryParams = useMemo(
    () => ({
      keyword: debouncedKeyword || undefined,
      city: debouncedCity || undefined,
      country: filters.country.trim() || undefined,
      points: parsePointsFilter(filters.points),
      performanceLevel:
        filters.performanceLevel === "all" ? undefined : filters.performanceLevel,
      pageNumber,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    [
      debouncedKeyword,
      debouncedCity,
      filters.country,
      filters.points,
      filters.performanceLevel,
      pageNumber,
    ],
  );

  const query = useQuery({
    queryKey: ["admin-school-table", locale, queryParams],
    queryFn: () => getSchools(queryParams),
    placeholderData: keepPreviousTableData,
  });

  const page = query.data?.page ?? null;
  const totalPages = page?.totalPages ?? 1;

  useEffect(() => {
    if (page && pageNumber > totalPages) {
      setPageNumber(totalPages);
    }
  }, [page, pageNumber, totalPages]);

  const pages = useMemo(
    () => buildPages(page?.currentPage ?? pageNumber, totalPages),
    [page?.currentPage, pageNumber, totalPages],
  );

  const tableQueryState = getTableQueryState(query);

  return {
    ...query,
    ...tableQueryState,
    page,
    pageNumber,
    pageSize: DEFAULT_PAGE_SIZE,
    setPageNumber,
    pages,
    filters,
    setFilters,
  };
}
