import { TeacherChatGroupEditPage } from "@/modules/teacher/presentation/pages/TeacherChatGroupEditPage";

export default async function Page({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <TeacherChatGroupEditPage courseId={courseId} />;
}
