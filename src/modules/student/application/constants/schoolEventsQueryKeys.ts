import type {
  SchoolEventStatusFilter,
  SchoolEventsListParams,
} from "@/modules/student/domain/types/schoolEvent.types";

export const SCHOOL_EVENTS_PAGE_SIZE = 9;

export const schoolEventsQueryKeys = {
  all: ["student", "school-events"] as const,
  meta: () => [...schoolEventsQueryKeys.all, "meta"] as const,
  kpis: () => [...schoolEventsQueryKeys.all, "kpis"] as const,
  list: (params: SchoolEventsListParams) =>
    [...schoolEventsQueryKeys.all, "list", params] as const,
  live: (eventId: string | number) =>
    [...schoolEventsQueryKeys.all, "live", String(eventId)] as const,
  activity: (eventId: string | number) =>
    [...schoolEventsQueryKeys.all, "activity", String(eventId)] as const,
  matches: (eventId: string | number) =>
    [...schoolEventsQueryKeys.all, "matches", String(eventId)] as const,
  standings: (eventId: string | number) =>
    [...schoolEventsQueryKeys.all, "standings", String(eventId)] as const,
  honorBoard: (eventId: string | number) =>
    [...schoolEventsQueryKeys.all, "honor-board", String(eventId)] as const,
  poll: (eventId: string | number) =>
    [...schoolEventsQueryKeys.all, "poll", String(eventId)] as const,
};

export const DEFAULT_STATUS_FILTERS: SchoolEventStatusFilter[] = [
  "all",
  "ongoing",
  "published",
  "finished",
];
