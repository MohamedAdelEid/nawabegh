import type {
  SchoolEducationStageId,
  SchoolFormValues,
  SchoolLocationPreviewData,
  SchoolSelectOption,
  SchoolSubscriptionPlanId,
} from "@/modules/admin/domain/types/schoolForm.types";

/** Backend subscription plan ids — align with `/api/v1/...` subscription catalog. */
export const schoolSubscriptionPlans: Array<
  SchoolSelectOption<SchoolSubscriptionPlanId> & { apiId: string | null }
> = [
  {
    id: "basic",
    apiId: null,
    labelKey: "schoolManagement.addForm.plans.basic.title",
    descriptionKey: "schoolManagement.addForm.plans.basic.description",
  },
  {
    id: "gold",
    apiId: null,
    labelKey: "schoolManagement.addForm.plans.gold.title",
    descriptionKey: "schoolManagement.addForm.plans.gold.description",
  },
  {
    id: "interactive",
    apiId: null,
    labelKey: "schoolManagement.addForm.plans.interactive.title",
    descriptionKey: "schoolManagement.addForm.plans.interactive.description",
  },
];

export const schoolEducationStages: SchoolSelectOption<SchoolEducationStageId>[] = [
  {
    id: "elementary",
    labelKey: "schoolManagement.addForm.stages.elementary",
  },
  {
    id: "middle",
    labelKey: "schoolManagement.addForm.stages.middle",
  },
  {
    id: "secondary",
    labelKey: "schoolManagement.addForm.stages.secondary",
  },
];

export const defaultSchoolFormValues: SchoolFormValues = {
  schoolName: "",
  schoolDescription: "",
  schoolLogoFile: null,
  schoolLogoPreviewUrl: null,
  country: "",
  countryId: "",
  city: "",
  address: "",
  phoneNumber: "",
  email: "",
  subscriptionPlanId: "interactive",
  educationStageIds: ["elementary"],
};

export const schoolLocationPreviewData: SchoolLocationPreviewData = {
  cityKey: "schoolManagement.addForm.location.previewCity",
  regionKey: "schoolManagement.addForm.location.previewRegion",
  providerLabelKey: "schoolManagement.addForm.location.providerLabel",
  loadingLabelKey: "schoolManagement.addForm.location.loading",
  emptyLabelKey: "schoolManagement.addForm.location.empty",
  errorLabelKey: "schoolManagement.addForm.location.error",
};
