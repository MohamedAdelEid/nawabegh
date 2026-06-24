import { redirect } from "next/navigation";
import { ROUTES } from "@/shared/infrastructure/config/routes";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function TeacherScheduleSessionRedirectPage({ params }: PageProps) {
  const { sessionId } = await params;
  redirect(ROUTES.USER.TEACHER.SESSION_DETAILS(sessionId));
}
