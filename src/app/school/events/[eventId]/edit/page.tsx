import { SchoolEventCreatePage } from "@/modules/school/presentation/pages/SchoolEventCreatePage";

type PageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function SchoolEventEditRoutePage({ params }: PageProps) {
  const { eventId } = await params;
  return <SchoolEventCreatePage eventId={eventId} />;
}
