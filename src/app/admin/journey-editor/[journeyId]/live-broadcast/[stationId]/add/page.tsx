import { AdminJourneyLiveBroadcastAddPage } from "@/modules/admin/presentation/pages/AdminJourneyLiveBroadcastAddPage";

interface Props {
  params: Promise<{ journeyId: string; stationId: string }>;
}

export default async function Page({ params }: Props) {
  const { journeyId, stationId } = await params;
  return <AdminJourneyLiveBroadcastAddPage journeyId={journeyId} stationId={stationId} />;
}
