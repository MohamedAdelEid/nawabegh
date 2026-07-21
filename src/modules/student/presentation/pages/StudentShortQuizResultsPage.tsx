"use client";

import { ShortQuizResultsView } from "@/modules/student/presentation/components/short-quiz/ShortQuizResultsView";

type StudentShortQuizResultsPageProps = {
  stationId: string;
};

export function StudentShortQuizResultsPage({ stationId }: StudentShortQuizResultsPageProps) {
  return <ShortQuizResultsView stationId={stationId} />;
}
