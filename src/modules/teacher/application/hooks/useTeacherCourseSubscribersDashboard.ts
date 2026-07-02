"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getTableQueryState,
  keepPreviousTableData,
} from "@/shared/application/lib/tableQueryState";

import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";

const DEFAULT_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

function buildPages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 0) return [1];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);
  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

export function useTeacherCourseSubscribersDashboard(
  courseId: string,
  pageSize = DEFAULT_PAGE_SIZE,
) {
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [keyword]);

  useEffect(() => {
    setPageNumber(1);
  }, [debouncedKeyword]);

  const query = useQuery({
    queryKey: ["teacher", "course", courseId, "subscribers", debouncedKeyword, pageNumber, pageSize],
    queryFn: () =>
      teacherApi.getCourseSubscribers(courseId, {
        keyword: debouncedKeyword,
        pageNumber,
        pageSize,
      }),
    enabled: Boolean(courseId),
    placeholderData: keepPreviousTableData,
  });

  const data = query.data ?? null;
  const totalPages = data?.students.totalPages ?? 1;

  useEffect(() => {
    if (data && pageNumber > totalPages) {
      setPageNumber(totalPages);
    }
  }, [data, pageNumber, totalPages]);

  const resetFilters = () => {
    setKeyword("");
    setDebouncedKeyword("");
    setPageNumber(1);
  };

  const tableQueryState = getTableQueryState(query);
  return {
    keyword,
    setKeyword,
    pageNumber,
    setPageNumber,
    pages: useMemo(() => buildPages(pageNumber, totalPages), [pageNumber, totalPages]),
    data,
    ...tableQueryState,
    isError: query.isError,
    resetFilters,
    refetch: query.refetch,
  };
}
