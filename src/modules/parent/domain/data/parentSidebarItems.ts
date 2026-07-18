import { UserRound } from "lucide-react";
import { buildStudentShellSidebar } from "@/modules/student/domain/data/studentSidebarItems";
import type { SidebarItems } from "@/shared/domain/types/sidebar.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";

const baseItems = buildStudentShellSidebar(
  ROUTES.USER.PARENT.HOME,
  ROUTES.USER.PARENT.SETTINGS,
);

export const parentSidebarItems: SidebarItems = {
  ...baseItems,
  secondary: baseItems.secondary.map((item) =>
    item.id === "settings"
      ? {
          ...item,
          id: "profile",
          labelKey: "sidebar.nav.profile",
          icon: UserRound,
        }
      : item,
  ),
};
