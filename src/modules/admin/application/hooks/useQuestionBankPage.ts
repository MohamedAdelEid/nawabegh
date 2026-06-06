"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import {
  getQuestionBankEnums,
  getQuestionBankPage,
  getQuestionBankSummary,
} from "@/modules/admin/infrastructure/api/questionBankApi";

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

export const STATIC_SUBJECT_OPTIONS = [
  { id: "all", translationKey: "questionBank.filters.subject.all", subjectId: undefined },
  { id: "arabic", translationKey: "questionBank.filters.subject.arabic", subjectId: 1 },
  { id: "math", translationKey: "questionBank.filters.subject.math", subjectId: 3 },
  { id: "science", translationKey: "questionBank.filters.subject.science", subjectId: 2 },
] as const;

type SubjectFilterId = (typeof STATIC_SUBJECT_OPTIONS)[number]["id"];

type QuestionBankFilters = {
  status: string;
  difficultyLevel: string;
  subject: SubjectFilterId;
  titleQuery: string;
};

const INITIAL_FILTERS: QuestionBankFilters = {
  status: "all",
  difficultyLevel: "all",
  subject: "all",
  titleQuery: "",
};

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

export function useQuestionBankPage() {
  const locale = useLocale();
  const [pageNumber, setPageNumber] = useState(1);
  const [filters, setFilters] = useState<QuestionBankFilters>(INITIAL_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.titleQuery);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(filters.titleQuery.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [filters.titleQuery]);

  useEffect(() => {
    setPageNumber(1);
  }, [filters.status, filters.difficultyLevel, filters.subject, debouncedSearch]);

  const enumsQuery = useQuery({
    queryKey: ["admin-question-bank-enums", locale],
    queryFn: getQuestionBankEnums,
  });

  const summaryQuery = useQuery({
    queryKey: ["admin-question-bank-summary", locale],
    queryFn: getQuestionBankSummary,
  });

  const listQuery = useQuery({
    queryKey: [
      "admin-question-bank-page",
      locale,
      filters.status,
      filters.difficultyLevel,
      filters.subject,
      debouncedSearch,
      pageNumber,
      DEFAULT_PAGE_SIZE,
    ],
    queryFn: () =>
      getQuestionBankPage({
        keyword: debouncedSearch || undefined,
        pageNumber,
        pageSize: DEFAULT_PAGE_SIZE,
        ...(filters.subject !== "all"
          ? {
              subjectId:
                STATIC_SUBJECT_OPTIONS.find((subject) => subject.id === filters.subject)?.subjectId,
            }
          : {}),
        ...(filters.difficultyLevel !== "all"
          ? { difficulty: Number(filters.difficultyLevel) }
          : {}),
        ...(filters.status !== "all" ? { status: Number(filters.status) } : {}),
      }),
    placeholderData: (previousData) => previousData,
  });

  const page = listQuery.data?.data ?? null;
  const totalPages = page?.totalPages ?? 1;
  const currentPage = page?.currentPage ?? pageNumber;

  useEffect(() => {
    if (page && pageNumber > totalPages) {
      setPageNumber(totalPages);
    }
  }, [page, pageNumber, totalPages]);

  const pages = useMemo(
    () => buildPages(currentPage, totalPages),
    [currentPage, totalPages],
  );

  return {
    filters,
    setFilters,
    pageNumber,
    setPageNumber,
    pageSize: DEFAULT_PAGE_SIZE,
    pages,
    enumsQuery,
    summaryQuery,
    listQuery,
    page,
  };
}
