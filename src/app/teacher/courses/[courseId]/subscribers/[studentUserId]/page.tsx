import { TeacherCourseSubscriberProfilePage } from "@/modules/teacher/presentation/pages/TeacherCourseSubscriberProfilePage";

export default async function Page({
  params,
}: {
  params: Promise<{ courseId: string; studentUserId: string }>;
}) {
  const { courseId, studentUserId } = await params;
  return (
    <TeacherCourseSubscriberProfilePage courseId={courseId} studentUserId={studentUserId} />
  );
}
