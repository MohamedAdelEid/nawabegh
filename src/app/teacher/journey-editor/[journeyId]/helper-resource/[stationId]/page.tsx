import { AdminJourneyHelperResourceEditorPage } from "@/modules/admin/presentation/pages/AdminJourneyHelperResourceEditorPage";

interface Props {
  params: Promise<{ journeyId: string; stationId: string }>;
}

export default async function Page({ params }: Props) {
  const { journeyId, stationId } = await params;
  return <AdminJourneyHelperResourceEditorPage journeyId={journeyId} stationId={stationId} />;
}
