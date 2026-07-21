"use client";

import { ShortQuizReviewDetailView } from "@/modules/student/presentation/components/short-quiz/ShortQuizReviewDetailView";

type StudentShortQuizReviewDetailPageProps = {
  stationId: string;
  questionIndex: number;
};

export function StudentShortQuizReviewDetailPage({
  stationId,
  questionIndex,
}: StudentShortQuizReviewDetailPageProps) {
  return (
    <ShortQuizReviewDetailView stationId={stationId} questionIndex={questionIndex} />
  );
}
