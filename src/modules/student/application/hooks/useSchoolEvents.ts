"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import {
  SCHOOL_EVENTS_PAGE_SIZE,
  schoolEventsQueryKeys,
} from "@/modules/student/application/constants/schoolEventsQueryKeys";
import type {
  SchoolEventStatusFilter,
  SchoolEventsPage,
} from "@/modules/student/domain/types/schoolEvent.types";
import { getSchoolEventsPage } from "@/modules/student/infrastructure/api/schoolEvents.api";

export type SchoolEventsInitialData = {
  eventsPage: SchoolEventsPage;
};

type UseSchoolEventsOptions = {
  initial?: SchoolEventsInitialData;
};

export function useSchoolEvents({ initial }: UseSchoolEventsOptions = {}) {
  const locale = useLocale();
  const [status, setStatus] = useState<SchoolEventStatusFilter>("all");
  const [pageNumber, setPageNumber] = useState(1);

  const eventsQuery = useQuery({
    queryKey: [
      ...schoolEventsQueryKeys.list(locale, status, SCHOOL_EVENTS_PAGE_SIZE),
      pageNumber,
    ],
    queryFn: () =>
      getSchoolEventsPage({
        status,
        pageNumber,
        pageSize: SCHOOL_EVENTS_PAGE_SIZE,
        locale,
      }),
    initialData:
      status === "all" && pageNumber === 1 && initial?.eventsPage
        ? initial.eventsPage
        : undefined,
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  });

  const page = eventsQuery.data;

  const handleStatusChange = (next: SchoolEventStatusFilter) => {
    setStatus(next);
    setPageNumber(1);
  };

  const handleLoadMore = () => {
    if (!page?.hasNext) return;
    setPageNumber((current) => current + 1);
  };

  const progress = useMemo(() => {
    if (!page || page.totalCount === 0) return 0;
    return Math.min(100, Math.round((page.loadedCount / page.totalCount) * 100));
  }, [page]);

  return {
    eventsQuery,
    events: page?.items ?? [],
    status,
    setStatus: handleStatusChange,
    loadedCount: page?.loadedCount ?? 0,
    totalCount: page?.totalCount ?? 0,
    hasNext: page?.hasNext ?? false,
    progress,
    loadMore: handleLoadMore,
    isLoadingMore: eventsQuery.isFetching && pageNumber > 1,
  };
}
