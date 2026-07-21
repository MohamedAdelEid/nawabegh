"use client";

import { ShortQuizAttemptView } from "@/modules/student/presentation/components/short-quiz/ShortQuizAttemptView";

type StudentShortQuizAttemptPageProps = {
  stationId: string;
};

export function StudentShortQuizAttemptPage({ stationId }: StudentShortQuizAttemptPageProps) {
  return <ShortQuizAttemptView stationId={stationId} />;
}
