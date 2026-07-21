"use client";

import { FlashcardsStationDashboard } from "@/modules/student/presentation/components/flashcards-station/FlashcardsStationDashboard";

type StudentFlashcardsStationPageProps = {
  stationId: string;
};

export function StudentFlashcardsStationPage({
  stationId,
}: StudentFlashcardsStationPageProps) {
  return <FlashcardsStationDashboard stationId={stationId} />;
}
