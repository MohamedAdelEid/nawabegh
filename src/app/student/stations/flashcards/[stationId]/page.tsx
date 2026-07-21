import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FlashcardsStationSkeleton } from "@/modules/student/presentation/components/flashcards-station/FlashcardsStationSkeleton";
import { StudentFlashcardsStationPage } from "@/modules/student/presentation/pages/StudentFlashcardsStationPage";

type FlashcardsStationRouteParams = {
  params: Promise<{ stationId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.flashcardsStation.page");
  return { title: t("title") };
}

export default async function StudentFlashcardsStationRoute({
  params,
}: FlashcardsStationRouteParams) {
  const { stationId } = await params;

  return (
    <Suspense fallback={<FlashcardsStationSkeleton />}>
      <StudentFlashcardsStationPage stationId={stationId} />
    </Suspense>
  );
}
