/** Values accepted by POST /api/v1/admin/PushNotifications/send/* */
export type PushNotificationTargetAudience =
  | "all"
  | "students"
  | "teachers"
  | "parents"
  | "students_teachers_parents";

export type SendNotificationAudience = PushNotificationTargetAudience;

export type SendNotificationScheduleMode = "now" | "schedule";

export type PushNotificationSendRoute =
  | "all"
  | "by-country"
  | "by-school"
  | "specific-users";

export type SendNotificationFormValues = {
  audience: SendNotificationAudience;
  countryId: string;
  schoolId: string;
  schoolSearch: string;
  specificUsers: string;
  title: string;
  body: string;
  actionLabel: string;
  actionUrl: string;
  scheduleMode: SendNotificationScheduleMode;
  scheduledAt: string;
  sendMobilePush: boolean;
  sendInApp: boolean;
};

export const DEFAULT_SEND_NOTIFICATION_VALUES: SendNotificationFormValues = {
  audience: "all",
  countryId: "",
  schoolId: "",
  schoolSearch: "",
  specificUsers: "",
  title: "",
  body: "",
  actionLabel: "",
  actionUrl: "",
  scheduleMode: "now",
  scheduledAt: "",
  sendMobilePush: true,
  sendInApp: false,
};

export type PushNotificationSendPayload = {
  title: string;
  body: string;
  targetAudience: PushNotificationTargetAudience;
  countryIds: string;
  schoolIds: string;
  specificUserIdentifiers: string;
  actionButtonText: string;
  actionUrl: string;
  sendMobilePush: boolean;
  sendInApp: boolean;
  scheduledAtUtc: string | null;
};
