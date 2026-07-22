import type {
  ParentChildrenStatsDashboard,
  ParentHomeDashboard,
} from "@/modules/parent/domain/types/parentHome.types";
import {
  extractApiErrorMessage,
  resolveApiData,
} from "@/shared/infrastructure/api/apiResponse.utils";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

const HOME_URL = "/api/v1/Parent/home";
const CHILDREN_STATS_URL = `${HOME_URL}/children-stats`;

async function callParentHomeApi<T>(
  action: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, fallbackMessage));
  }
}

export async function fetchParentHomeDashboard(): Promise<ParentHomeDashboard> {
  return callParentHomeApi(async () => {
    const response = await httpClient.get<ParentHomeDashboard>({ url: HOME_URL });
    return resolveApiData<ParentHomeDashboard>(response);
  }, "Failed to load parent home");
}

export async function fetchParentChildrenStats(): Promise<ParentChildrenStatsDashboard> {
  return callParentHomeApi(async () => {
    const response = await httpClient.get<ParentChildrenStatsDashboard>({
      url: CHILDREN_STATS_URL,
    });
    return resolveApiData<ParentChildrenStatsDashboard>(response);
  }, "Failed to load children statistics");
}
