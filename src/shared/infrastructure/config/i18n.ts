import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import type { AppLocale } from "@/config/locale";
import { appModules } from "./modules";

import arCommon from "../../presentation/i18n/ar/common/index.json";
import arPagination from "../../presentation/i18n/ar/pagination/index.json";
import arTable from "../../presentation/i18n/ar/table/index.json";
import enCommon from "../../presentation/i18n/en/common/index.json";
import enPagination from "../../presentation/i18n/en/pagination/index.json";
import enTable from "../../presentation/i18n/en/table/index.json";

export type Locale = AppLocale;
export const defaultLocale: Locale = "ar";

function mergeShared(
  common: typeof arCommon,
  table: typeof arTable,
  pagination: typeof arPagination,
): Record<string, unknown> {
  return {
    ...common,
    ...table,
    ...pagination,
  };
}

function pickLocale(
  cookieLocale: string | undefined,
  requestLocale: string | undefined,
): Locale {
  if (cookieLocale === "ar" || cookieLocale === "en") return cookieLocale;
  if (requestLocale === "ar" || requestLocale === "en") return requestLocale;
  return defaultLocale;
}

/** بدون middleware ولا `[locale]` في الراوت: اللغة من كوكي `NEXT_LOCALE` (يُزامَن من localStorage على العميل). */
export default getRequestConfig(async ({ requestLocale }) => {
  const jar = await cookies();
  const fromCookie = jar.get("NEXT_LOCALE")?.value;
  const locale = pickLocale(fromCookie, await requestLocale);

  const sharedMessages =
    locale === "ar"
      ? mergeShared(arCommon, arTable, arPagination)
      : mergeShared(enCommon, enTable, enPagination);

  const fromModules: Record<string, unknown> = {};
  for (const mod of appModules) {
    fromModules[mod.name] = await mod.getMessagesForLocale(locale);
  }

  return {
    locale,
    messages: {
      ...sharedMessages,
      ...fromModules,
    },
  };
});
