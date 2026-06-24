"use client";

import { useTranslations } from "next-intl";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";

export type DashboardTranslationNamespace = "admin.dashboard" | "teacher.dashboard";

export function useScopedDashboardTranslationNamespace(): DashboardTranslationNamespace {
  const routes = useScopedDashboardRoutes();
  return routes.scope === "teacher" ? "teacher.dashboard" : "admin.dashboard";
}

export function useScopedDashboardTranslations() {
  const namespace = useScopedDashboardTranslationNamespace();
  return useTranslations(namespace);
}

export function useScopedInteractiveBooksTranslations(section: string) {
  const namespace = useScopedDashboardTranslationNamespace();
  return useTranslations(`${namespace}.interactiveBooks.${section}`);
}
