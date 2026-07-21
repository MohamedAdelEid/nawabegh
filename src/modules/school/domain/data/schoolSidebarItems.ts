import { SidebarHomeIcon } from "@/shared/presentation/icons/sidebar";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import type { SidebarItems } from "@/shared/domain/types/sidebar.types";
import { Award, CalendarDays, FileText, LogOut, Megaphone, Settings, Trophy } from "lucide-react";

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
    {
      id: "articles",
      labelKey: "sidebar.nav.articles",
      href: ROUTES.USER.SCHOOL.ARTICLES.LIST,
      activePathPrefixes: [ROUTES.USER.SCHOOL.ARTICLES.LIST],
      icon: FileText,
    },
    {
      id: "events",
      labelKey: "sidebar.nav.events",
      href: ROUTES.USER.SCHOOL.EVENTS.LIST,
      activePathPrefixes: [ROUTES.USER.SCHOOL.EVENTS.LIST],
      icon: CalendarDays,
    },
    {
      id: "honored-students",
      labelKey: "sidebar.nav.honoredStudents",
      href: ROUTES.USER.SCHOOL.HONOR_BOARD.HONORED_STUDENTS,
      activePathPrefixes: [ROUTES.USER.SCHOOL.HONOR_BOARD.HONORED_STUDENTS],
      icon: Award,
    },
    {
      id: "honor-board",
      labelKey: "sidebar.nav.honorBoard",
      href: ROUTES.USER.SCHOOL.HONOR_BOARD.LEADERBOARD,
      activePathPrefixes: [ROUTES.USER.SCHOOL.HONOR_BOARD.LEADERBOARD],
      icon: Trophy,
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
