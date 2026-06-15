import { TeacherChatMembersPage } from "@/modules/teacher/presentation/pages/TeacherChatMembersPage";

export default async function Page({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <TeacherChatMembersPage courseId={courseId} />;
}
