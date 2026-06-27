import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getLocale, getTranslations } from "next-intl/server";
import { courseDetailsQueryKeys } from "@/modules/student/application/constants/courseDetailsQueryKeys";
import { StudentCourseDetailsPage } from "@/modules/student/presentation/pages/StudentCourseDetailsPage";
import { CourseDetailsPageSkeleton } from "@/modules/student/presentation/components/course-details/CourseDetailsSkeleton";
import { getCourseExploreDetails } from "@/shared/infrastructure/api/course.api";

type CourseDetailsRouteParams = {
  params: Promise<{ courseId: string }>;
};

export async function generateMetadata({ params }: CourseDetailsRouteParams): Promise<Metadata> {
  const { courseId } = await params;
  const locale = await getLocale();
  const t = await getTranslations("student.dashboard.courseDetails");

  try {
    const course = await getCourseExploreDetails(courseId, locale);
    return { title: course.title };
  } catch {
    return { title: t("errors.notFound") };
  }
}

async function CourseDetailsContent({ courseId }: { courseId: string }) {
  const locale = await getLocale();
  const queryClient = new QueryClient();

  let course: Awaited<ReturnType<typeof getCourseExploreDetails>> | null = null;

  try {
    course = await getCourseExploreDetails(courseId, locale);
  } catch {
    notFound();
  }

  await queryClient.prefetchQuery({
    queryKey: courseDetailsQueryKeys.detail(locale, courseId),
    queryFn: () => getCourseExploreDetails(courseId, locale),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentCourseDetailsPage courseId={courseId} initial={{ course }} />
    </HydrationBoundary>
  );
}

export default async function StudentCourseDetailsRoute({ params }: CourseDetailsRouteParams) {
  const { courseId } = await params;

  return (
    <Suspense fallback={<CourseDetailsPageSkeleton />}>
      <CourseDetailsContent courseId={courseId} />
    </Suspense>
  );
}
