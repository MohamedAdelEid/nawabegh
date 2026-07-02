import { TeacherCourseSubscribersPage } from "@/modules/teacher/presentation/pages/TeacherCourseSubscribersPage";

export default async function Page({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <TeacherCourseSubscribersPage courseId={courseId} />;
}
