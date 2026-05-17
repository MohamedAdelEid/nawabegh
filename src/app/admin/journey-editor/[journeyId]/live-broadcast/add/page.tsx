import { AdminJourneyLiveBroadcastAddPage } from "@/modules/admin/presentation/pages/AdminJourneyLiveBroadcastAddPage";

interface Props {
  params: Promise<{ journeyId: string }>;
}

export default async function Page({ params }: Props) {
  const { journeyId } = await params;
  return <AdminJourneyLiveBroadcastAddPage journeyId={journeyId} />;
}
