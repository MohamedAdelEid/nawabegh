import { TrendingUp, Radio } from "lucide-react";
import GroupOfPeople from "@/modules/admin/presentation/assets/icons/GroupOfPeople";
import Message from "@/modules/admin/presentation/assets/icons/Message";
import type {
  ChatGroupDashboardData,
  ChatGroupFilterOption,
  ChatGroupStatCard,
} from "@/modules/admin/domain/types/chatGroups.types";

type TeacherChatGroupStatusFilterId = "all" | "active" | "locked" | "activeNow";

export type TeacherChatGroupsDashboardData = Omit<ChatGroupDashboardData, "filters"> & {
  filters: {
    statuses: ChatGroupFilterOption<TeacherChatGroupStatusFilterId>[];
    grades: ChatGroupFilterOption<string>[];
    subjects: ChatGroupFilterOption<string>[];
  };
};

const stats: ChatGroupStatCard[] = [
  {
    id: "totalGroups",
    labelKey: "stats.totalGroups.label",
    value: "—",
    indicatorKey: "stats.totalGroups.indicator",
    accentClassName: "before:bg-[#67C23A]",
    icon: GroupOfPeople,
    iconToneClassName: "primary",
  },
  {
    id: "activeMessages",
    labelKey: "stats.dailyMessages.label",
    value: "—",
    indicatorKey: "stats.dailyMessages.indicator",
    accentClassName: "before:bg-[#5B93FF]",
    icon: Message,
    iconToneClassName: "success",
  },
  {
    id: "interactionRate",
    labelKey: "stats.interactionRate.label",
    value: "—",
    indicatorKey: "stats.interactionRate.indicator",
    accentClassName: "before:bg-[#FFB547]",
    icon: TrendingUp,
    iconToneClassName: "warning",
  },
  {
    id: "activeNow",
    labelKey: "stats.activeNow.label",
    value: "—",
    indicatorKey: "stats.activeNow.indicator",
    accentClassName: "before:bg-[#243B5A]",
    icon: Radio,
    iconToneClassName: "info",
  },
];

export const teacherChatGroupsDashboardData: TeacherChatGroupsDashboardData = {
  stats,
  filters: {
    statuses: [
      { id: "all", labelKey: "filters.statuses.all" },
      { id: "active", labelKey: "filters.statuses.active" },
      { id: "locked", labelKey: "filters.statuses.locked" },
      { id: "activeNow", labelKey: "filters.statuses.activeNow" },
    ],
    grades: [],
    subjects: [],
  },
  rows: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    visibleItems: 0,
  },
};
