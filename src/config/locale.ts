export const LOCALE_STORAGE_KEY = "locale";

export const appLocales = ["ar", "en"] as const;
export type AppLocale = (typeof appLocales)[number];

export function isAppLocale(value: string | null): value is AppLocale {
  return value === "ar" || value === "en";
}
