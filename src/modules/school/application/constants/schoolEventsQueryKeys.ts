import type {
  SchoolEventsListParams,
  SchoolTeamRankingsParams,
} from "@/modules/school/domain/types/schoolEvents.types";

export const schoolEventsQueryKeys = {
  all: ["school-events"] as const,
  meta: () => [...schoolEventsQueryKeys.all, "meta"] as const,
  kpis: () => [...schoolEventsQueryKeys.all, "kpis"] as const,
  list: (params: SchoolEventsListParams) =>
    [...schoolEventsQueryKeys.all, "list", params] as const,
  detail: (id: number | string) =>
    [...schoolEventsQueryKeys.all, "detail", String(id)] as const,
  live: (id: number | string) =>
    [...schoolEventsQueryKeys.all, "live", String(id)] as const,
  activity: (id: number | string, pageNumber: number) =>
    [...schoolEventsQueryKeys.all, "activity", String(id), pageNumber] as const,
  matches: (id: number | string) =>
    [...schoolEventsQueryKeys.all, "matches", String(id)] as const,
  standings: (id: number | string) =>
    [...schoolEventsQueryKeys.all, "standings", String(id)] as const,
  poll: (id: number | string) =>
    [...schoolEventsQueryKeys.all, "poll", String(id)] as const,
  honorBoard: (id: number | string) =>
    [...schoolEventsQueryKeys.all, "honor-board", String(id)] as const,
};

export const schoolTeamsQueryKeys = {
  all: ["school-teams"] as const,
  meta: () => [...schoolTeamsQueryKeys.all, "meta"] as const,
  detail: (id: number | string) =>
    [...schoolTeamsQueryKeys.all, "detail", String(id)] as const,
  studentSearch: (keyword: string) =>
    [...schoolTeamsQueryKeys.all, "student-search", keyword] as const,
  rankings: (params: SchoolTeamRankingsParams) =>
    [...schoolTeamsQueryKeys.all, "rankings", params] as const,
  rankingKpis: (schoolScope: string) =>
    [...schoolTeamsQueryKeys.all, "ranking-kpis", schoolScope] as const,
};
