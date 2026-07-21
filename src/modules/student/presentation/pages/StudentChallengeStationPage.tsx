"use client";

import { ChallengeStationDashboard } from "@/modules/student/presentation/components/challenge-station/ChallengeStationDashboard";

type StudentChallengeStationPageProps = {
  stationId: string;
};

export function StudentChallengeStationPage({
  stationId,
}: StudentChallengeStationPageProps) {
  return <ChallengeStationDashboard stationId={stationId} />;
}
