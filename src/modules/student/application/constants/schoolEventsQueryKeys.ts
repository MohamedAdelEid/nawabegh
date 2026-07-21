import type { SchoolEventStatusFilter } from "@/modules/student/domain/types/schoolEvent.types";

export const SCHOOL_EVENTS_PAGE_SIZE = 4;

export const schoolEventsQueryKeys = {
  all: ["student", "school-events"] as const,
  list: (locale: string, status: SchoolEventStatusFilter, pageSize: number) =>
    [...schoolEventsQueryKeys.all, "list", locale, status, pageSize] as const,
  live: (locale: string, eventId: string) =>
    [...schoolEventsQueryKeys.all, "live", locale, eventId] as const,
};
