"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inAppNotificationsQueryKeys } from "@/shared/application/constants/inAppNotificationsQueryKeys";
import type { InAppNotification } from "@/shared/domain/types/notification.types";
import {
  getInAppNotifications,
  getUnreadInAppNotifications,
  markInAppNotificationRead,
} from "@/shared/infrastructure/api/pushNotifications.api";

const UNREAD_STALE_MS = 30_000;

function patchNotificationRead(items: InAppNotification[] | undefined, id: string) {
  if (!items) return items;
  return items.map((item) => (item.id === id ? { ...item, isRead: true } : item));
}

export function useUnreadInAppNotifications() {
  return useQuery({
    queryKey: inAppNotificationsQueryKeys.unread(),
    queryFn: getUnreadInAppNotifications,
    staleTime: UNREAD_STALE_MS,
  });
}

export function useInAppNotificationsInbox(enabled: boolean) {
  return useQuery({
    queryKey: inAppNotificationsQueryKeys.inbox(),
    queryFn: () => getInAppNotifications({ pageNumber: 1, pageSize: 20 }),
    enabled,
    staleTime: 15_000,
  });
}

export function useMarkInAppNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markInAppNotificationRead,
    onSuccess: (_, id) => {
      queryClient.setQueryData<InAppNotification[]>(
        inAppNotificationsQueryKeys.unread(),
        (current) => current?.filter((item) => item.id !== id),
      );
      queryClient.setQueryData<InAppNotification[]>(
        inAppNotificationsQueryKeys.inbox(),
        (current) => patchNotificationRead(current, id),
      );
    },
  });
}

export function useInAppNotificationsUnreadCount() {
  const unreadQuery = useUnreadInAppNotifications();
  return unreadQuery.data?.filter((item) => !item.isRead).length ?? 0;
}
