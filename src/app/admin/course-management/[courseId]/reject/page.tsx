import { AdminCourseRejectPage } from "@/modules/admin/presentation/pages/AdminCourseRejectPage";

type CourseRejectRouteParams = {
  params: Promise<{ courseId: string }>;
};

export default async function CourseRejectRoute({ params }: CourseRejectRouteParams) {
  const { courseId } = await params;
  return <AdminCourseRejectPage courseId={courseId} />;
}
