import { redirect } from "next/navigation";
import { ROUTES } from "@/shared/infrastructure/config/routes";

type CourseRejectionDetailsRouteParams = {
  params: Promise<{ courseId: string }>;
};

export default async function CourseRejectionDetailsRoute({
  params,
}: CourseRejectionDetailsRouteParams) {
  const { courseId } = await params;
  redirect(ROUTES.ADMIN.COURSE_MANAGEMENT.REVIEW(courseId));
}
