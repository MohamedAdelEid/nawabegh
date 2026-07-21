import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getLocale, getTranslations } from "next-intl/server";
import {
  TEACHER_PUBLIC_PROFILE_COURSES_PAGE_SIZE,
  teacherPublicProfileQueryKeys,
} from "@/modules/student/application/constants/teacherPublicProfileQueryKeys";
import { TeacherPublicProfilePageSkeleton } from "@/modules/student/presentation/components/teacher-public-profile/TeacherPublicProfileSkeleton";
import { StudentTeacherPublicProfilePage } from "@/modules/student/presentation/pages/StudentTeacherPublicProfilePage";
import { getExploreCoursesPage } from "@/shared/infrastructure/api/course.api";
import { getTeacherPublicProfile } from "@/shared/infrastructure/api/teacher.api";

type TeacherProfileRouteParams = {
  params: Promise<{ teacherId: string }>;
};

export async function generateMetadata({ params }: TeacherProfileRouteParams): Promise<Metadata> {
  const { teacherId } = await params;
  const t = await getTranslations("student.dashboard.teacherPublicProfile");

  try {
    const profile = await getTeacherPublicProfile(teacherId);
    return { title: profile.fullName };
  } catch {
    return { title: t("errors.notFound") };
  }
}

async function TeacherProfileContent({ teacherId }: { teacherId: string }) {
  const locale = await getLocale();
  const queryClient = new QueryClient();

  let profile: Awaited<ReturnType<typeof getTeacherPublicProfile>> | null = null;
  let coursesPage: Awaited<ReturnType<typeof getExploreCoursesPage>> = {
    rows: [],
    currentPage: 1,
    pageSize: TEACHER_PUBLIC_PROFILE_COURSES_PAGE_SIZE,
    totalPages: 1,
    hasMore: false,
    hasPrevious: false,
  };

  try {
    profile = await getTeacherPublicProfile(teacherId);
  } catch {
    notFound();
  }

  try {
    coursesPage = await getExploreCoursesPage({
      teacherId,
      pageNumber: 1,
      pageSize: TEACHER_PUBLIC_PROFILE_COURSES_PAGE_SIZE,
    });
  } catch {
    coursesPage = {
      rows: [],
      currentPage: 1,
      pageSize: TEACHER_PUBLIC_PROFILE_COURSES_PAGE_SIZE,
      totalPages: 1,
      hasMore: false,
      hasPrevious: false,
    };
  }

  await queryClient.prefetchQuery({
    queryKey: teacherPublicProfileQueryKeys.profile(locale, teacherId),
    queryFn: () => getTeacherPublicProfile(teacherId),
  });

  await queryClient.prefetchQuery({
    queryKey: teacherPublicProfileQueryKeys.courses(locale, teacherId, 1),
    queryFn: () =>
      getExploreCoursesPage({
        teacherId,
        pageNumber: 1,
        pageSize: TEACHER_PUBLIC_PROFILE_COURSES_PAGE_SIZE,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentTeacherPublicProfilePage
        teacherId={teacherId}
        initial={{ profile, coursesPage }}
      />
    </HydrationBoundary>
  );
}

export default async function StudentTeacherProfileRoute({ params }: TeacherProfileRouteParams) {
  const { teacherId } = await params;

  return (
    <Suspense fallback={<TeacherPublicProfilePageSkeleton />}>
      <TeacherProfileContent teacherId={teacherId} />
    </Suspense>
  );
}
