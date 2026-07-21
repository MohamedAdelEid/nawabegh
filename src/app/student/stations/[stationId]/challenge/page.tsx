import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ChallengeStationSkeleton } from "@/modules/student/presentation/components/challenge-station/ChallengeStationSkeleton";
import { StudentChallengeStationPage } from "@/modules/student/presentation/pages/StudentChallengeStationPage";

type ChallengeStationRouteParams = {
  params: Promise<{ stationId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.challengeStation.page");
  return { title: t("title") };
}

export default async function StudentChallengeStationRoute({
  params,
}: ChallengeStationRouteParams) {
  const { stationId } = await params;

  return (
    <Suspense fallback={<ChallengeStationSkeleton variant="modes" />}>
      <StudentChallengeStationPage stationId={stationId} />
    </Suspense>
  );
}
