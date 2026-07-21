import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ShortQuizSkeleton } from "@/modules/student/presentation/components/short-quiz/ShortQuizSkeleton";
import { StudentShortQuizReviewDetailPage } from "@/modules/student/presentation/pages/StudentShortQuizReviewDetailPage";

type ShortQuizReviewDetailRouteParams = {
  params: Promise<{ stationId: string; questionIndex: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.shortQuiz.page");
  return { title: t("reviewTitle") };
}

export default async function StudentShortQuizReviewDetailRoute({
  params,
}: ShortQuizReviewDetailRouteParams) {
  const { stationId, questionIndex } = await params;
  const index = Number.parseInt(questionIndex, 10);

  return (
    <Suspense fallback={<ShortQuizSkeleton variant="review" />}>
      <StudentShortQuizReviewDetailPage
        stationId={stationId}
        questionIndex={Number.isFinite(index) ? index : 0}
      />
    </Suspense>
  );
}
