import {
  REGISTRATION_ACADEMIC_TERM_PLACEHOLDER,
  type StudentRegistrationRequest,
} from "@/modules/auth/domain/types/student-registration.types";
import type {
  RegistrationAccountData,
  RegistrationContactData,
  RegistrationStudyData,
} from "@/modules/auth/domain/types/registration.types";
import { splitE164ForApi } from "@/modules/auth/domain/utils/phoneNumber.utils";

export function buildStudentRegistrationRequest(
  account: RegistrationAccountData,
  study: RegistrationStudyData,
  contact: RegistrationContactData,
): StudentRegistrationRequest {
  const phone = splitE164ForApi(study.phone ?? "");
  const whatsApp = splitE164ForApi(contact.whatsApp ?? "");
  const parent = splitE164ForApi(contact.parentPhone ?? "");
  const alternative = contact.alternativePhone?.trim()
    ? splitE164ForApi(contact.alternativePhone)
    : null;

  if (!phone || !whatsApp || !parent) {
    throw new Error("Invalid phone data for registration");
  }

  return {
    countryId: account.countryId,
    educationLevelId: account.educationLevelId,
    gradeId: account.gradeId,
    name: study.fullName?.trim() ?? "",
    email: study.email?.trim() ?? "",
    password: study.password ?? "",
    phoneNumber: phone.phoneNumber,
    phoneCountryCode: phone.phoneCountryCode,
    address: (study.address ?? contact.address ?? "").trim(),
    whatsAppNumber: whatsApp.phoneNumber,
    whatsAppCountryCode: whatsApp.phoneCountryCode,
    alternativePhone: alternative?.phoneNumber ?? "",
    parentPhone: parent.phoneNumber,
    username: contact.username?.trim() ?? "",
    // TODO: Replace placeholder when academic term business rules are defined.
    academicTerm: REGISTRATION_ACADEMIC_TERM_PLACEHOLDER,
    schoolId: account.schoolId ?? "",
  };
}
