import type { AppLocale } from "@/config/locale";
import type { ModuleConfig } from "@/shared/infrastructure/config/module.types";

import arDashboard from "./presentation/i18n/ar/dashboard/index.json";
import enDashboard from "./presentation/i18n/en/dashboard/index.json";

function dashboardForLocale(locale: AppLocale) {
  return locale === "ar" ? arDashboard.dashboard : enDashboard.dashboard;
}

export const parentModule = {
  name: "parent",
  i18nNamespaces: ["dashboard"],
  async getMessagesForLocale(locale: AppLocale) {
    return { dashboard: dashboardForLocale(locale) };
  },
} satisfies ModuleConfig;
