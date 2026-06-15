import { TeacherCourseStatisticsPage } from "@/modules/teacher/presentation/pages/TeacherCourseStatisticsPage";

export default async function Page({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <TeacherCourseStatisticsPage courseId={courseId} />;
}
