import type {
  AdDisplayType,
  AdPublishMode,
  AdTargetAudience,
  InAppAdFrequencyType,
  InAppAdPlacement,
} from "@/modules/admin/domain/types/adManagement.types";

export const AD_CREATE_WIZARD_STEPS = [
  "content",
  "type",
  "targeting",
  "scheduling",
  "preview",
] as const;

export type AdCreateWizardStepId = (typeof AD_CREATE_WIZARD_STEPS)[number];

export type AdCreateWizardValues = {
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  mediaFile: File | null;
  mediaUrl: string;
  type: AdDisplayType;
  placement: InAppAdPlacement;
  frequencyType: InAppAdFrequencyType;
  audience: AdTargetAudience;
  schoolId: string;
  gradeLevelId: string;
  subjectIds: string[];
  publishMode: AdPublishMode;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timezone: string;
  instantNotification: boolean;
};

export const DEFAULT_AD_CREATE_WIZARD_VALUES: AdCreateWizardValues = {
  title: "",
  description: "",
  ctaText: "",
  ctaUrl: "",
  mediaFile: null,
  mediaUrl: "",
  type: "popup",
  placement: "app_open",
  frequencyType: "unlimited",
  audience: "all",
  schoolId: "",
  gradeLevelId: "",
  subjectIds: [],
  publishMode: "now",
  startDate: "",
  startTime: "09:00",
  endDate: "",
  endTime: "23:59",
  timezone: "Asia/Riyadh",
  instantNotification: true,
};
