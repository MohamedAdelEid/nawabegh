import type { ModuleConfig } from "@/shared/infrastructure/config/module.types";
import type { AppLocale } from "@/config/locale";

import arLogin from "./presentation/i18n/ar/login/index.json";
import enLogin from "./presentation/i18n/en/login/index.json";

function loginForLocale(locale: AppLocale) {
  return locale === "ar" ? arLogin.auth.login : enLogin.auth.login;
}

export const authModule = {
  name: "auth",
  i18nNamespaces: ["login"],
  async getMessagesForLocale(locale: AppLocale) {
    return { login: loginForLocale(locale) };
  },
} satisfies ModuleConfig;
