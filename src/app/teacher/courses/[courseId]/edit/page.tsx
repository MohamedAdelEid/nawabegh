import { TeacherCourseCreatePage } from "@/modules/teacher/presentation/pages/TeacherCourseCreatePage";

export default async function Page({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <TeacherCourseCreatePage courseId={courseId} />;
}
