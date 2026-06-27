import {
  SidebarBookIcon,
  SidebarFolderIcon,
  SidebarHomeIcon,
  SidebarMapIcon,
  SidebarMessageIcon,
} from "@/shared/presentation/icons/sidebar";
import type { SidebarItems } from "@/shared/domain/types/sidebar.types";
import { CircleHelp, LogOut, Settings } from "lucide-react";

export function buildStudentShellSidebar(dashboardBase: string, settingsHref: string): SidebarItems {
  return {
    main: [
      {
        id: "home",
        labelKey: "sidebar.nav.home",
        href: `${dashboardBase}?tab=home`,
        icon: SidebarHomeIcon,
      },
      {
        id: "journey",
        labelKey: "sidebar.nav.journey",
        href: "/student/journey",
        activePathPrefixes: ["/student/journey"],
        icon: SidebarMapIcon,
      },
      {
        id: "allCourses",
        labelKey: "sidebar.nav.allCourses",
        href: "/student/courses",
        activePathPrefixes: ["/student/courses"],
        icon: SidebarMessageIcon,
      },
      {
        id: "interactiveBook",
        labelKey: "sidebar.nav.interactiveBook",
        href: `${dashboardBase}?tab=interactiveBook`,
        icon: SidebarBookIcon,
      },
      {
        id: "helpFiles",
        labelKey: "sidebar.nav.helpFiles",
        href: `${dashboardBase}?tab=helpFiles`,
        icon: SidebarFolderIcon,
      },
    ],
    secondary: [
      {
        id: "helper",
        labelKey: "sidebar.nav.helper",
        href: `${dashboardBase}?tab=helper`,
        icon: CircleHelp,
      },
      {
        id: "settings",
        labelKey: "sidebar.nav.settings",
        href: settingsHref,
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
}

export const studentSidebarItems = buildStudentShellSidebar("/student/dashboard", "/student/settings");
