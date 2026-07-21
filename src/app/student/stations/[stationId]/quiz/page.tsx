import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ShortQuizSkeleton } from "@/modules/student/presentation/components/short-quiz/ShortQuizSkeleton";
import { StudentShortQuizIntroPage } from "@/modules/student/presentation/pages/StudentShortQuizIntroPage";

type ShortQuizRouteParams = {
  params: Promise<{ stationId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.shortQuiz.page");
  return { title: t("title") };
}

export default async function StudentShortQuizIntroRoute({ params }: ShortQuizRouteParams) {
  const { stationId } = await params;
  return (
    <Suspense fallback={<ShortQuizSkeleton variant="intro" />}>
      <StudentShortQuizIntroPage stationId={stationId} />
    </Suspense>
  );
}
