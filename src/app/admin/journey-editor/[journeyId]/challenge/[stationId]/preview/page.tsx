import { AdminJourneyChallengePreviewPage } from "@/modules/admin/presentation/pages/AdminJourneyChallengePreviewPage";

interface Props {
  params: Promise<{ journeyId: string; stationId: string }>;
}

export default async function Page({ params }: Props) {
  const { journeyId, stationId } = await params;
  return <AdminJourneyChallengePreviewPage journeyId={journeyId} stationId={stationId} />;
}
