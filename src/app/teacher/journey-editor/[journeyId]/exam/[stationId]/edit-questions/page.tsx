import { AdminJourneyExamEditQuestionsPage } from "@/modules/admin/presentation/pages/AdminJourneyExamEditQuestionsPage";

interface Props {
  params: Promise<{ journeyId: string; stationId: string }>;
}

export default async function Page({ params }: Props) {
  const { journeyId, stationId } = await params;
  return <AdminJourneyExamEditQuestionsPage journeyId={journeyId} stationId={stationId} />;
}
