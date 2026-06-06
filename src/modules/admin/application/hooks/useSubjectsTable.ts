"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import {
  DEFAULT_SUBJECTS_FILTERS,
  type SubjectsFilterState,
} from "@/modules/admin/domain/types/curriculumManagementFilters.types";
import { getSubjectsPage } from "@/modules/admin/infrastructure/api/subjectApi";

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

function buildPages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 0) return [1];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);
  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

export function useSubjectsTable() {
  const locale = useLocale();
  const [filters, setFilters] = useState<SubjectsFilterState>(DEFAULT_SUBJECTS_FILTERS);
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
      ...(debouncedKeyword ? { keyword: debouncedKeyword } : {}),
      pageNumber,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    [debouncedKeyword, pageNumber],
  );

  const query = useQuery({
    queryKey: ["admin-subjects-table", locale, queryParams],
    queryFn: () => getSubjectsPage(queryParams),
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
