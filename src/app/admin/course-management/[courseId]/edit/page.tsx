import { AdminCourseCreatePage } from "@/modules/admin/presentation/pages/AdminCourseCreatePage";

type CourseEditRouteParams = {
  params: Promise<{ courseId: string }>;
};

export default async function CourseEditRoute({ params }: CourseEditRouteParams) {
  const { courseId } = await params;
  return <AdminCourseCreatePage courseId={courseId} />;
}
