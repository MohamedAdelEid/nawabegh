import {
  SidebarBookIcon,
  SidebarChatGroupIcon,
  SidebarFolderIcon,
  SidebarHomeIcon,
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
      id: "courseManagement",
      labelKey: "sidebar.nav.courseManagement",
      href: `${base}?tab=courseManagement`,
      activePathPrefixes: [ROUTES.ADMIN.COURSE_MANAGEMENT.LIST],
      icon: SidebarBookIcon,
    },
    {
      id: "helperFileManagement",
      labelKey: "sidebar.nav.helperFileManagement",
      href: ROUTES.ADMIN.HELPER_FILE_MANAGEMENT.LIST,
      activePathPrefixes: [ROUTES.ADMIN.HELPER_FILE_MANAGEMENT.LIST],
      icon: SidebarFolderIcon,
    },
    {
      id: "pricingManagement",
      labelKey: "sidebar.nav.pricingManagement",
      href: ROUTES.ADMIN.PRICING_MANAGEMENT.LIST,
      activePathPrefixes: [ROUTES.ADMIN.PRICING_MANAGEMENT.LIST],
      icon: SidebarFolderIcon,
    },
    {
      id: "articleEditor",
      labelKey: "sidebar.nav.articleEditor",
      href: `${base}?tab=articleEditor`,
      activePathPrefixes: [ROUTES.ADMIN.ARTICLE_EDITOR.LIST],
      icon: SidebarFolderIcon,
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
    {
      id: "chatGroups",
      labelKey: "sidebar.nav.chatGroups",
      href: `${base}?tab=chatGroups`,
      activePathPrefixes: [ROUTES.ADMIN.CHAT_GROUPS.LIST],
      icon: SidebarChatGroupIcon,
    },
    {
      id: "sendNotification",
      labelKey: "sidebar.nav.sendNotification",
      href: ROUTES.ADMIN.SEND_NOTIFICATION.LIST,
      activePathPrefixes: [ROUTES.ADMIN.SEND_NOTIFICATION.LIST],
      icon: SidebarMessageIcon,
    },
    {
      id: "questionBank",
      labelKey: "sidebar.nav.questionBank",
      href: ROUTES.ADMIN.QUESTION_BANK.LIST,
      activePathPrefixes: [ROUTES.ADMIN.QUESTION_BANK.LIST],
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
