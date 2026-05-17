import { AdminCourseReviewPage } from "@/modules/admin/presentation/pages/AdminCourseReviewPage";

type CourseReviewRouteParams = {
  params: Promise<{ courseId: string }>;
};

export default async function CourseReviewRoute({ params }: CourseReviewRouteParams) {
  const { courseId } = await params;
  return <AdminCourseReviewPage courseId={courseId} />;
}
