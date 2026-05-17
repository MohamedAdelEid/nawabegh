import { Users, MessageSquare, TrendingUp, Radio } from "lucide-react";
import GroupOfPeople from "@/modules/admin/presentation/assets/icons/GroupOfPeople";
import Message from "@/modules/admin/presentation/assets/icons/Message";
import type {
  ChatGroupDashboardData,
  ChatGroupFilterOption,
  ChatGroupGradeId,
  ChatGroupStatusId,
  ChatGroupSubjectId,
} from "../types/chatGroups.types";

const statusFilters: ChatGroupFilterOption<ChatGroupStatusId | "all">[] = [
  { id: "all", labelKey: "filters.statuses.all" },
  { id: "active", labelKey: "filters.statuses.active" },
  { id: "paused", labelKey: "filters.statuses.paused" },
];

const gradeFilters: ChatGroupFilterOption<ChatGroupGradeId>[] = [
  { id: "all", labelKey: "filters.grades.all" },
  { id: "grade1", labelKey: "filters.grades.grade1" },
  { id: "grade2", labelKey: "filters.grades.grade2" },
  { id: "grade3", labelKey: "filters.grades.grade3" },
  { id: "grade4", labelKey: "filters.grades.grade4" },
  { id: "grade5", labelKey: "filters.grades.grade5" },
  { id: "grade6", labelKey: "filters.grades.grade6" },
  { id: "grade7", labelKey: "filters.grades.grade7" },
  { id: "grade8", labelKey: "filters.grades.grade8" },
  { id: "grade9", labelKey: "filters.grades.grade9" },
  { id: "grade10", labelKey: "filters.grades.grade10" },
  { id: "grade11", labelKey: "filters.grades.grade11" },
  { id: "grade12", labelKey: "filters.grades.grade12" },
];

const subjectFilters: ChatGroupFilterOption<ChatGroupSubjectId>[] = [
  { id: "all", labelKey: "filters.subjects.all" },
  { id: "arabic", labelKey: "filters.subjects.arabic" },
  { id: "english", labelKey: "filters.subjects.english" },
  { id: "math", labelKey: "filters.subjects.math" },
  { id: "science", labelKey: "filters.subjects.science" },
  { id: "physics", labelKey: "filters.subjects.physics" },
  { id: "chemistry", labelKey: "filters.subjects.chemistry" },
  { id: "biology", labelKey: "filters.subjects.biology" },
  { id: "history", labelKey: "filters.subjects.history" },
  { id: "geography", labelKey: "filters.subjects.geography" },
];

export const chatGroupsDashboardData: ChatGroupDashboardData = {
  stats: [
    {
      id: "totalGroups",
      labelKey: "stats.totalGroups.label",
      value: "124",
      indicatorKey: "stats.totalGroups.indicator",
      accentClassName: "before:bg-[#67C23A]",
      icon: GroupOfPeople,
      iconToneClassName: "primary",
    },
    {
      id: "activeMessages",
      labelKey: "stats.activeMessages.label",
      value: "2,840",
      indicatorKey: "stats.activeMessages.indicator",
      accentClassName: "before:bg-[#5B93FF]",
      icon: Message,
      iconToneClassName: "success",
    },
    {
      id: "interactionRate",
      labelKey: "stats.interactionRate.label",
      value: "88%",
      indicatorKey: "stats.interactionRate.indicator",
      accentClassName: "before:bg-[#FFB547]",
      icon: TrendingUp,
      iconToneClassName: "warning",
    },
    {
      id: "activeNow",
      labelKey: "stats.activeNow.label",
      value: "98",
      indicatorKey: "stats.activeNow.indicator",
      accentClassName: "before:bg-[#243B5A]",
      icon: Radio,
      iconToneClassName: "info",
    },
  ],
  filters: {
    statuses: statusFilters,
    grades: gradeFilters,
    subjects: subjectFilters,
  },
  rows: [
    {
      id: "1",
      groupName: "اللغة العربية",
      courseSubtitle: "كورس النحو الشامل - 2024",
      colorIndicator: "#243B5A",
      studentCount: 1240,
      chatModeId: "everyone",
      attachments: [
        { type: "pdf" },
        { type: "doc" },
        { type: "img", count: 3 },
      ],
      statusId: "active",
      lastActivityKey: "rows.lastActivity.twoMinutes",
    },
    {
      id: "2",
      groupName: "الفيزياء الحديثة",
      courseSubtitle: "الفصل الدراسي الثاني - مراجعة",
      colorIndicator: "#FFB547",
      studentCount: 3000,
      chatModeId: "teacherOnly",
      attachments: [{ type: "xls", count: 1 }],
      statusId: "paused",
      lastActivityKey: "rows.lastActivity.yesterday",
    },
    {
      id: "3",
      groupName: "الرياضيات",
      courseSubtitle: "الجبر والهندسة - الصف الثالث",
      colorIndicator: "#5B93FF",
      studentCount: 890,
      chatModeId: "everyone",
      attachments: [
        { type: "pdf" },
        { type: "doc", count: 2 },
      ],
      statusId: "active",
      lastActivityKey: "rows.lastActivity.fiveMinutes",
    },
    {
      id: "4",
      groupName: "اللغة الإنجليزية",
      courseSubtitle: "Grammar & Writing",
      colorIndicator: "#67C23A",
      studentCount: 1560,
      chatModeId: "everyone",
      attachments: [{ type: "pdf" }],
      statusId: "active",
      lastActivityKey: "rows.lastActivity.tenMinutes",
    },
    {
      id: "5",
      groupName: "الكيمياء",
      courseSubtitle: "الصف الثاني عشر - علمي",
      colorIndicator: "#F25555",
      studentCount: 720,
      chatModeId: "teacherOnly",
      attachments: [],
      statusId: "paused",
      lastActivityKey: "rows.lastActivity.threeDays",
    },
  ],
  pagination: {
    currentPage: 1,
    totalPages: 13,
    totalItems: 124,
    visibleItems: 10,
  },
};
