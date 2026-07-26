import { Suspense } from "react";
import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getTranslations } from "next-intl/server";
import {
  schoolEventsQueryKeys,
} from "@/modules/student/application/constants/schoolEventsQueryKeys";
import { studentHomeQueryKeys } from "@/modules/student/application/constants/studentHomeQueryKeys";
import { studentProfileQueryKeys } from "@/modules/student/application/constants/studentProfileQueryKeys";
import { SchoolEventsPageSkeleton } from "@/modules/student/presentation/components/school-events/SchoolEventsSkeleton";
import { StudentMySchoolPage } from "@/modules/student/presentation/pages/StudentMySchoolPage";
import {
  getStudentSchoolEventKpis,
  getStudentSchoolEventsList,
} from "@/modules/student/infrastructure/api/schoolEvents.api";
import { getStudentMyProfile } from "@/modules/student/infrastructure/api/studentHomeApi";
import { getStudentSchoolRank } from "@/modules/student/infrastructure/api/studentProfile.api";
import { getStudentSchoolLeadersBoard } from "@/modules/student/infrastructure/api/studentSchoolLeaderboard.api";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.mySchool");
  return { title: t("page.title") };
}

async function MySchoolContent() {
  const queryClient = new QueryClient();
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

  if (hasSchool) {
    await Promise.all([
      queryClient
        .prefetchQuery({
          queryKey: studentProfileQueryKeys.schoolRank(),
          queryFn: getStudentSchoolRank,
        })
        .catch(() => undefined),
      queryClient
        .prefetchQuery({
          queryKey: studentProfileQueryKeys.schoolLeaders(),
          queryFn: getStudentSchoolLeadersBoard,
        })
        .catch(() => undefined),
      queryClient
        .prefetchQuery({
          queryKey: schoolEventsQueryKeys.kpis(),
          queryFn: getStudentSchoolEventKpis,
        })
        .catch(() => undefined),
      queryClient
        .prefetchQuery({
          queryKey: schoolEventsQueryKeys.list({
            status: "all",
            pageNumber: 1,
            pageSize: 3,
          }),
          queryFn: () =>
            getStudentSchoolEventsList({
              status: "all",
              pageNumber: 1,
              pageSize: 3,
            }),
        })
        .catch(() => undefined),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StudentMySchoolPage />
    </HydrationBoundary>
  );
}

export default function StudentMySchoolRoute() {
  return (
    <Suspense fallback={<SchoolEventsPageSkeleton />}>
      <MySchoolContent />
    </Suspense>
  );
}
