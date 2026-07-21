import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ChallengeStationSkeleton } from "@/modules/student/presentation/components/challenge-station/ChallengeStationSkeleton";
import { StudentChallengeHubPage } from "@/modules/student/presentation/pages/StudentChallengeHubPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.challengeStation.page");
  return { title: t("hubTitle") };
}

export default function StudentChallengeHubRoute() {
  return (
    <Suspense fallback={<ChallengeStationSkeleton variant="hub" />}>
      <StudentChallengeHubPage />
    </Suspense>
  );
}
