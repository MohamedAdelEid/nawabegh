import {
  defaultSchoolFormValues,
  schoolSubscriptionPlans,
} from "@/modules/admin/domain/data/schoolFormOptions";
import type {
  SchoolFormValues,
  SchoolSubscriptionPlanId,
} from "@/modules/admin/domain/types/schoolForm.types";
import type { SchoolDetail } from "@/modules/admin/infrastructure/api/schoolApi";

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
    coordinatorName: detail.coordinatorName,
    loginPassword: "",
    subscriptionPlanId: resolveSubscriptionPlanId(detail.subscriptionPlanId),
    educationStageIds: detail.educationLevelIds,
  };
}
