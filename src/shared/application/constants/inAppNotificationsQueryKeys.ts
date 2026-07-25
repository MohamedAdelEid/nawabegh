export const inAppNotificationsQueryKeys = {
  unread: () => ["in-app-notifications", "unread"] as const,
  inbox: () => ["in-app-notifications", "inbox"] as const,
};
