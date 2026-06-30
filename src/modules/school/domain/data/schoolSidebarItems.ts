import { SidebarHomeIcon } from "@/shared/presentation/icons/sidebar";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import type { SidebarItems } from "@/shared/domain/types/sidebar.types";
import { LogOut, Megaphone, Settings } from "lucide-react";

export const schoolSidebarItems: SidebarItems = {
  main: [
    {
      id: "home",
      labelKey: "sidebar.nav.home",
      href: ROUTES.USER.SCHOOL.HOME,
      icon: SidebarHomeIcon,
    },
    {
      id: "announcements",
      labelKey: "sidebar.nav.announcements",
      href: ROUTES.USER.SCHOOL.ANNOUNCEMENTS.LIST,
      activePathPrefixes: [ROUTES.USER.SCHOOL.ANNOUNCEMENTS.LIST],
      icon: Megaphone,
    },
  ],
  secondary: [
    {
      id: "settings",
      labelKey: "sidebar.nav.settings",
      href: ROUTES.USER.SCHOOL.SETTINGS,
      icon: Settings,
    },
    {
      id: "logout",
      labelKey: "sidebar.nav.logout",
      icon: LogOut,
      danger: true,
    },
  ],
};
