import { TeacherCourseDetailsPage } from "@/modules/teacher/presentation/pages/TeacherCourseDetailsPage";

export default async function Page({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <TeacherCourseDetailsPage courseId={courseId} />;
}
