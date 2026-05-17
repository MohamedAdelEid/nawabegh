import { AdminJourneyFlashcardAddPage } from "@/modules/admin/presentation/pages/AdminJourneyFlashcardAddPage";

interface Props {
  params: Promise<{ journeyId: string; stationId: string }>;
}

export default async function Page({ params }: Props) {
  const { journeyId, stationId } = await params;
  return <AdminJourneyFlashcardAddPage journeyId={journeyId} stationId={stationId} />;
}
