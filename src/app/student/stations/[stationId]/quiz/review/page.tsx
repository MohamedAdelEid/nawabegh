import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ShortQuizSkeleton } from "@/modules/student/presentation/components/short-quiz/ShortQuizSkeleton";
import { StudentShortQuizReviewPage } from "@/modules/student/presentation/pages/StudentShortQuizReviewPage";

type ShortQuizRouteParams = {
  params: Promise<{ stationId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.shortQuiz.page");
  return { title: t("reviewTitle") };
}

export default async function StudentShortQuizReviewRoute({
  params,
}: ShortQuizRouteParams) {
  const { stationId } = await params;
  return (
    <Suspense fallback={<ShortQuizSkeleton variant="review" />}>
      <StudentShortQuizReviewPage stationId={stationId} />
    </Suspense>
  );
}
