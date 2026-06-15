import { AdminJourneyChallengeEditorPage } from "@/modules/admin/presentation/pages/AdminJourneyChallengeEditorPage";

interface Props {
  params: Promise<{ journeyId: string; stationId: string }>;
}

export default async function Page({ params }: Props) {
  const { journeyId, stationId } = await params;
  return <AdminJourneyChallengeEditorPage journeyId={journeyId} stationId={stationId} />;
}
