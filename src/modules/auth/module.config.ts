import type { ModuleConfig } from "@/shared/infrastructure/config/module.types";
import type { AppLocale } from "@/config/locale";

import arLogin from "./presentation/i18n/ar/login/index.json";
import enLogin from "./presentation/i18n/en/login/index.json";
import arRegistration from "./presentation/i18n/ar/registration/index.json";
import enRegistration from "./presentation/i18n/en/registration/index.json";
import arAccountType from "./presentation/i18n/ar/account-type/index.json";
import enAccountType from "./presentation/i18n/en/account-type/index.json";
import arSchoolActivation from "./presentation/i18n/ar/school-activation/index.json";
import enSchoolActivation from "./presentation/i18n/en/school-activation/index.json";
import arParentRegistration from "./presentation/i18n/ar/parent-registration/index.json";
import enParentRegistration from "./presentation/i18n/en/parent-registration/index.json";
import arTeacherRegistration from "./presentation/i18n/ar/teacher-registration/index.json";
import enTeacherRegistration from "./presentation/i18n/en/teacher-registration/index.json";
import arDiscover from "./presentation/i18n/ar/discover/index.json";
import enDiscover from "./presentation/i18n/en/discover/index.json";
import arPassword from "./presentation/i18n/ar/password/index.json";
import enPassword from "./presentation/i18n/en/password/index.json";

function loginForLocale(locale: AppLocale) {
  return locale === "ar" ? arLogin.auth.login : enLogin.auth.login;
}

function registrationForLocale(locale: AppLocale) {
  return locale === "ar"
    ? arRegistration.auth.registration
    : enRegistration.auth.registration;
}

function accountTypeForLocale(locale: AppLocale) {
  return locale === "ar"
    ? arAccountType.auth.accountType
    : enAccountType.auth.accountType;
}

function schoolActivationForLocale(locale: AppLocale) {
  return locale === "ar"
    ? arSchoolActivation.auth.schoolActivation
    : enSchoolActivation.auth.schoolActivation;
}

function parentRegistrationForLocale(locale: AppLocale) {
  return locale === "ar"
    ? arParentRegistration.auth.parentRegistration
    : enParentRegistration.auth.parentRegistration;
}

function teacherRegistrationForLocale(locale: AppLocale) {
  return locale === "ar"
    ? arTeacherRegistration.auth.teacherRegistration
    : enTeacherRegistration.auth.teacherRegistration;
}

function discoverForLocale(locale: AppLocale) {
  return locale === "ar" ? arDiscover.auth.discover : enDiscover.auth.discover;
}

function passwordForLocale(locale: AppLocale) {
  return locale === "ar" ? arPassword.auth.password : enPassword.auth.password;
}

export const authModule = {
  name: "auth",
  i18nNamespaces: [
    "login",
    "registration",
    "accountType",
    "schoolActivation",
    "parentRegistration",
    "teacherRegistration",
    "discover",
    "password",
  ],
  async getMessagesForLocale(locale: AppLocale) {
    return {
      login: loginForLocale(locale),
      registration: registrationForLocale(locale),
      accountType: accountTypeForLocale(locale),
      schoolActivation: schoolActivationForLocale(locale),
      parentRegistration: parentRegistrationForLocale(locale),
      teacherRegistration: teacherRegistrationForLocale(locale),
      discover: discoverForLocale(locale),
      password: passwordForLocale(locale),
    };
  },
} satisfies ModuleConfig;
