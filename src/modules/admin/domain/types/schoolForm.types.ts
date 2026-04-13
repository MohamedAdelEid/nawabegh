export type SchoolSubscriptionPlanId = "basic" | "gold" | "interactive";

export type SchoolEducationStageId =
  | "elementary"
  | "middle"
  | "secondary";

export interface SchoolFormValues {
  schoolName: string;
  schoolDescription: string;
  schoolLogoFile: File | null;
  schoolLogoPreviewUrl: string | null;
  city: string;
  address: string;
  phoneNumber: string;
  email: string;
  subscriptionPlanId: SchoolSubscriptionPlanId;
  educationStageIds: SchoolEducationStageId[];
}

export interface SchoolSelectOption<T extends string = string> {
  id: T;
  labelKey: string;
  descriptionKey?: string;
}

export interface SchoolLocationPreviewData {
  cityKey: string;
  regionKey: string;
  providerLabelKey: string;
  loadingLabelKey: string;
  emptyLabelKey: string;
  errorLabelKey: string;
}
