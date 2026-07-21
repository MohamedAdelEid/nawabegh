import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ShortQuizSkeleton } from "@/modules/student/presentation/components/short-quiz/ShortQuizSkeleton";
import { StudentShortQuizAttemptPage } from "@/modules/student/presentation/pages/StudentShortQuizAttemptPage";

type ShortQuizRouteParams = {
  params: Promise<{ stationId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.shortQuiz.page");
  return { title: t("attemptTitle") };
}

export default async function StudentShortQuizAttemptRoute({
  params,
}: ShortQuizRouteParams) {
  const { stationId } = await params;
  return (
    <Suspense fallback={<ShortQuizSkeleton variant="attempt" />}>
      <StudentShortQuizAttemptPage stationId={stationId} />
    </Suspense>
  );
}
