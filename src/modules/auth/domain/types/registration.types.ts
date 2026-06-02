import type { Country } from "@/shared/domain/types/country.types";
import type { EducationLevel } from "@/shared/domain/types/education-level.types";
import type { Grade } from "@/shared/domain/types/grade.types";
import type { School } from "@/shared/domain/types/school.types";
import type { VerificationTarget } from "@/modules/auth/domain/types/student-registration.types";

export type RegistrationStepId = "account" | "study" | "contact";

export type AccountStepFormValues = {
  countryId: number;
  educationLevelId: number;
  gradeId: number;
  schoolId: string;
};

export type RegistrationAccountData = AccountStepFormValues;

export type RegistrationStudyData = {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  password?: string;
};

export type RegistrationContactData = {
  whatsApp?: string;
  alternativePhone?: string;
  parentPhone?: string;
  username?: string;
  address?: string;
};

export type RegistrationDraft = {
  account: Partial<RegistrationAccountData>;
  study: Partial<RegistrationStudyData>;
  contact: Partial<RegistrationContactData>;
  completedSteps: RegistrationStepId[];
};

export type RegistrationInitialData = {
  countries: Country[];
  educationLevels: EducationLevel[];
  grades: Grade[];
  schools: School[];
  defaults: AccountStepFormValues;
};

export type RegistrationVerificationState = {
  target: VerificationTarget;
  email: string;
};
