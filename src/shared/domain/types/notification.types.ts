export type InAppNotification = {
  id: string;
  broadcastNotificationId: number;
  title: string;
  body: string;
  actionButtonText: string | null;
  actionUrl: string | null;
  createdAtUtc: string;
  isRead: boolean;
};

export type InAppNotificationsQueryParams = {
  pageNumber?: number;
  pageSize?: number;
  unreadOnly?: boolean;
};
