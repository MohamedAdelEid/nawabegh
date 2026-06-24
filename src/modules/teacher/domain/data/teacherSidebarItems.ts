import { SidebarBookIcon, SidebarChatGroupIcon, SidebarHomeIcon } from "@/shared/presentation/icons/sidebar";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import type { SidebarItems } from "@/shared/domain/types/sidebar.types";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CircleHelp,
  FileStack,
  Layers,
  LogOut,
  Newspaper,
  Radio,
  Settings,
} from "lucide-react";

export const teacherSidebarItems: SidebarItems = {
  main: [
    {
      id: "home",
      labelKey: "sidebar.nav.home",
      href: ROUTES.USER.TEACHER.HOME,
      icon: SidebarHomeIcon,
    },
    {
      id: "courses",
      labelKey: "sidebar.nav.courses",
      href: ROUTES.USER.TEACHER.COURSES.LIST,
      activePathPrefixes: ["/teacher/courses"],
      icon: BookOpen,
    },
    {
      id: "chatGroups",
      labelKey: "sidebar.nav.chatGroups",
      href: ROUTES.USER.TEACHER.CHAT_GROUPS.LIST,
      activePathPrefixes: [ROUTES.USER.TEACHER.CHAT_GROUPS.LIST],
      icon: SidebarChatGroupIcon,
    },
    {
      id: "courseStatistics",
      labelKey: "sidebar.nav.courseStatistics",
      href: ROUTES.USER.TEACHER.COURSES.STATISTICS_OVERVIEW,
      activePathPrefixes: [ROUTES.USER.TEACHER.COURSES.STATISTICS_OVERVIEW],
      icon: BarChart3,
    },
    {
      id: "liveSessions",
      labelKey: "sidebar.nav.liveSessions",
      href: ROUTES.USER.TEACHER.LIVE_SESSIONS,
      activePathPrefixes: [ROUTES.USER.TEACHER.LIVE_SESSIONS],
      icon: Radio,
    },
    {
      id: "schedule",
      labelKey: "sidebar.nav.schedule",
      href: ROUTES.USER.TEACHER.SCHEDULE,
      activePathPrefixes: [ROUTES.USER.TEACHER.SCHEDULE],
      icon: CalendarDays,
    },
    {
      id: "interactiveBooks",
      labelKey: "sidebar.nav.interactiveBooks",
      href: ROUTES.USER.TEACHER.INTERACTIVE_BOOKS.LIST,
      activePathPrefixes: [ROUTES.USER.TEACHER.INTERACTIVE_BOOKS.LIST],
      icon: SidebarBookIcon,
    },
    {
      id: "journeyEditor",
      labelKey: "sidebar.nav.journeyEditor",
      href: ROUTES.USER.TEACHER.JOURNEY_EDITOR.LIST,
      activePathPrefixes: [ROUTES.USER.TEACHER.JOURNEY_EDITOR.LIST],
      icon: Layers,
    },
    {
      id: "helperFileManagement",
      labelKey: "sidebar.nav.helperFileManagement",
      href: ROUTES.USER.TEACHER.HELPER_FILE_MANAGEMENT.LIST,
      activePathPrefixes: [ROUTES.USER.TEACHER.HELPER_FILE_MANAGEMENT.LIST],
      icon: FileStack,
    },
    {
      id: "knowledgeCommunity",
      labelKey: "sidebar.nav.knowledgeCommunity",
      href: ROUTES.USER.TEACHER.KNOWLEDGE_COMMUNITY.LIST,
      activePathPrefixes: [ROUTES.USER.TEACHER.KNOWLEDGE_COMMUNITY.LIST],
      icon: Newspaper,
    },
  ],
  secondary: [
    {
      id: "helper",
      labelKey: "sidebar.nav.helper",
      href: `${ROUTES.USER.TEACHER.HOME}?tab=helper`,
      icon: CircleHelp,
    },
    {
      id: "settings",
      labelKey: "sidebar.nav.settings",
      href: ROUTES.USER.TEACHER.SETTINGS,
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
