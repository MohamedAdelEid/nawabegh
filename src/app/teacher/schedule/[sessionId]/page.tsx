import { TeacherSessionDetailsPage } from "@/modules/teacher/presentation/pages/TeacherSessionDetailsPage";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function TeacherSessionDetailsRoutePage({ params }: PageProps) {
  const { sessionId } = await params;
  return <TeacherSessionDetailsPage sessionId={sessionId} />;
}
