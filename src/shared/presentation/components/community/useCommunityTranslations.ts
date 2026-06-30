"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { getDashboardScopeFromPathname } from "@/shared/infrastructure/config/scopedDashboardRoutes";

/**
 * Resolves the dashboard namespace that owns the shared `knowledgeCommunity`
 * translations for the current route. The community feature is rendered under
 * both teacher and student dashboards; each owns its own copy of the strings.
 * Admin reuses the teacher namespace (its article-editor surfaces already do).
 */
function knowledgeCommunityNamespace(pathname: string): string {
  const scope = getDashboardScopeFromPathname(pathname);
  const base = scope === "student" ? "student.dashboard" : "teacher.dashboard";
  return `${base}.knowledgeCommunity`;
}

/**
 * Scope-aware translator for shared community components.
 * Pass the sub-path within `knowledgeCommunity` (e.g. `"feed"`, `"article.comments"`).
 */
export function useCommunityTranslations(subPath?: string) {
  const pathname = usePathname();
  const namespace = knowledgeCommunityNamespace(pathname);
  return useTranslations(subPath ? `${namespace}.${subPath}` : namespace);
}
