export type SchoolSubscriptionPlanId = "basic" | "gold" | "interactive";

export type SchoolEducationStageId = number;

export interface SchoolFormValues {
  schoolName: string;
  schoolDescription: string;
  schoolLogoFile: File | null;
  schoolLogoPreviewUrl: string | null;
  /** Selected country name (from Countries API) for address and map geocoding. */
  country: string;
  /** Selected country id as string for the dropdown value (empty when unset). */
  countryId: string;
  city: string;
  address: string;
  phoneNumber: string;
  email: string;
  coordinatorName: string;
  loginPassword: string;
  subscriptionPlanId: SchoolSubscriptionPlanId;
  educationStageIds: SchoolEducationStageId[];
}

export interface SchoolSelectOption<T extends string | number = string> {
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
