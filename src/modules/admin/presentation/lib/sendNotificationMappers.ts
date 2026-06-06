import type {
  PushNotificationSendPayload,
  PushNotificationSendRoute,
  SendNotificationFormValues,
} from "@/modules/admin/domain/types/sendNotification.types";

export function resolvePushNotificationRoute(
  values: SendNotificationFormValues,
): PushNotificationSendRoute {
  if (values.specificUsers.trim()) {
    return "specific-users";
  }
  if (values.schoolId.trim()) {
    return "by-school";
  }
  if (values.countryId.trim()) {
    return "by-country";
  }
  return "all";
}

function normalizeCommaList(raw: string): string {
  return raw
    .split(/[,;\n]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .join(",");
}

function toScheduledAtUtc(values: SendNotificationFormValues): string | null {
  if (values.scheduleMode === "now") {
    return null;
  }
  const parsed = new Date(values.scheduledAt);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
}

export function buildPushNotificationPayload(
  values: SendNotificationFormValues,
): PushNotificationSendPayload {
  return {
    title: values.title.trim(),
    body: values.body.trim(),
    targetAudience: values.audience,
    countryIds: values.countryId.trim(),
    schoolIds: values.schoolId.trim(),
    specificUserIdentifiers: normalizeCommaList(values.specificUsers),
    actionButtonText: values.actionLabel.trim(),
    actionUrl: values.actionUrl.trim(),
    sendMobilePush: values.sendMobilePush,
    sendInApp: values.sendInApp,
    scheduledAtUtc: toScheduledAtUtc(values),
  };
}

export type SendNotificationValidationCode =
  | "titleRequired"
  | "bodyRequired"
  | "scheduleRequired"
  | "scheduleInvalid"
  | "countryRequired"
  | "schoolRequired"
  | "specificUsersRequired"
  | "channelRequired";

export function validateSendNotificationForm(
  values: SendNotificationFormValues,
): SendNotificationValidationCode | null {
  if (!values.title.trim()) return "titleRequired";
  if (!values.body.trim()) return "bodyRequired";

  if (!values.sendMobilePush && !values.sendInApp) {
    return "channelRequired";
  }

  if (values.scheduleMode === "schedule") {
    if (!values.scheduledAt.trim()) return "scheduleRequired";
    if (Number.isNaN(new Date(values.scheduledAt).getTime())) return "scheduleInvalid";
  }

  const route = resolvePushNotificationRoute(values);

  if (route === "by-country" && !values.countryId.trim()) {
    return "countryRequired";
  }
  if (route === "by-school" && !values.schoolId.trim()) {
    return "schoolRequired";
  }
  if (route === "specific-users" && !values.specificUsers.trim()) {
    return "specificUsersRequired";
  }

  return null;
}
