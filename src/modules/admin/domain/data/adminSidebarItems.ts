import {
  SidebarBookIcon,
  SidebarFolderIcon,
  SidebarHomeIcon,
  SidebarMapIcon,
  SidebarMessageIcon,
} from "@/shared/presentation/icons/sidebar";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import type { SidebarItems } from "@/shared/domain/types/sidebar.types";
import { CircleHelp, LogOut, Settings } from "lucide-react";

const base = "/admin/dashboard";

export const adminSidebarItems: SidebarItems = {
  main: [
    {
      id: "home",
      labelKey: "sidebar.nav.home",
      href: `${base}?tab=home`,
      icon: SidebarHomeIcon,
    },
    {
      id: "userManagement",
      labelKey: "sidebar.nav.userManagement",
      href: `${base}?tab=userManagement`,
      activePathPrefixes: [ROUTES.ADMIN.USER_MANAGEMENT.LIST],
      icon: SidebarMessageIcon,
    },
    {
      id: "schoolManagement",
      labelKey: "sidebar.nav.schoolManagement",
      href: `${base}?tab=schoolManagement`,
      activePathPrefixes: [ROUTES.ADMIN.SCHOOL_MANAGEMENT.LIST],
      icon: SidebarBookIcon,
    },
    {
      id: "contentManagement",
      labelKey: "sidebar.nav.contentManagement",
      href: `${base}?tab=contentManagement`,
      icon: SidebarFolderIcon,
    },
    {
      id: "journeyEditor",
      labelKey: "sidebar.nav.journeyEditor",
      href: `${base}?tab=journeyEditor`,
      icon: SidebarMapIcon,
    },
    {
      id: "liveBroadcast",
      labelKey: "sidebar.nav.liveBroadcast",
      href: `${base}?tab=liveBroadcast`,
      icon: SidebarMessageIcon,
    },
    {
      id: "interactiveBooks",
      labelKey: "sidebar.nav.interactiveBooks",
      href: `${base}?tab=interactiveBooks`,
      icon: SidebarBookIcon,
    },
  ],
  secondary: [
    {
      id: "helper",
      labelKey: "sidebar.nav.helper",
      href: `${base}?tab=helper`,
      icon: CircleHelp,
    },
    {
      id: "settings",
      labelKey: "sidebar.nav.settings",
      href: "/admin/settings",
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
