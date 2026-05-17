import {
  BadgeCheck,
  Lightbulb,
  School,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { Icon1Icon } from "@/modules/admin/presentation/assets/icons/Icon1Icon";
import type { SidebarIcon } from "@/shared/domain/types/sidebar.types";

export interface SchoolManagementStat {
  id: string;
  labelKey: string;
  value: string;
  indicatorKey: string;
  indicatorToneClassName: string;
  icon: SidebarIcon;
  iconTone: "primary" | "success" | "warning" | "info";
}

export interface SchoolManagementInsight {
  titleKey: string;
  descriptionKey: string;
  actionLabelKey: string;
  icon: SidebarIcon;
  variant: "default" | "primary";
  floatingIcon?: SidebarIcon;
}

export interface SchoolManagementDashboardData {
  stats: SchoolManagementStat[];
  insights: {
    supervisorTip: SchoolManagementInsight;
    updates: SchoolManagementInsight;
  };
}

export const schoolManagementDashboardData: SchoolManagementDashboardData = {
  stats: [
    {
      id: "totalSchools",
      labelKey: "schoolManagement.stats.totalSchools.label",
      value: "—",
      indicatorKey: "schoolManagement.stats.totalSchools.indicator",
      indicatorToneClassName: "text-emerald-500",
      icon: School,
      iconTone: "primary",
    },
    {
      id: "activeSchools",
      labelKey: "schoolManagement.stats.activeSchools.label",
      value: "—",
      indicatorKey: "schoolManagement.stats.activeSchools.indicator",
      indicatorToneClassName: "text-emerald-500",
      icon: BadgeCheck,
      iconTone: "primary",
    },
    {
      id: "totalTeachers",
      labelKey: "schoolManagement.stats.totalTeachers.label",
      value: "—",
      indicatorKey: "schoolManagement.stats.totalTeachers.indicator",
      indicatorToneClassName: "text-slate-400",
      icon: UserRound,
      iconTone: "warning",
    },
    {
      id: "totalStudents",
      labelKey: "schoolManagement.stats.totalStudents.label",
      value: "—",
      indicatorKey: "schoolManagement.stats.totalStudents.indicator",
      indicatorToneClassName: "text-emerald-500",
      icon: Users,
      iconTone: "success",
    },
  ],
  insights: {
    supervisorTip: {
      titleKey: "schoolManagement.insights.supervisorTip.title",
      descriptionKey: "schoolManagement.insights.supervisorTip.description",
      actionLabelKey: "schoolManagement.insights.supervisorTip.action",
      icon: Lightbulb,
      variant: "default",
    },
    updates: {
      titleKey: "schoolManagement.insights.updates.title",
      descriptionKey: "schoolManagement.insights.updates.description",
      actionLabelKey: "schoolManagement.insights.updates.action",
      icon: Sparkles,
      variant: "primary",
      floatingIcon: Icon1Icon
    },
  },
};
