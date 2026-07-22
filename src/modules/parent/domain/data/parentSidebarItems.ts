import {
  SidebarBankIcon,
  SidebarChatGroupIcon,
  SidebarHomeIcon,
} from "@/shared/presentation/icons/sidebar";
import type { SidebarItems } from "@/shared/domain/types/sidebar.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  BarChart3,
  BookOpen,
  CircleHelp,
  LogOut,
  Settings,
  Users,
} from "lucide-react";

export const parentSidebarItems: SidebarItems = {
  main: [
    {
      id: "home",
      labelKey: "sidebar.nav.home",
      href: ROUTES.USER.PARENT.HOME,
      activePathPrefixes: [ROUTES.USER.PARENT.HOME],
      icon: SidebarHomeIcon,
    },
    {
      id: "childrenStats",
      labelKey: "sidebar.nav.childrenStats",
      href: ROUTES.USER.PARENT.CHILDREN_STATS,
      activePathPrefixes: [ROUTES.USER.PARENT.CHILDREN_STATS],
      icon: BarChart3,
    },
    {
      id: "children",
      labelKey: "sidebar.nav.children",
      href: ROUTES.USER.PARENT.CHILDREN,
      activePathPrefixes: [ROUTES.USER.PARENT.CHILDREN],
      icon: Users,
    },
    {
      id: "courses",
      labelKey: "sidebar.nav.courses",
      href: ROUTES.USER.PARENT.COURSES_CATALOG,
      activePathPrefixes: [ROUTES.USER.PARENT.COURSES_CATALOG],
      icon: BookOpen,
    },
    {
      id: "payments",
      labelKey: "sidebar.nav.payments",
      href: ROUTES.USER.PARENT.PAYMENTS,
      activePathPrefixes: [
        ROUTES.USER.PARENT.PAYMENTS,
        ROUTES.USER.PARENT.PAYMENTS_TRANSACTIONS,
      ],
      icon: SidebarBankIcon,
    },
    {
      id: "conversations",
      labelKey: "sidebar.nav.conversations",
      href: ROUTES.USER.PARENT.CONVERSATIONS,
      activePathPrefixes: [ROUTES.USER.PARENT.CONVERSATIONS],
      icon: SidebarChatGroupIcon,
    },
  ],
  secondary: [
    {
      id: "help",
      labelKey: "sidebar.nav.helper",
      href: ROUTES.USER.PARENT.HELP,
      activePathPrefixes: [ROUTES.USER.PARENT.HELP],
      icon: CircleHelp,
    },
    {
      id: "settings",
      labelKey: "sidebar.nav.settings",
      href: ROUTES.USER.PARENT.SETTINGS,
      activePathPrefixes: [ROUTES.USER.PARENT.SETTINGS],
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
