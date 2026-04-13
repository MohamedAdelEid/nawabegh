"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { SidebarItems } from "@/shared/domain/types/sidebar.types";

function pathFromHref(href: string): string {
  return href.split("?")[0] ?? href;
}

function tabFromHref(href: string): string | null {
  const q = href.split("?")[1];
  if (!q) return null;
  return new URLSearchParams(q).get("tab");
}

export const useActiveItem = (items: SidebarItems): string => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") ?? "home";

  const allItems = [...items.main, ...items.secondary];

  for (const item of allItems) {
    if (!item.activePathPrefixes?.length) continue;

    const matchesPrefix = item.activePathPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );

    if (matchesPrefix) {
      return item.id;
    }
  }

  for (const item of allItems) {
    if (!item.href) continue;
    const base = pathFromHref(item.href);
    const itemTab = tabFromHref(item.href);
    if (itemTab !== null && pathname === base && itemTab === currentTab) {
      return item.id;
    }
  }

  for (const item of allItems) {
    if (!item.href) continue;
    if (tabFromHref(item.href) !== null) continue;
    if (pathname === item.href) return item.id;
    if (item.href !== "/" && pathname.startsWith(`${item.href}/`)) {
      return item.id;
    }
  }

  const dashboardItem = allItems.find((i) => i.id === currentTab);
  if (
    dashboardItem?.href &&
    tabFromHref(dashboardItem.href) !== null &&
    pathname === pathFromHref(dashboardItem.href)
  ) {
    return dashboardItem.id;
  }

  return allItems[0]?.id ?? "home";
};
