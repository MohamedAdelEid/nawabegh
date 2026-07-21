import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ShortQuizSkeleton } from "@/modules/student/presentation/components/short-quiz/ShortQuizSkeleton";
import { StudentShortQuizInstructionsPage } from "@/modules/student/presentation/pages/StudentShortQuizInstructionsPage";

type ShortQuizRouteParams = {
  params: Promise<{ stationId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.shortQuiz.page");
  return { title: t("instructionsTitle") };
}

export default async function StudentShortQuizInstructionsRoute({
  params,
}: ShortQuizRouteParams) {
  const { stationId } = await params;
  return (
    <Suspense fallback={<ShortQuizSkeleton variant="instructions" />}>
      <StudentShortQuizInstructionsPage stationId={stationId} />
    </Suspense>
  );
}
