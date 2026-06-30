import {
  defaultSchoolFormValues,
  schoolEducationStages,
  schoolSubscriptionPlans,
} from "@/modules/admin/domain/data/schoolFormOptions";
import type {
  SchoolEducationStageId,
  SchoolFormValues,
  SchoolSubscriptionPlanId,
} from "@/modules/admin/domain/types/schoolForm.types";
import type { SchoolDetail } from "@/modules/admin/infrastructure/api/schoolApi";

function parseEducationStages(performanceLevel: string): SchoolEducationStageId[] {
  const normalized = performanceLevel.toLowerCase();
  const stages = schoolEducationStages.filter((stage) => normalized.includes(stage.id));
  if (stages.length > 0) {
    return stages.map((stage) => stage.id);
  }

  const arabicMatches = schoolEducationStages.filter((stage) => {
    const labelHints: Record<SchoolEducationStageId, string[]> = {
      elementary: ["ابتد", "elementary"],
      middle: ["متوسط", "middle"],
      secondary: ["ثانو", "secondary"],
    };
    return labelHints[stage.id].some((hint) => normalized.includes(hint));
  });

  if (arabicMatches.length > 0) {
    return arabicMatches.map((stage) => stage.id);
  }

  return defaultSchoolFormValues.educationStageIds;
}

function resolveSubscriptionPlanId(
  subscriptionPlanId: string,
): SchoolSubscriptionPlanId {
  const matched = schoolSubscriptionPlans.find(
    (plan) => plan.apiId === subscriptionPlanId || plan.id === subscriptionPlanId,
  );
  return matched?.id ?? defaultSchoolFormValues.subscriptionPlanId;
}

export function mapSchoolDetailToFormValues(
  detail: SchoolDetail,
  countryOptions: Array<{ id: string; label: string }>,
): SchoolFormValues {
  const countryMatch = countryOptions.find(
    (option) => option.label.trim() === detail.country.trim(),
  );
  const resolvedCountryId =
    detail.countryId > 0 ? String(detail.countryId) : countryMatch?.id ?? "";

  return {
    schoolName: detail.name,
    schoolDescription: detail.description,
    schoolLogoFile: null,
    schoolLogoPreviewUrl: detail.logoUrl || null,
    country: detail.country,
    countryId: resolvedCountryId,
    city: detail.city,
    address: detail.address,
    phoneNumber: detail.phoneNumber,
    email: detail.email,
    loginEmail: "",
    loginPassword: "",
    subscriptionPlanId: resolveSubscriptionPlanId(detail.subscriptionPlanId),
    educationStageIds: parseEducationStages(detail.performanceLevel),
  };
}
