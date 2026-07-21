import { SchoolEventLivePage } from "@/modules/school/presentation/pages/SchoolEventLivePage";

type PageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function SchoolEventViewRoutePage({ params }: PageProps) {
  const { eventId } = await params;
  return <SchoolEventLivePage eventId={eventId} />;
}
