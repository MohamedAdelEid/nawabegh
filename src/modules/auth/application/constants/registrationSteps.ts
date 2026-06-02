import type { RegistrationStepId } from "@/modules/auth/domain/types/registration.types";

export type RegistrationStepConfig = {
  id: RegistrationStepId;
  order: number;
  labelKey: string;
};

export const REGISTRATION_STEPS: RegistrationStepConfig[] = [
  { id: "account", order: 1, labelKey: "steps.account" },
  { id: "study", order: 2, labelKey: "steps.study" },
  { id: "contact", order: 3, labelKey: "steps.contact" },
];

export function getRegistrationStepIndex(stepId: RegistrationStepId): number {
  return REGISTRATION_STEPS.findIndex((step) => step.id === stepId);
}
