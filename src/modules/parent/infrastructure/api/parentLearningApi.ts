import type {
  ParentCatalogPage,
  ParentChildCoursesResponse,
  ParentChildDashboardResponse,
  ParentChildReportsResponse,
  ParentCourseJourneyResponse,
  ParentResourcesPage,
  ParentStationDetail,
  ParentSubscriptionDetail,
} from "@/modules/parent/domain/types/parentLearning.types";
import {
  extractApiErrorMessage,
  resolveApiData,
} from "@/shared/infrastructure/api/apiResponse.utils";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import {
  parseXPaginationHeader,
  resolveListPageMeta,
} from "@/shared/infrastructure/http/xPagination";

const CHILDREN_URL = "/api/v1/Parent/children";
const CATALOG_URL = "/api/v1/Parent/courses/catalog";

async function callParentLearningApi<T>(
  action: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, fallbackMessage));
  }
}

function childBase(studentUserId: string) {
  return `${CHILDREN_URL}/${encodeURIComponent(studentUserId)}`;
}

export async function fetchParentChildCourses(
  studentUserId: string,
): Promise<ParentChildCoursesResponse> {
  return callParentLearningApi(async () => {
    const response = await httpClient.get<ParentChildCoursesResponse>({
      url: `${childBase(studentUserId)}/courses`,
    });
    const data = resolveApiData<ParentChildCoursesResponse>(response);
    return {
      ...data,
      courses: data.courses ?? [],
    };
  }, "Failed to load child courses");
}

export async function fetchParentChildReports(
  studentUserId: string,
  courseId?: string,
): Promise<ParentChildReportsResponse> {
  return callParentLearningApi(async () => {
    const response = await httpClient.get<ParentChildReportsResponse>({
      url: `${childBase(studentUserId)}/reports`,
      params: courseId ? { courseId } : undefined,
    });
    const data = resolveApiData<ParentChildReportsResponse>(response);
    return {
      ...data,
      subjects: data.subjects ?? [],
      weeklyPerformance: data.weeklyPerformance ?? [],
      completionPie: data.completionPie ?? [],
      attendancePie: data.attendancePie ?? [],
      examStats: data.examStats ?? {
        totalAttempts: 0,
        passedAttempts: 0,
        successRatePercent: 0,
        averageScorePercent: 0,
      },
      recentQuizzes: data.recentQuizzes ?? [],
      chapters: data.chapters ?? [],
    };
  }, "Failed to load child reports");
}

export async function fetchParentChildDashboard(
  studentUserId: string,
  weekStart?: string,
): Promise<ParentChildDashboardResponse> {
  return callParentLearningApi(async () => {
    const response = await httpClient.get<ParentChildDashboardResponse>({
      url: `${childBase(studentUserId)}/dashboard`,
      params: weekStart ? { weekStart } : undefined,
    });
    const data = resolveApiData<ParentChildDashboardResponse>(response);
    return {
      ...data,
      weeklySummary: data.weeklySummary ?? {
        lessonsCompleted: 0,
        hoursStudied: 0,
        assignmentsDone: 0,
      },
      recentLessons: data.recentLessons ?? [],
      weeklySchedule: data.weeklySchedule ?? [],
      dailyTasks: data.dailyTasks ?? [],
      currentStations: data.currentStations ?? [],
      recentActivities: data.recentActivities ?? [],
    };
  }, "Failed to load child learning dashboard");
}

export async function fetchParentCourseJourney(
  studentUserId: string,
  courseId: string,
): Promise<ParentCourseJourneyResponse> {
  return callParentLearningApi(async () => {
    const response = await httpClient.get<ParentCourseJourneyResponse>({
      url: `${childBase(studentUserId)}/courses/${encodeURIComponent(courseId)}/journey`,
    });
    const data = resolveApiData<ParentCourseJourneyResponse>(response);
    return {
      ...data,
      paths: data.paths ?? [],
    };
  }, "Failed to load course journey");
}

export async function fetchParentChildResources(
  studentUserId: string,
  query: {
    keyword?: string;
    mediaKind?: string;
    category?: string;
    courseId?: string;
    pageNumber?: number;
    pageSize?: number;
  } = {},
): Promise<ParentResourcesPage> {
  return callParentLearningApi(async () => {
    const pageNumber = query.pageNumber ?? 1;
    const pageSize = query.pageSize ?? 12;
    const response = await httpClient.get<unknown>({
      url: `${childBase(studentUserId)}/resources`,
      params: {
        pageNumber,
        pageSize,
        ...(query.keyword?.trim() ? { keyword: query.keyword.trim() } : {}),
        ...(query.mediaKind ? { mediaKind: query.mediaKind } : {}),
        ...(query.category ? { category: query.category } : {}),
        ...(query.courseId ? { courseId: query.courseId } : {}),
      },
    });

    const data = resolveApiData<unknown>(response);
    const payload =
      data && typeof data === "object" && !Array.isArray(data)
        ? (data as Record<string, unknown>)
        : {};
    const items = Array.isArray(data)
      ? data
      : Array.isArray(payload.items)
        ? payload.items
        : [];
    const headerMeta = parseXPaginationHeader(response.headers ?? {});
    const meta = resolveListPageMeta(
      { pageNumber, pageSize },
      items.length,
      headerMeta,
      payload,
    );

    return {
      items: items as ParentResourcesPage["items"],
      currentPage: meta.currentPage,
      pageSize: meta.pageSize,
      totalItems: meta.totalItems,
      totalPages: meta.totalPages,
      hasNextPage: meta.currentPage < meta.totalPages,
    };
  }, "Failed to load resources");
}

export async function fetchParentStationDetail(
  studentUserId: string,
  stationId: string,
): Promise<ParentStationDetail> {
  return callParentLearningApi(async () => {
    const response = await httpClient.get<ParentStationDetail>({
      url: `${childBase(studentUserId)}/stations/${encodeURIComponent(stationId)}`,
    });
    return resolveApiData<ParentStationDetail>(response);
  }, "Failed to load station details");
}

export async function fetchParentChildSubscription(
  studentUserId: string,
  enrollmentId: string,
): Promise<ParentSubscriptionDetail> {
  return callParentLearningApi(async () => {
    const response = await httpClient.get<ParentSubscriptionDetail>({
      url: `${childBase(studentUserId)}/subscriptions/${encodeURIComponent(enrollmentId)}`,
    });
    return resolveApiData<ParentSubscriptionDetail>(response);
  }, "Failed to load subscription details");
}

export async function fetchParentCoursesCatalog(query: {
  studentUserId?: string;
  keyword?: string;
  subjectId?: string;
  gradeId?: number;
  pageNumber?: number;
  pageSize?: number;
} = {}): Promise<ParentCatalogPage> {
  return callParentLearningApi(async () => {
    const pageNumber = query.pageNumber ?? 1;
    const pageSize = query.pageSize ?? 12;
    const response = await httpClient.get<unknown>({
      url: CATALOG_URL,
      params: {
        pageNumber,
        pageSize,
        ...(query.studentUserId ? { studentUserId: query.studentUserId } : {}),
        ...(query.keyword?.trim() ? { keyword: query.keyword.trim() } : {}),
        ...(query.subjectId ? { subjectId: query.subjectId } : {}),
        ...(query.gradeId != null ? { gradeId: query.gradeId } : {}),
      },
    });

    const data = resolveApiData<unknown>(response);
    const payload =
      data && typeof data === "object" && !Array.isArray(data)
        ? (data as Record<string, unknown>)
        : {};
    const items = Array.isArray(data)
      ? data
      : Array.isArray(payload.items)
        ? payload.items
        : [];
    const headerMeta = parseXPaginationHeader(response.headers ?? {});
    const meta = resolveListPageMeta(
      { pageNumber, pageSize },
      items.length,
      headerMeta,
      payload,
    );

    return {
      items: items as ParentCatalogPage["items"],
      currentPage: meta.currentPage,
      pageSize: meta.pageSize,
      totalItems: meta.totalItems,
      totalPages: meta.totalPages,
      hasNextPage: meta.currentPage < meta.totalPages,
    };
  }, "Failed to load courses catalog");
}
