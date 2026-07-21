import { Suspense } from "react";
import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getLocale, getTranslations } from "next-intl/server";
import { schoolEventsQueryKeys } from "@/modules/student/application/constants/schoolEventsQueryKeys";
import { SchoolEventLivePageSkeleton } from "@/modules/student/presentation/components/school-event-live/SchoolEventLiveSkeleton";
import { StudentSchoolEventLivePage } from "@/modules/student/presentation/pages/StudentSchoolEventLivePage";
import { getSchoolEventLiveDashboard } from "@/modules/student/infrastructure/api/schoolEvents.api";

type EventLiveRouteParams = {
  params: Promise<{ eventId: string }>;
};

export async function generateMetadata({
  params,
}: EventLiveRouteParams): Promise<Metadata> {
  const { eventId } = await params;
  const locale = await getLocale();
  const t = await getTranslations("student.dashboard.schoolEventLive");

  try {
    const dashboard = await getSchoolEventLiveDashboard(eventId, locale);
    return { title: dashboard.title };
  } catch {
    return { title: t("page.title") };
  }
}

async function EventLiveContent({ eventId }: { eventId: string }) {
  const locale = await getLocale();
  const queryClient = new QueryClient();

  const dashboard = await getSchoolEventLiveDashboard(eventId, locale);

  await queryClient.prefetchQuery({
    queryKey: schoolEventsQueryKeys.live(locale, eventId),
    queryFn: () => getSchoolEventLiveDashboard(eventId, locale),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentSchoolEventLivePage
        eventId={eventId}
        initial={{ dashboard }}
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
