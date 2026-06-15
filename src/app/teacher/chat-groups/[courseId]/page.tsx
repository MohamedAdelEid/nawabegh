import { TeacherChatConversationPage } from "@/modules/teacher/presentation/pages/TeacherChatConversationPage";

export default async function Page({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <TeacherChatConversationPage courseId={courseId} />;
}
