"use client";

import { QuizAnalysisDashboard } from "@/modules/admin/presentation/components/results-analytics";

export function AdminQuizAnalysisPage({ quizId }: { quizId: string }) {
  return <QuizAnalysisDashboard quizId={quizId} />;
}
