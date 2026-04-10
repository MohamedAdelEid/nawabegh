import type { AppLocale } from "@/config/locale";

export type ModuleMessagesPart = Record<string, unknown>;

export type ModuleConfig = {
  name: string;
  i18nNamespaces: readonly string[];
  getMessagesForLocale: (locale: AppLocale) => Promise<ModuleMessagesPart>;
};
