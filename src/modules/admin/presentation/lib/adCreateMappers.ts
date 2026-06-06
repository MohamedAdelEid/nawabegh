import type {
  AdCreateSubmitStatus,
  AdDisplayType,
  CreateAdApiPayload,
  InAppAdPlacement,
} from "@/modules/admin/domain/types/adManagement.types";
import type { AdCreateWizardValues } from "@/modules/admin/domain/types/adCreateWizard.types";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";

export type AdCreateValidationCode =
  | "titleRequired"
  | "typeRequired"
  | "placementRequired"
  | "scheduleDatesRequired";

export const PLACEMENTS_BY_TYPE: Record<AdDisplayType, InAppAdPlacement[]> = {
  banner: ["home_top"],
  popup: ["app_open", "after_login", "timed_popup"],
  card: ["home_inline", "dashboard_sidebar", "lesson_bottom"],
};

export const DEFAULT_PLACEMENT_BY_TYPE: Record<AdDisplayType, InAppAdPlacement> = {
  banner: "home_top",
  popup: "app_open",
  card: "home_inline",
};

export function defaultPlacementForType(type: AdDisplayType): InAppAdPlacement {
  return DEFAULT_PLACEMENT_BY_TYPE[type];
}

export function combineDateAndTime(date: string, time: string): string {
  if (!date.trim()) return "";
  const safeTime = time.trim() || "00:00";
  return `${date}T${safeTime}:00`;
}

function toUtcIsoString(date: string, time: string): string {
  const combined = combineDateAndTime(date, time);
  if (!combined) return new Date().toISOString();
  const parsed = new Date(combined);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function parseNumericIds(ids: string[]): number[] {
  return ids
    .map((id) => Number(id))
    .filter((value) => Number.isFinite(value) && value > 0);
}

function parseGradeIds(gradeLevelId: string): number[] {
  const value = Number(gradeLevelId);
  return Number.isFinite(value) && value > 0 ? [value] : [];
}

function parseSchoolIds(schoolId: string): string[] {
  const trimmed = schoolId.trim();
  return trimmed ? [trimmed] : [];
}

function resolveMediaUrl(pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return "";
  return resolveFileUrl(trimmed) ?? trimmed;
}

const SEND_NOW_WINDOW_MS = 60_000;

function buildSendNowWindow(): { startAtUtc: string; endAtUtc: string } {
  const start = new Date();
  const end = new Date(start.getTime() + SEND_NOW_WINDOW_MS);
  return {
    startAtUtc: start.toISOString(),
    endAtUtc: end.toISOString(),
  };
}

function resolveScheduleWindow(
  values: AdCreateWizardValues,
  status: AdCreateSubmitStatus,
): { startAtUtc: string; endAtUtc: string } {
  if (values.publishMode === "now" && status !== "draft") {
    return buildSendNowWindow();
  }

  if (values.publishMode === "schedule" || status === "scheduled") {
    const startAtUtc = toUtcIsoString(values.startDate, values.startTime);
    let endAtUtc = toUtcIsoString(values.endDate, values.endTime);
    if (new Date(endAtUtc).getTime() <= new Date(startAtUtc).getTime()) {
      endAtUtc = new Date(new Date(startAtUtc).getTime() + SEND_NOW_WINDOW_MS).toISOString();
    }
    return { startAtUtc, endAtUtc };
  }

  if (status === "draft") {
    const start = new Date();
    start.setFullYear(start.getFullYear() + 10);
    const end = new Date(start.getTime() + SEND_NOW_WINDOW_MS);
    return {
      startAtUtc: start.toISOString(),
      endAtUtc: end.toISOString(),
    };
  }

  return buildSendNowWindow();
}

export function buildCreateAdPayload(
  values: AdCreateWizardValues,
  status: AdCreateSubmitStatus,
): CreateAdApiPayload {
  const mediaUrl = resolveMediaUrl(values.mediaUrl);
  const { startAtUtc, endAtUtc } = resolveScheduleWindow(values, status);
  const isPopup = values.type === "popup";

  return {
    title: values.title.trim(),
    description: values.description.trim(),
    type: values.type,
    placement: values.placement,
    priority: 0,
    mediaUrl,
    mobileMediaUrl: mediaUrl,
    ctaText: values.ctaText.trim(),
    ctaUrl: values.ctaUrl.trim(),
    startAtUtc,
    endAtUtc,
    timezone: values.timezone.trim() || "Asia/Riyadh",
    frequencyType: values.frequencyType,
    frequencyValue: values.frequencyType === "custom_limit" ? 1 : null,
    closeable: isPopup,
    autoCloseSeconds: isPopup ? 10 : null,
    gradeIds: parseGradeIds(values.gradeLevelId),
    subjectIds: parseNumericIds(values.subjectIds),
    schoolIds: parseSchoolIds(values.schoolId),
    exclusions: [],
  };
}

export function validateAdCreateStep(
  step: string,
  values: AdCreateWizardValues,
): AdCreateValidationCode | null {
  if (step === "content" && !values.title.trim()) return "titleRequired";
  if (step === "type" && !values.type) return "typeRequired";
  if (step === "type" && !values.placement.trim()) return "placementRequired";
  if (step === "scheduling" && values.publishMode === "schedule") {
    if (!values.startDate.trim() || !values.endDate.trim()) {
      return "scheduleDatesRequired";
    }
  }
  return null;
}
