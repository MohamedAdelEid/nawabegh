"use client";

import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useQueries, useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import {
  getQuestionBankEnums,
  getQuestionBankPage,
  getQuestionBankQuestionById,
  getQuestionBankSummary,
  type QuestionBankApiResult,
  type QuestionBankListPage,
  type QuestionBankListRow,
  type QuestionBankQuestionDetail,
} from "@/modules/admin/infrastructure/api/questionBankApi";
import { STATIC_SUBJECT_OPTIONS } from "@/modules/admin/application/hooks/useQuestionBankPage";

const DEFAULT_PAGE_SIZE = 5;
const SEARCH_DEBOUNCE_MS = 350;
const DETAIL_STALE_TIME_MS = 5 * 60 * 1000;

type SubjectFilterId = (typeof STATIC_SUBJECT_OPTIONS)[number]["id"];

export type QuestionBankInfiniteFilters = {
  status: string;
  difficultyLevel: string;
  subject: SubjectFilterId;
  titleQuery: string;
};

const INITIAL_FILTERS: QuestionBankInfiniteFilters = {
  status: "all",
  difficultyLevel: "all",
  subject: "all",
  titleQuery: "",
};

export type QuestionBankInfiniteItem = {
  id: string;
  listRow: QuestionBankListRow;
  detail: QuestionBankQuestionDetail | null;
  isDetailLoading: boolean;
  isDetailError: boolean;
};

interface UseQuestionBankInfiniteListOptions {
  pageSize?: number;
}

export function useQuestionBankInfiniteList({
  pageSize = DEFAULT_PAGE_SIZE,
}: UseQuestionBankInfiniteListOptions = {}) {
  const locale = useLocale();
  const [filters, setFilters] = useState<QuestionBankInfiniteFilters>(INITIAL_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.titleQuery);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(filters.titleQuery.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [filters.titleQuery]);

  // Shared queries — same keys as `useQuestionBankPage` so react-query dedupes the network calls.
  const enumsQuery = useQuery({
    queryKey: ["admin-question-bank-enums", locale],
    queryFn: getQuestionBankEnums,
  });

  const summaryQuery = useQuery({
    queryKey: ["admin-question-bank-summary", locale],
    queryFn: getQuestionBankSummary,
  });

  const subjectId = useMemo(
    () =>
      STATIC_SUBJECT_OPTIONS.find((subject) => subject.id === filters.subject)?.subjectId,
    [filters.subject],
  );

  const listQuery = useInfiniteQuery<QuestionBankApiResult<QuestionBankListPage>>({
    queryKey: [
      "admin-question-bank-infinite",
      locale,
      filters.status,
      filters.difficultyLevel,
      filters.subject,
      debouncedSearch,
      pageSize,
    ],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getQuestionBankPage({
        keyword: debouncedSearch || undefined,
        pageNumber: pageParam as number,
        pageSize,
        ...(subjectId !== undefined ? { subjectId } : {}),
        ...(filters.difficultyLevel !== "all"
          ? { difficulty: Number(filters.difficultyLevel) }
          : {}),
        ...(filters.status !== "all" ? { status: Number(filters.status) } : {}),
      }),
    getNextPageParam: (lastPage) => {
      const data = lastPage.data;
      if (!data) return undefined;
      const next = data.currentPage + 1;
      return next <= data.totalPages ? next : undefined;
    },
  });

  // Flatten loaded pages into the ordered list of IDs.
  const orderedRows: QuestionBankListRow[] = useMemo(() => {
    const seen = new Set<string>();
    const rows: QuestionBankListRow[] = [];
    for (const page of listQuery.data?.pages ?? []) {
      for (const row of page.data?.rows ?? []) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        rows.push(row);
      }
    }
    return rows;
  }, [listQuery.data?.pages]);

  // Per-id detail fetches; each query is cached individually so navigating away & back stays cheap.
  const detailQueries = useQueries({
    queries: orderedRows.map((row) => ({
      queryKey: ["admin-question-bank-detail", row.id, locale],
      queryFn: () => getQuestionBankQuestionById(row.id),
      staleTime: DETAIL_STALE_TIME_MS,
    })),
  });

  const items: QuestionBankInfiniteItem[] = useMemo(
    () =>
      orderedRows.map((row, index) => {
        const query = detailQueries[index];
        return {
          id: row.id,
          listRow: row,
          detail: query?.data?.data ?? null,
          isDetailLoading: Boolean(query?.isLoading),
          isDetailError: Boolean(query?.error || query?.data?.errorMessage),
        };
      }),
    [orderedRows, detailQueries],
  );

  const totalItems = listQuery.data?.pages?.[0]?.data?.totalItems ?? items.length;
  const isInitialLoading = listQuery.isLoading;
  const isListError = Boolean(listQuery.error);

  const resetFilters = () => setFilters(INITIAL_FILTERS);

  return {
    filters,
    setFilters,
    resetFilters,
    enumsQuery,
    summaryQuery,
    listQuery,
    items,
    totalItems,
    isInitialLoading,
    isListError,
    hasNextPage: Boolean(listQuery.hasNextPage),
    isFetchingNextPage: listQuery.isFetchingNextPage,
    fetchNextPage: listQuery.fetchNextPage,
    refetch: listQuery.refetch,
  };
}
