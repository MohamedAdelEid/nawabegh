import { AdminJourneyExamPreviewPage } from "@/modules/admin/presentation/pages/AdminJourneyExamPreviewPage";

interface Props {
  params: Promise<{ journeyId: string; stationId: string }>;
}

export default async function Page({ params }: Props) {
  const { journeyId, stationId } = await params;
  return <AdminJourneyExamPreviewPage journeyId={journeyId} stationId={stationId} />;
}
