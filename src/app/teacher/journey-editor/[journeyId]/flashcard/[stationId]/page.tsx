import { AdminJourneyFlashcardGroupPage } from "@/modules/admin/presentation/pages/AdminJourneyFlashcardGroupPage";

interface Props {
  params: Promise<{ journeyId: string; stationId: string }>;
}

export default async function Page({ params }: Props) {
  const { journeyId, stationId } = await params;
  return <AdminJourneyFlashcardGroupPage journeyId={journeyId} stationId={stationId} />;
}
