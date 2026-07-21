import { Suspense } from "react";
import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getTranslations } from "next-intl/server";
import { EXPLORE_COURSES_PAGE_SIZE, exploreCoursesQueryKeys } from "@/modules/student/application/constants/exploreCoursesQueryKeys";
import { StudentExploreCoursesPage } from "@/modules/student/presentation/pages/StudentExploreCoursesPage";
import { ExploreCoursesPageSkeleton } from "@/modules/student/presentation/components/explore-courses/ExploreCoursesSkeleton";
import { getExploreCoursesPage } from "@/shared/infrastructure/api/course.api";
import { getSubjects } from "@/shared/infrastructure/api/subject.api";
import { getTeachers } from "@/shared/infrastructure/api/teacher.api";
import { getLocale } from "next-intl/server";

const LIST_PARAMS = {
  keyword: " ",
  pageNumber: 1,
  pageSize: 200,
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.exploreCourses");
  return { title: t("page.title") };
}

async function ExploreCoursesContent() {
  const locale = await getLocale();
  const queryClient = new QueryClient();

  let subjects: Awaited<ReturnType<typeof getSubjects>> = [];
  let teachers: Awaited<ReturnType<typeof getTeachers>> = [];
  let coursesPage: Awaited<ReturnType<typeof getExploreCoursesPage>> = {
    rows: [],
    currentPage: 1,
    pageSize: EXPLORE_COURSES_PAGE_SIZE,
    totalPages: 1,
    hasMore: false,
    hasPrevious: false,
  };

  try {
    subjects = await getSubjects(LIST_PARAMS);
  } catch {
    subjects = [];
  }

  try {
    teachers = await getTeachers(LIST_PARAMS);
  } catch {
    teachers = [];
  }

  try {
    coursesPage = await getExploreCoursesPage({
      pageNumber: 1,
      pageSize: EXPLORE_COURSES_PAGE_SIZE,
    });
  } catch {
    coursesPage = {
      rows: [],
      currentPage: 1,
      pageSize: EXPLORE_COURSES_PAGE_SIZE,
      totalPages: 1,
      hasMore: false,
      hasPrevious: false,
    };
  }

  await queryClient.prefetchQuery({
    queryKey: exploreCoursesQueryKeys.subjects(locale),
    queryFn: () => getSubjects(LIST_PARAMS),
  });

  await queryClient.prefetchQuery({
    queryKey: exploreCoursesQueryKeys.teachers(locale, null, ""),
    queryFn: () => getTeachers(LIST_PARAMS),
  });

  await queryClient.prefetchInfiniteQuery({
    queryKey: exploreCoursesQueryKeys.courses(locale, {}),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getExploreCoursesPage({
        pageNumber: pageParam as number,
        pageSize: EXPLORE_COURSES_PAGE_SIZE,
      }),
  });

  const initial = { subjects, teachers, coursesPage };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentExploreCoursesPage initial={initial} />
    </HydrationBoundary>
  );
}

export default function StudentCoursesRoute() {
  return (
    <Suspense fallback={<ExploreCoursesPageSkeleton />}>
      <ExploreCoursesContent />
    </Suspense>
  );
}
