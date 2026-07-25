import { Suspense } from "react";
import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getTranslations } from "next-intl/server";
import { schoolEventsQueryKeys } from "@/modules/student/application/constants/schoolEventsQueryKeys";
import { isValidStudentSchoolEventId } from "@/modules/student/domain/utils/schoolEventId";
import { SchoolEventLivePageSkeleton } from "@/modules/student/presentation/components/school-event-live/SchoolEventLiveSkeleton";
import { StudentSchoolEventLivePage } from "@/modules/student/presentation/pages/StudentSchoolEventLivePage";
import { getStudentSchoolEventLive } from "@/modules/student/infrastructure/api/schoolEvents.api";

type EventLiveRouteParams = {
  params: Promise<{ eventId: string }>;
};

export async function generateMetadata({
  params,
}: EventLiveRouteParams): Promise<Metadata> {
  const { eventId } = await params;
  const t = await getTranslations("student.dashboard.schoolEventLive");

  if (!isValidStudentSchoolEventId(eventId)) {
    return { title: t("page.title") };
  }

  try {
    const dashboard = await getStudentSchoolEventLive(eventId);
    return { title: dashboard.hero.title || t("page.title") };
  } catch {
    return { title: t("page.title") };
  }
}

async function EventLiveContent({ eventId }: { eventId: string }) {
  const queryClient = new QueryClient();

  let dashboard: Awaited<ReturnType<typeof getStudentSchoolEventLive>> | undefined;

  if (isValidStudentSchoolEventId(eventId)) {
    try {
      dashboard = await getStudentSchoolEventLive(eventId);
      await queryClient.prefetchQuery({
        queryKey: schoolEventsQueryKeys.live(eventId),
        queryFn: () => Promise.resolve(dashboard!),
      });
    } catch {
      dashboard = undefined;
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentSchoolEventLivePage
        eventId={eventId}
        initial={dashboard ? { dashboard } : undefined}
      />
    </HydrationBoundary>
  );
}

export default async function StudentSchoolEventLiveRoute({
  params,
}: EventLiveRouteParams) {
  const { eventId } = await params;

  return (
    <Suspense fallback={<SchoolEventLivePageSkeleton />}>
      <EventLiveContent eventId={eventId} />
    </Suspense>
  );
}
