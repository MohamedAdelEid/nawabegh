import type {
  InAppNotification,
  InAppNotificationsQueryParams,
} from "@/shared/domain/types/notification.types";
import { mapInAppNotification } from "@/shared/domain/utils/notification.utils";
import {
  extractApiErrorMessage,
  resolveApiList,
} from "@/shared/infrastructure/api/apiResponse.utils";
import { mapApiItems } from "@/shared/infrastructure/api/mapApiItems";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

const IN_APP_URL = "PushNotifications/in-app";

async function callInAppNotificationsApi<T>(
  action: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, fallbackMessage));
  }
}

function buildInAppParams(
  params: InAppNotificationsQueryParams,
): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {
    pageNumber: params.pageNumber ?? 1,
    pageSize: params.pageSize ?? 20,
  };

  if (params.unreadOnly === true) {
    query.unreadOnly = true;
  }

  return query;
}

export async function getInAppNotifications(
  params: InAppNotificationsQueryParams = {},
): Promise<InAppNotification[]> {
  return callInAppNotificationsApi(async () => {
    const response = await httpClient.get<unknown>({
      url: IN_APP_URL,
      params: buildInAppParams(params),
    });

    return mapApiItems(resolveApiList(response), mapInAppNotification).filter(
      (item): item is InAppNotification => item != null,
    );
  }, "Failed to load notifications");
}

export async function getUnreadInAppNotifications(): Promise<InAppNotification[]> {
  return getInAppNotifications({ pageNumber: 1, pageSize: 20, unreadOnly: true });
}

export async function markInAppNotificationRead(id: string): Promise<void> {
  return callInAppNotificationsApi(async () => {
    await httpClient.patch<unknown>({
      url: `${IN_APP_URL}/${encodeURIComponent(id)}/read`,
    });
  }, "Failed to mark notification as read");
}
