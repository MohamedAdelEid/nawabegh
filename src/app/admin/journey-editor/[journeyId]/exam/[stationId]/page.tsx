import { AdminJourneyExamEditorPage } from "@/modules/admin/presentation/pages/AdminJourneyExamEditorPage";

interface Props {
  params: Promise<{ journeyId: string; stationId: string }>;
}

export default async function Page({ params }: Props) {
  const { journeyId, stationId } = await params;
  return <AdminJourneyExamEditorPage journeyId={journeyId} stationId={stationId} />;
}
