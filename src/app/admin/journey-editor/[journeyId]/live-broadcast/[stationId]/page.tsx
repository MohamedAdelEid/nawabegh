import { AdminJourneyLiveBroadcastViewPage } from "@/modules/admin/presentation/pages/AdminJourneyLiveBroadcastViewPage";

interface Props {
  params: Promise<{ journeyId: string; stationId: string }>;
}

export default async function Page({ params }: Props) {
  const { journeyId, stationId } = await params;
  return <AdminJourneyLiveBroadcastViewPage journeyId={journeyId} stationId={stationId} />;
}
