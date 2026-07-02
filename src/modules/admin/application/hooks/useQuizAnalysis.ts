"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getTableQueryState,
  keepPreviousTableData,
} from "@/shared/application/lib/tableQueryState";

import { useLocale } from "next-intl";
import { QUESTION_SORT, SCORE_MODE, type ScoreMode } from "@/modules/admin/domain/types/resultsAnalytics.types";
import { getQuizAnalysis } from "@/modules/admin/infrastructure/api/resultsAnalyticsApi";

const DEFAULT_QUESTION_PAGE_SIZE = 10;

export const ADMIN_QUIZ_ANALYSIS_QUERY_KEY = "admin-quiz-analysis";

function buildPages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 0) return [1];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);
  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

export function useQuizAnalysis(
  quizId: string,
  options?: {
    scoreMode?: ScoreMode;
    schoolId?: string;
    questionSort?: number;
  },
) {
  const locale = useLocale();
  const [questionPageNumber, setQuestionPageNumber] = useState(1);
  const scoreMode = options?.scoreMode ?? SCORE_MODE.bestAttempt;
  const schoolId = options?.schoolId ?? "";
  const questionSort = options?.questionSort ?? QUESTION_SORT.hardestFirst;

  useEffect(() => {
    setQuestionPageNumber(1);
  }, [questionSort, scoreMode, schoolId, quizId]);

  const queryParams = useMemo(
    () => ({
      quizId,
      scoreMode,
      schoolId: schoolId || undefined,
      questionSort,
      questionPageNumber,
      questionPageSize: DEFAULT_QUESTION_PAGE_SIZE,
      topStudentsCount: 4,
    }),
    [questionPageNumber, questionSort, quizId, schoolId, scoreMode],
  );

  const query = useQuery({
    queryKey: [ADMIN_QUIZ_ANALYSIS_QUERY_KEY, locale, queryParams],
    queryFn: () => getQuizAnalysis(queryParams),
    enabled: Boolean(quizId),
    placeholderData: keepPreviousTableData,
  });

  const analysis = query.data?.data ?? null;
  const totalPages = analysis?.questionPagination.totalPages ?? 1;

  useEffect(() => {
    if (analysis && questionPageNumber > totalPages) {
      setQuestionPageNumber(totalPages);
    }
  }, [analysis, questionPageNumber, totalPages]);

  const tableQueryState = getTableQueryState(query);
  return {
    analysis,
    questionPageNumber,
    setQuestionPageNumber,
    questionPages: buildPages(questionPageNumber, totalPages),
    ...tableQueryState,
    errorMessage: query.data?.errorMessage,
    refetch: query.refetch,
  };
}
