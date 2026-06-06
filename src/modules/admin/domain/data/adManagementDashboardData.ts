import { Clock, Eye, Megaphone, MousePointerClick } from "lucide-react";
import type { SidebarIcon } from "@/shared/domain/types/sidebar.types";

export interface AdManagementStat {
  id: string;
  labelKey: string;
  value: string;
  indicatorKey: string;
  indicatorToneClassName: string;
  icon: SidebarIcon;
  iconTone: "primary" | "success" | "warning" | "info";
}

export const adManagementDashboardData = {
  stats: [
    {
      id: "activeAds",
      labelKey: "stats.activeAds.label",
      value: "—",
      indicatorKey: "stats.activeAds.indicator",
      indicatorToneClassName: "text-emerald-500",
      icon: Megaphone,
      iconTone: "success" as const,
    },
    {
      id: "scheduledAds",
      labelKey: "stats.scheduledAds.label",
      value: "—",
      indicatorKey: "stats.scheduledAds.indicator",
      indicatorToneClassName: "text-slate-400",
      icon: Clock,
      iconTone: "info" as const,
    },
    {
      id: "totalViews",
      labelKey: "stats.totalViews.label",
      value: "—",
      indicatorKey: "stats.totalViews.indicator",
      indicatorToneClassName: "text-emerald-500",
      icon: Eye,
      iconTone: "primary" as const,
    },
    {
      id: "engagementRate",
      labelKey: "stats.engagementRate.label",
      value: "—",
      indicatorKey: "stats.engagementRate.indicator",
      indicatorToneClassName: "text-rose-500",
      icon: MousePointerClick,
      iconTone: "warning" as const,
    },
  ],
};
