import { AdminJourneyEditorPage } from "@/modules/admin/presentation/pages/AdminJourneyEditorPage";

interface Props {
  params: Promise<{ journeyId: string }>;
}

export default async function Page({ params }: Props) {
  const { journeyId } = await params;
  return <AdminJourneyEditorPage journeyId={journeyId} />;
}
