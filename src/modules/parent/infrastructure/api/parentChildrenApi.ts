import type {
  ParentChildDetails,
  ParentChildListItem,
  ParentChildSearchPage,
  ParentChildWeeklySchedule,
  ParentCreateChildDefaults,
  ParentCreateChildRequest,
  ParentCreateChildResult,
  ParentLinkChildRequest,
} from "@/modules/parent/domain/types/parentChildren.types";
import { mapStudentWeeklyScheduleDto } from "@/modules/student/domain/weekly-schedule/weekly-schedule.utils";
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

async function callParentChildrenApi<T>(
  action: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, fallbackMessage));
  }
}

export async function fetchParentChildren(): Promise<ParentChildListItem[]> {
  return callParentChildrenApi(async () => {
    const response = await httpClient.get<ParentChildListItem[]>({
      url: CHILDREN_URL,
    });
    const data = resolveApiData<ParentChildListItem[]>(response);
    return Array.isArray(data) ? data : [];
  }, "Failed to load children");
}

export async function searchParentChildren(params: {
  keyword: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<ParentChildSearchPage> {
  return callParentChildrenApi(async () => {
    const pageNumber = params.pageNumber ?? 1;
    const pageSize = params.pageSize ?? 20;
    const response = await httpClient.get<unknown>({
      url: `${CHILDREN_URL}/search`,
      params: {
        keyword: params.keyword.trim(),
        pageNumber,
        pageSize,
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
      items: items as ParentChildSearchPage["items"],
      currentPage: meta.currentPage,
      pageSize: meta.pageSize,
      totalItems: meta.totalItems,
      totalPages: meta.totalPages,
    };
  }, "Failed to search students");
}

export async function fetchParentCreateChildDefaults(): Promise<ParentCreateChildDefaults> {
  return callParentChildrenApi(async () => {
    const response = await httpClient.get<ParentCreateChildDefaults>({
      url: `${CHILDREN_URL}/create-defaults`,
    });
    const data = resolveApiData<ParentCreateChildDefaults>(response);
    return {
      countryId: data.countryId ?? null,
      phoneNumber: data.phoneNumber ?? null,
      phoneCountryCode: data.phoneCountryCode ?? null,
      address: data.address ?? null,
      academicTerm: data.academicTerm ?? 1,
    };
  }, "Failed to load create defaults");
}

export async function createParentChild(
  payload: ParentCreateChildRequest,
): Promise<ParentCreateChildResult> {
  return callParentChildrenApi(async () => {
    const response = await httpClient.post<ParentCreateChildResult>({
      url: CHILDREN_URL,
      data: payload,
    });
    const data = resolveApiData<ParentCreateChildResult>(response);
    return {
      studentUserId: data.studentUserId ?? null,
      email: data.email ?? payload.email,
      requiresEmailOtp: data.requiresEmailOtp ?? true,
    };
  }, "Failed to create child account");
}

export async function linkParentChild(
  payload: ParentLinkChildRequest,
): Promise<void> {
  return callParentChildrenApi(async () => {
    await httpClient.post({
      url: `${CHILDREN_URL}/link`,
      data: payload,
    });
  }, "Failed to link student");
}

export async function fetchParentChildDetails(
  studentUserId: string,
): Promise<ParentChildDetails> {
  return callParentChildrenApi(async () => {
    const response = await httpClient.get<ParentChildDetails>({
      url: `${CHILDREN_URL}/${encodeURIComponent(studentUserId)}`,
    });
    const data = resolveApiData<ParentChildDetails>(response);
    return {
      ...data,
      progressPercent: data.progressPercent ?? 0,
      points: data.points ?? 0,
      achievementsCount: data.achievementsCount ?? 0,
      isActive: data.isActive ?? true,
      subjects: data.subjects ?? [],
      achievements: data.achievements ?? [],
      alerts: data.alerts ?? [],
      weeklyActivity: data.weeklyActivity ?? [],
      recentActivities: data.recentActivities ?? [],
      upcomingTasks: data.upcomingTasks ?? [],
    };
  }, "Failed to load child details");
}

export async function fetchParentChildWeeklySchedule(
  studentUserId: string,
  weekStart?: string,
): Promise<ParentChildWeeklySchedule> {
  return callParentChildrenApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `${CHILDREN_URL}/${encodeURIComponent(studentUserId)}/schedule/weekly`,
      params: weekStart ? { weekStart } : undefined,
    });
    const mapped = mapStudentWeeklyScheduleDto(resolveApiData<unknown>(response));
    if (!mapped) {
      throw new Error("Invalid weekly schedule response");
    }
    return mapped;
  }, "Failed to load weekly schedule");
}

export async function unlinkParentChild(studentUserId: string): Promise<void> {
  return callParentChildrenApi(async () => {
    await httpClient.delete({
      url: `${CHILDREN_URL}/${encodeURIComponent(studentUserId)}/unlink`,
    });
  }, "Failed to unlink child");
}
