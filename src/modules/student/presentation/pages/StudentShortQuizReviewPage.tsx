"use client";

import { ShortQuizReviewListView } from "@/modules/student/presentation/components/short-quiz/ShortQuizReviewListView";

type StudentShortQuizReviewPageProps = {
  stationId: string;
};

export function StudentShortQuizReviewPage({ stationId }: StudentShortQuizReviewPageProps) {
  return <ShortQuizReviewListView stationId={stationId} />;
}
