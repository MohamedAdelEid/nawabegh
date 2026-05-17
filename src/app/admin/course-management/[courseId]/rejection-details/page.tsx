import { AdminCourseRejectionDetailsPage } from "@/modules/admin/presentation/pages/AdminCourseRejectionDetailsPage";

type CourseRejectionDetailsRouteParams = {
  params: Promise<{ courseId: string }>;
};

export default async function CourseRejectionDetailsRoute({
  params,
}: CourseRejectionDetailsRouteParams) {
  const { courseId } = await params;
  return <AdminCourseRejectionDetailsPage courseId={courseId} />;
}
