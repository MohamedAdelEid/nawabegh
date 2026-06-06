import { SCORE_MODE, type ScoreMode } from "@/modules/admin/domain/types/resultsAnalytics.types";

export type ResultsAnalyticsFilterState = {
  search: string;
  quizId: string;
  schoolId: string;
  scoreMode: ScoreMode;
};

export const DEFAULT_RESULTS_ANALYTICS_FILTERS: ResultsAnalyticsFilterState = {
  search: "",
  quizId: "",
  schoolId: "",
  scoreMode: SCORE_MODE.bestAttempt,
};
