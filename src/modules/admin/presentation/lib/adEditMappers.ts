import type {
  AdCreateSubmitStatus,
  AdDetail,
  UpdateAdPayload,
} from "@/modules/admin/domain/types/adManagement.types";
import type { AdCreateWizardValues } from "@/modules/admin/domain/types/adCreateWizard.types";
import {
  buildCreateAdPayload,
  defaultPlacementForType,
} from "@/modules/admin/presentation/lib/adCreateMappers";

export type AdEditFormValues = AdCreateWizardValues;

export function mapAdDetailToEditValues(detail: AdDetail): AdEditFormValues {
  const startDate = detail.startAt ? detail.startAt.slice(0, 10) : "";
  const startTime = detail.startAt?.includes("T") ? detail.startAt.slice(11, 16) : "09:00";
  const endDate = detail.endAt ? detail.endAt.slice(0, 10) : "";
  const endTime = detail.endAt?.includes("T") ? detail.endAt.slice(11, 16) : "23:59";

  return {
    title: detail.title,
    description: detail.description,
    ctaText: detail.ctaText,
    ctaUrl: detail.ctaUrl,
    mediaFile: null,
    mediaUrl: detail.mediaUrl,
    type: detail.type,
    placement: detail.placement ?? defaultPlacementForType(detail.type),
    frequencyType: detail.frequencyType ?? "unlimited",
    audience: detail.audiences[0] ?? "all",
    schoolId: detail.schoolIds[0] ?? "",
    gradeLevelId: detail.gradeLevelIds[0] ?? "",
    subjectIds: detail.subjectIds,
    publishMode: detail.publishMode,
    startDate,
    startTime,
    endDate,
    endTime,
    timezone: detail.timezone,
    instantNotification: true,
  };
}

export function buildUpdateAdPayload(
  id: string,
  values: AdEditFormValues,
  status: AdCreateSubmitStatus,
): UpdateAdPayload {
  return {
    id,
    ...buildCreateAdPayload(values, status),
  };
}
