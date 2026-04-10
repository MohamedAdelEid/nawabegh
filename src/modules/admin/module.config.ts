import type { ModuleConfig } from "@/shared/infrastructure/config/module.types";

export const adminModule = {
  name: "admin",
  i18nNamespaces: ["dashboard"],
} satisfies ModuleConfig;
