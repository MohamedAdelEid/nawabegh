import {
  SidebarBookIcon,
  SidebarFolderIcon,
  SidebarHomeIcon,
  SidebarMapIcon,
  SidebarMessageIcon,
} from "@/shared/presentation/icons/sidebar";
import type { SidebarItems } from "@/shared/domain/types/sidebar.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { CircleHelp, LogOut, Newspaper, Settings } from "lucide-react";

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
        href: ROUTES.USER.STUDENT.COURSES,
        activePathPrefixes: [ROUTES.USER.STUDENT.COURSES],
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

const studentShellSidebar = buildStudentShellSidebar("/student/dashboard", "/student/settings");

/**
 * Student sidebar. Knowledge community is a student-only destination, so it is
 * appended here rather than inside the shared builder (which the parent portal reuses).
 */
export const studentSidebarItems: SidebarItems = {
  ...studentShellSidebar,
  main: [
    ...studentShellSidebar.main,
    {
      id: "knowledgeCommunity",
      labelKey: "sidebar.nav.knowledgeCommunity",
      href: ROUTES.USER.STUDENT.KNOWLEDGE_COMMUNITY.LIST,
      activePathPrefixes: [ROUTES.USER.STUDENT.KNOWLEDGE_COMMUNITY.LIST],
      icon: Newspaper,
    },
  ],
};
