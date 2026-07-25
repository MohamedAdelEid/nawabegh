"use client";

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  DEFAULT_STATUS_FILTERS,
  SCHOOL_EVENTS_PAGE_SIZE,
  schoolEventsQueryKeys,
} from "@/modules/student/application/constants/schoolEventsQueryKeys";
import type {
  SchoolEventCard,
  SchoolEventStatusFilter,
  SchoolEventsListPage,
} from "@/modules/student/domain/types/schoolEvent.types";
import {
  getStudentSchoolEventKpis,
  getStudentSchoolEventMeta,
  getStudentSchoolEventsList,
} from "@/modules/student/infrastructure/api/schoolEvents.api";

export type SchoolEventsInitialData = {
  eventsPage?: SchoolEventsListPage;
};

type UseSchoolEventsOptions = {
  initial?: SchoolEventsInitialData;
  enabled?: boolean;
};

function normalizeFilterValue(value: string): SchoolEventStatusFilter | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === "all") return "all";
  if (normalized === "ongoing" || normalized === "live") return "ongoing";
  if (normalized === "published" || normalized === "upcoming") return "published";
  if (normalized === "finished" || normalized === "ended") return "finished";
  if (normalized === "draft" || normalized === "archived") return null;
  return null;
}

export function useSchoolEvents({
  initial,
  enabled = true,
}: UseSchoolEventsOptions = {}) {
  const [status, setStatus] = useState<SchoolEventStatusFilter>("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [accumulated, setAccumulated] = useState<SchoolEventCard[]>([]);

  const listParams = {
    status,
    pageNumber,
    pageSize: SCHOOL_EVENTS_PAGE_SIZE,
  };

  const metaQuery = useQuery({
    queryKey: schoolEventsQueryKeys.meta(),
    queryFn: getStudentSchoolEventMeta,
    enabled,
    staleTime: 60_000,
  });

  const kpisQuery = useQuery({
    queryKey: schoolEventsQueryKeys.kpis(),
    queryFn: getStudentSchoolEventKpis,
    enabled,
    staleTime: 30_000,
  });

  const eventsQuery = useQuery({
    queryKey: schoolEventsQueryKeys.list(listParams),
    queryFn: () => getStudentSchoolEventsList(listParams),
    enabled,
    initialData:
      enabled && status === "all" && pageNumber === 1 && initial?.eventsPage
        ? initial.eventsPage
        : undefined,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const pageItems = eventsQuery.data?.items ?? [];
  const events = useMemo(() => {
    if (pageNumber === 1) return pageItems;
    const seen = new Set(accumulated.map((item) => item.id));
    const merged = [...accumulated];
    for (const item of pageItems) {
      if (!seen.has(item.id)) merged.push(item);
    }
    return merged;
  }, [accumulated, pageItems, pageNumber]);

  const filterOptions = useMemo(() => {
    const fromMeta = (metaQuery.data?.statuses ?? [])
      .map((option) => {
        const value = normalizeFilterValue(option.value);
        if (!value) return null;
        return { value, label: option.label };
      })
      .filter((item): item is { value: SchoolEventStatusFilter; label: string } => item !== null);

    if (fromMeta.length > 0) {
      const seen = new Set<SchoolEventStatusFilter>();
      return fromMeta.filter((item) => {
        if (seen.has(item.value)) return false;
        seen.add(item.value);
        return true;
      });
    }

    return DEFAULT_STATUS_FILTERS.map((value) => ({ value, label: value }));
  }, [metaQuery.data?.statuses]);

  const handleStatusChange = (next: SchoolEventStatusFilter) => {
    setStatus(next);
    setPageNumber(1);
    setAccumulated([]);
  };

  const handleLoadMore = () => {
    if (!eventsQuery.data?.hasNext) return;
    setAccumulated(events);
    setPageNumber((current) => current + 1);
  };

  const totalCount = eventsQuery.data?.totalCount ?? events.length;
  const progress =
    totalCount === 0 ? 0 : Math.min(100, Math.round((events.length / totalCount) * 100));

  return {
    eventsQuery,
    metaQuery,
    kpisQuery,
    events,
    status,
    setStatus: handleStatusChange,
    filterOptions,
    loadedCount: events.length,
    totalCount,
    hasNext: eventsQuery.data?.hasNext ?? false,
    progress,
    loadMore: handleLoadMore,
    isLoadingMore: eventsQuery.isFetching && pageNumber > 1,
  };
}
