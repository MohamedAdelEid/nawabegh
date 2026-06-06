import { adminSidebarItems } from "@/modules/admin/domain/data/adminSidebarItems";
import type { SidebarItem } from "@/shared/domain/types/sidebar.types";

const EXCLUDED_NAV_IDS = new Set(["home", "logout"]);

export type AdminHomeNavItem = SidebarItem & {
  href: string;
};

function isNavigableHomeItem(item: SidebarItem): item is SidebarItem & { href: string } {
  return Boolean(item.href) && !EXCLUDED_NAV_IDS.has(item.id);
}

export function getAdminHomeNavItems(): AdminHomeNavItem[] {
  return [...adminSidebarItems.main, ...adminSidebarItems.secondary].filter(isNavigableHomeItem);
}
