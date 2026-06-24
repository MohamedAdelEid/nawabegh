import { TeacherInteractiveBookManagePage } from "@/modules/teacher/presentation/pages/TeacherInteractiveBookManagePage";

export default async function Page({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <TeacherInteractiveBookManagePage editCourseId={courseId} />;
}
