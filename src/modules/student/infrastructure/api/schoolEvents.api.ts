import {
  getMockSchoolEventCards,
  getMockSchoolEventLiveDashboard,
} from "@/modules/student/domain/data/schoolEventsMock";
import type {
  SchoolEventLiveDashboard,
  SchoolEventStatusFilter,
  SchoolEventsPage,
} from "@/modules/student/domain/types/schoolEvent.types";

export type GetSchoolEventsParams = {
  status?: SchoolEventStatusFilter;
  pageNumber?: number;
  pageSize?: number;
  locale?: string;
};

function matchesStatusFilter(
  status: string,
  isLive: boolean,
  filter: SchoolEventStatusFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "live") return isLive || status === "Live";
  if (filter === "published") return status === "Published";
  if (filter === "draft") return status === "Draft";
  if (filter === "ended") return status === "Ended";
  return true;
}

/**
 * Temporary mock client until `GET /api/v1/school/events` is restored.
 */
export async function getSchoolEventsPage(
  params: GetSchoolEventsParams = {},
): Promise<SchoolEventsPage> {
  const {
    status = "all",
    pageNumber = 1,
    pageSize = 4,
    locale = "ar",
  } = params;

  await new Promise((resolve) => setTimeout(resolve, 180));

  const all = getMockSchoolEventCards(locale).filter((event) =>
    matchesStatusFilter(event.status, event.isLive, status),
  );

  const totalCount = all.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(pageNumber, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  const items = all.slice(0, start + pageSize);

  return {
    items,
    loadedCount: items.length,
    totalCount,
    currentPage: safePage,
    pageSize,
    totalPages,
    hasNext: items.length < totalCount,
    hasPrevious: safePage > 1,
  };
}

/**
 * Temporary mock client until `GET /api/v1/school/events/{id}/live-dashboard` exists.
 */
export async function getSchoolEventLiveDashboard(
  eventId: string,
  locale = "ar",
): Promise<SchoolEventLiveDashboard> {
  await new Promise((resolve) => setTimeout(resolve, 160));
  return getMockSchoolEventLiveDashboard(eventId, locale);
}

export async function voteSchoolEventPoll(params: {
  eventId: string;
  pollId: string;
  optionId: string;
  locale?: string;
}): Promise<SchoolEventLiveDashboard> {
  const dashboard = await getSchoolEventLiveDashboard(
    params.eventId,
    params.locale ?? "ar",
  );

  if (!dashboard.activePoll || dashboard.activePoll.pollId !== params.pollId) {
    return dashboard;
  }

  const options = dashboard.activePoll.options.map((option) => {
    if (option.optionId !== params.optionId) {
      return { ...option, isLeading: false };
    }
    const voteCount = option.voteCount + 1;
    return { ...option, voteCount, isLeading: true };
  });

  const totalVotes = dashboard.activePoll.totalVotes + 1;
  const normalized = options.map((option) => ({
    ...option,
    votePercentage: Math.round((option.voteCount / totalVotes) * 100),
    isLeading: option.optionId === params.optionId,
  }));

  return {
    ...dashboard,
    activePoll: {
      ...dashboard.activePoll,
      hasUserVoted: true,
      totalVotes,
      totalVotesLabel:
        (params.locale ?? "ar").startsWith("ar")
          ? `بناءً على ${totalVotes.toLocaleString("ar-EG")} صوت من الجمهور`
          : `Based on ${totalVotes.toLocaleString("en-US")} audience votes`,
      options: normalized,
    },
  };
}
