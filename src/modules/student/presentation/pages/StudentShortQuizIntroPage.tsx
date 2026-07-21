"use client";

import { ShortQuizIntroView } from "@/modules/student/presentation/components/short-quiz/ShortQuizIntroView";

type StudentShortQuizIntroPageProps = {
  stationId: string;
};

export function StudentShortQuizIntroPage({ stationId }: StudentShortQuizIntroPageProps) {
  return <ShortQuizIntroView stationId={stationId} theme="navy" />;
}
