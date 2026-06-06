import type { ModuleConfig } from "@/shared/infrastructure/config/module.types";
import type { AppLocale } from "@/config/locale";

import arLogin from "./presentation/i18n/ar/login/index.json";
import enLogin from "./presentation/i18n/en/login/index.json";
import arRegistration from "./presentation/i18n/ar/registration/index.json";
import enRegistration from "./presentation/i18n/en/registration/index.json";

function loginForLocale(locale: AppLocale) {
  return locale === "ar" ? arLogin.auth.login : enLogin.auth.login;
}

function registrationForLocale(locale: AppLocale) {
  return locale === "ar"
    ? arRegistration.auth.registration
    : enRegistration.auth.registration;
}

export const authModule = {
  name: "auth",
  i18nNamespaces: ["login", "registration"],
  async getMessagesForLocale(locale: AppLocale) {
    return {
      login: loginForLocale(locale),
      registration: registrationForLocale(locale),
    };
  },
} satisfies ModuleConfig;
