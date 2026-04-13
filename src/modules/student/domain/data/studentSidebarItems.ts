import {
  SidebarBookIcon,
  SidebarFolderIcon,
  SidebarHomeIcon,
  SidebarMapIcon,
  SidebarMessageIcon,
} from "@/shared/presentation/icons/sidebar";
import type { SidebarItems } from "@/shared/domain/types/sidebar.types";
import { CircleHelp, LogOut, Settings } from "lucide-react";

const base = "/student/dashboard";

export const studentSidebarItems: SidebarItems = {
  main: [
    {
      id: "home",
      labelKey: "sidebar.nav.home",
      href: `${base}?tab=home`,
      icon: SidebarHomeIcon,
    },
    {
      id: "journey",
      labelKey: "sidebar.nav.journey",
      href: `${base}?tab=journey`,
      icon: SidebarMapIcon,
    },
    {
      id: "studyMaterials",
      labelKey: "sidebar.nav.studyMaterials",
      href: `${base}?tab=studyMaterials`,
      icon: SidebarMessageIcon,
    },
    {
      id: "interactiveBook",
      labelKey: "sidebar.nav.interactiveBook",
      href: `${base}?tab=interactiveBook`,
      icon: SidebarBookIcon,
    },
    {
      id: "helpFiles",
      labelKey: "sidebar.nav.helpFiles",
      href: `${base}?tab=helpFiles`,
      icon: SidebarFolderIcon,
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
      href: "/student/settings",
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
