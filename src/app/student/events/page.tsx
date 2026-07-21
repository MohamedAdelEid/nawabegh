import { Suspense } from "react";
import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getLocale, getTranslations } from "next-intl/server";
import {
  SCHOOL_EVENTS_PAGE_SIZE,
  schoolEventsQueryKeys,
} from "@/modules/student/application/constants/schoolEventsQueryKeys";
import { SchoolEventsPageSkeleton } from "@/modules/student/presentation/components/school-events/SchoolEventsSkeleton";
import { StudentSchoolEventsPage } from "@/modules/student/presentation/pages/StudentSchoolEventsPage";
import { getSchoolEventsPage } from "@/modules/student/infrastructure/api/schoolEvents.api";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.schoolEvents");
  return { title: t("page.title") };
}

async function SchoolEventsContent() {
  const locale = await getLocale();
  const queryClient = new QueryClient();

  let eventsPage: Awaited<ReturnType<typeof getSchoolEventsPage>>;
  try {
    eventsPage = await getSchoolEventsPage({
      status: "all",
      pageNumber: 1,
      pageSize: SCHOOL_EVENTS_PAGE_SIZE,
      locale,
    });
  } catch {
    eventsPage = {
      items: [],
      loadedCount: 0,
      totalCount: 0,
      currentPage: 1,
      pageSize: SCHOOL_EVENTS_PAGE_SIZE,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    };
  }

  await queryClient.prefetchQuery({
    queryKey: [
      ...schoolEventsQueryKeys.list(locale, "all", SCHOOL_EVENTS_PAGE_SIZE),
      1,
    ],
    queryFn: () =>
      getSchoolEventsPage({
        status: "all",
        pageNumber: 1,
        pageSize: SCHOOL_EVENTS_PAGE_SIZE,
        locale,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentSchoolEventsPage initial={{ eventsPage }} />
    </HydrationBoundary>
  );
}

export default function StudentSchoolEventsRoute() {
  return (
    <Suspense fallback={<SchoolEventsPageSkeleton />}>
      <SchoolEventsContent />
    </Suspense>
  );
}
