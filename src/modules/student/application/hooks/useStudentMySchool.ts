"use client";

import { useQuery } from "@tanstack/react-query";
import { schoolEventsQueryKeys } from "@/modules/student/application/constants/schoolEventsQueryKeys";
import { studentProfileQueryKeys } from "@/modules/student/application/constants/studentProfileQueryKeys";
import { useStudentHomeProfile } from "@/modules/student/application/hooks/useStudentHomeDashboard";
import { hasLinkedSchool } from "@/modules/student/presentation/components/school-events/StudentSchoolLinkGate";
import {
  getStudentSchoolEventKpis,
  getStudentSchoolEventsList,
} from "@/modules/student/infrastructure/api/schoolEvents.api";
import { getStudentSchoolLeadersBoard } from "@/modules/student/infrastructure/api/studentSchoolLeaderboard.api";
import { getStudentSchoolRank } from "@/modules/student/infrastructure/api/studentProfile.api";

const PREVIEW_EVENTS_PARAMS = {
  status: "all" as const,
  pageNumber: 1,
  pageSize: 3,
};

export function useStudentMySchool() {
  const profileQuery = useStudentHomeProfile();
  const linked = hasLinkedSchool(profileQuery.data);

  const schoolRankQuery = useQuery({
    queryKey: studentProfileQueryKeys.schoolRank(),
    queryFn: getStudentSchoolRank,
    enabled: linked,
    staleTime: 60_000,
    retry: false,
  });

  const schoolLeadersQuery = useQuery({
    queryKey: studentProfileQueryKeys.schoolLeaders(),
    queryFn: getStudentSchoolLeadersBoard,
    enabled: linked,
    staleTime: 60_000,
    retry: false,
  });

  const kpisQuery = useQuery({
    queryKey: schoolEventsQueryKeys.kpis(),
    queryFn: getStudentSchoolEventKpis,
    enabled: linked,
    staleTime: 30_000,
  });

  const eventsPreviewQuery = useQuery({
    queryKey: schoolEventsQueryKeys.list(PREVIEW_EVENTS_PARAMS),
    queryFn: () => getStudentSchoolEventsList(PREVIEW_EVENTS_PARAMS),
    enabled: linked,
    staleTime: 30_000,
  });

  const isInitialLoading =
    profileQuery.isLoading ||
    (linked &&
      ((schoolRankQuery.isLoading && !schoolRankQuery.data) ||
        (schoolLeadersQuery.isLoading && !schoolLeadersQuery.data) ||
        (eventsPreviewQuery.isLoading && !eventsPreviewQuery.data)));

  return {
    profileQuery,
    linked,
    schoolRankQuery,
    schoolLeadersQuery,
    kpisQuery,
    eventsPreviewQuery,
    isInitialLoading,
  };
}
