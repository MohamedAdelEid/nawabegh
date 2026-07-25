import { Suspense } from "react";
import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getTranslations } from "next-intl/server";
import {
  SCHOOL_EVENTS_PAGE_SIZE,
  schoolEventsQueryKeys,
} from "@/modules/student/application/constants/schoolEventsQueryKeys";
import { studentHomeQueryKeys } from "@/modules/student/application/constants/studentHomeQueryKeys";
import { SchoolEventsPageSkeleton } from "@/modules/student/presentation/components/school-events/SchoolEventsSkeleton";
import { StudentSchoolEventsPage } from "@/modules/student/presentation/pages/StudentSchoolEventsPage";
import {
  getStudentSchoolEventKpis,
  getStudentSchoolEventMeta,
  getStudentSchoolEventsList,
} from "@/modules/student/infrastructure/api/schoolEvents.api";
import { getStudentMyProfile } from "@/modules/student/infrastructure/api/studentHomeApi";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.schoolEvents");
  return { title: t("page.title") };
}

async function SchoolEventsContent() {
  const queryClient = new QueryClient();
  const listParams = {
    status: "all" as const,
    pageNumber: 1,
    pageSize: SCHOOL_EVENTS_PAGE_SIZE,
  };

  let hasSchool = false;
  try {
    const profile = await getStudentMyProfile();
    hasSchool = Boolean(profile?.schoolId?.trim());
    if (profile) {
      await queryClient.prefetchQuery({
        queryKey: studentHomeQueryKeys.profile(),
        queryFn: () => Promise.resolve(profile),
      });
    }
  } catch {
    hasSchool = false;
  }

  let eventsPage: Awaited<ReturnType<typeof getStudentSchoolEventsList>> | undefined;

  if (hasSchool) {
    try {
      eventsPage = await getStudentSchoolEventsList(listParams);
      await queryClient.prefetchQuery({
        queryKey: schoolEventsQueryKeys.list(listParams),
        queryFn: () => Promise.resolve(eventsPage!),
      });
    } catch {
      eventsPage = undefined;
    }

    try {
      await queryClient.prefetchQuery({
        queryKey: schoolEventsQueryKeys.kpis(),
        queryFn: getStudentSchoolEventKpis,
      });
    } catch {
      // KPIs are optional for first paint
    }

    try {
      await queryClient.prefetchQuery({
        queryKey: schoolEventsQueryKeys.meta(),
        queryFn: getStudentSchoolEventMeta,
      });
    } catch {
      // Meta is optional for first paint
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentSchoolEventsPage
        initial={eventsPage ? { eventsPage } : undefined}
      />
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
