import { mapStudentWeeklyScheduleDto } from "@/modules/student/domain/weekly-schedule/weekly-schedule.utils";
import type { StudentWeeklyScheduleDto } from "@/modules/student/domain/weekly-schedule/weekly-schedule.types";
import {
  extractApiErrorMessage,
  resolveApiData,
} from "@/shared/infrastructure/api/apiResponse.utils";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

async function callWeeklyScheduleApi<T>(
  action: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, fallbackMessage));
  }
}

export async function getStudentWeeklySchedule(
  weekStart?: string,
): Promise<StudentWeeklyScheduleDto> {
  return callWeeklyScheduleApi(async () => {
    const response = await httpClient.get<unknown>({
      url: "student/schedule/weekly",
      params: weekStart ? { weekStart } : undefined,
    });
    const dto = mapStudentWeeklyScheduleDto(resolveApiData(response));
    if (!dto) throw new Error("Failed to load weekly schedule");
    return dto;
  }, "Failed to load weekly schedule");
}
