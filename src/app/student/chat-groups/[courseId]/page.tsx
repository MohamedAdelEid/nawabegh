import { redirect } from "next/navigation";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export default async function StudentChatConversationRoute({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  redirect(
    `${ROUTES.USER.STUDENT.JOURNEY}?courseId=${encodeURIComponent(courseId)}&tab=chat`,
  );
}
