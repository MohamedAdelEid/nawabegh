import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ShortQuizSkeleton } from "@/modules/student/presentation/components/short-quiz/ShortQuizSkeleton";
import { StudentShortQuizResultsPage } from "@/modules/student/presentation/pages/StudentShortQuizResultsPage";

type ShortQuizRouteParams = {
  params: Promise<{ stationId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.shortQuiz.page");
  return { title: t("resultsTitle") };
}

export default async function StudentShortQuizResultsRoute({
  params,
}: ShortQuizRouteParams) {
  const { stationId } = await params;
  return (
    <Suspense fallback={<ShortQuizSkeleton variant="results" />}>
      <StudentShortQuizResultsPage stationId={stationId} />
    </Suspense>
  );
}
