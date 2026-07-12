import { Suspense } from "react";
import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getLocale, getTranslations } from "next-intl/server";
import {
  TEACHERS_DISCOVERY_PAGE_SIZE,
  teachersDiscoveryQueryKeys,
} from "@/modules/student/application/constants/teachersDiscoveryQueryKeys";
import { StudentTeachersDiscoveryPage } from "@/modules/student/presentation/pages/StudentTeachersDiscoveryPage";
import { TeachersDiscoveryPageSkeleton } from "@/modules/student/presentation/components/teachers-discovery/TeachersDiscoverySkeleton";
import { getSubjects } from "@/shared/infrastructure/api/subject.api";
import { getTeachersPage } from "@/shared/infrastructure/api/teacher.api";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.teachersDiscovery");
  return { title: t("page.title") };
}

async function TeachersDiscoveryContent() {
  const locale = await getLocale();
  const queryClient = new QueryClient();

  let subjects: Awaited<ReturnType<typeof getSubjects>> = [];
  let teachersPage: Awaited<ReturnType<typeof getTeachersPage>> = {
    rows: [],
    currentPage: 1,
    pageSize: TEACHERS_DISCOVERY_PAGE_SIZE,
    totalPages: 1,
    totalCount: 0,
    hasPrevious: false,
    hasNext: false,
  };

  try {
    subjects = await getSubjects({ pageNumber: 1, pageSize: 50 });
  } catch {
    subjects = [];
  }

  try {
    teachersPage = await getTeachersPage({
      pageNumber: 1,
      pageSize: TEACHERS_DISCOVERY_PAGE_SIZE,
    });
  } catch {
    teachersPage = {
      rows: [],
      currentPage: 1,
      pageSize: TEACHERS_DISCOVERY_PAGE_SIZE,
      totalPages: 1,
      totalCount: 0,
      hasPrevious: false,
      hasNext: false,
    };
  }

  await queryClient.prefetchQuery({
    queryKey: teachersDiscoveryQueryKeys.subjects(locale),
    queryFn: () => getSubjects({ pageNumber: 1, pageSize: 50 }),
  });

  await queryClient.prefetchQuery({
    queryKey: teachersDiscoveryQueryKeys.teachers(locale, { pageNumber: 1 }),
    queryFn: () =>
      getTeachersPage({
        pageNumber: 1,
        pageSize: TEACHERS_DISCOVERY_PAGE_SIZE,
      }),
  });

  const initial = { subjects, teachersPage };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentTeachersDiscoveryPage initial={initial} />
    </HydrationBoundary>
  );
}

export default function StudentTeachersRoute() {
  return (
    <Suspense fallback={<TeachersDiscoveryPageSkeleton />}>
      <TeachersDiscoveryContent />
    </Suspense>
  );
}
