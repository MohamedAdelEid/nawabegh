"use client";

import { ShortQuizInstructionsView } from "@/modules/student/presentation/components/short-quiz/ShortQuizInstructionsView";

type StudentShortQuizInstructionsPageProps = {
  stationId: string;
};

export function StudentShortQuizInstructionsPage({
  stationId,
}: StudentShortQuizInstructionsPageProps) {
  return <ShortQuizInstructionsView stationId={stationId} />;
}
