import axios from "axios";
import {
  mapCourseProgressDto,
  mapLearningPathDropdownItem,
  mapLearningPathStationsProgressDto,
  mapSubscriptionsDashboardDto,
} from "@/modules/student/domain/progress/progress.utils";
import type {
  CourseProgressDto,
  LearningPathDropdownItemDto,
  LearningPathStationsProgressDto,
  SubscriptionsDashboardDto,
} from "@/modules/student/domain/progress/progress.types";
import {
  extractApiErrorMessage,
  resolveApiData,
} from "@/shared/infrastructure/api/apiResponse.utils";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

async function callProgressApi<T>(
  action: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, fallbackMessage));
  }
}

export async function getSubscriptionsDashboard(): Promise<SubscriptionsDashboardDto> {
  return callProgressApi(async () => {
    const response = await httpClient.get<unknown>({
      url: "student/subscriptions/dashboard",
    });
    const dto = mapSubscriptionsDashboardDto(resolveApiData(response));
    if (!dto) throw new Error("Failed to load subscriptions");
    return dto;
  }, "Failed to load subscriptions");
}

export async function initializeCourseProgress(courseId: string): Promise<void> {
  try {
    await httpClient.post<unknown>({
      url: `progress/courses/${courseId}/initialize`,
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) return;
    throw new Error(extractApiErrorMessage(error, "Failed to initialize progress"));
  }
}

export async function getCourseProgress(courseId: string): Promise<CourseProgressDto> {
  return callProgressApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `progress/courses/${courseId}/course-progress`,
    });
    const dto = mapCourseProgressDto(resolveApiData(response));
    if (!dto) throw new Error("Failed to load course progress");
    return dto;
  }, "Failed to load course progress");
}

export async function getLearningPathDropdown(
  courseId: string,
): Promise<LearningPathDropdownItemDto[]> {
  return callProgressApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `learning-paths/courses/${courseId}/dropdown`,
    });
    const data = resolveApiData(response);
    const items = Array.isArray(data) ? data : [];
    return items
      .map(mapLearningPathDropdownItem)
      .filter((item): item is LearningPathDropdownItemDto => item != null);
  }, "Failed to load learning paths");
}

export async function getLearningPathStationsProgress(
  learningPathId: string,
): Promise<LearningPathStationsProgressDto> {
  return callProgressApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `progress/learning-paths/${learningPathId}`,
    });
    const dto = mapLearningPathStationsProgressDto(resolveApiData(response));
    if (!dto) throw new Error("Failed to load path stations");
    return dto;
  }, "Failed to load path stations");
}
