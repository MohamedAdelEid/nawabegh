import {
  Ban,
  GraduationCap,
  ShieldCheck,
  UserRoundPlus,
  Users,
} from "lucide-react";
import type { SidebarIcon } from "@/shared/domain/types/sidebar.types";

export type UserManagementRoleId = "all" | "student" | "teacher";
export type UserManagementSchoolId =
  | "all"
  | "alnour"
  | "riyadhPrivate"
  | "alfajr";
export type UserManagementGradeId = "all" | "allGrades" | "grade5" | "grade4";
export type UserManagementSubscriptionId = "all" | "active" | "inactive";
export type UserManagementStatusId = "active" | "inactive";

export interface UserManagementStat {
  id: string;
  labelKey: string;
  value: string;
  indicatorKey?: string;
  accentClassName: string;
  icon?: SidebarIcon;
  iconToneClassName?: string;
}

export interface UserManagementFilterOption<T extends string = string> {
  id: T;
  labelKey: string;
}

export interface UserManagementRow {
  id: string;
  fullName: string;
  phoneNumber: string;
  roleId: Exclude<UserManagementRoleId, "all">;
  schoolId: Exclude<UserManagementSchoolId, "all">;
  gradeId: Exclude<UserManagementGradeId, "all" | "allGrades"> | null;
  subscriptionId: Exclude<UserManagementSubscriptionId, "all">;
  statusId: UserManagementStatusId;
  lastActivityKey: string;
  avatarInitials: string;
  avatarClassName: string;
}

export interface UserManagementDashboardData {
  stats: UserManagementStat[];
  filters: {
    roles: UserManagementFilterOption<UserManagementRoleId>[];
    schools: UserManagementFilterOption<UserManagementSchoolId>[];
    grades: UserManagementFilterOption<UserManagementGradeId>[];
    subscriptions: UserManagementFilterOption<UserManagementSubscriptionId>[];
  };
  rows: UserManagementRow[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    visibleItems: number;
  };
}

export const userManagementDashboardData: UserManagementDashboardData = {
  stats: [
    {
      id: "totalStudents",
      labelKey: "userManagement.stats.totalStudents.label",
      value: "342",
      indicatorKey: "userManagement.stats.totalStudents.indicator",
      accentClassName: "before:bg-[#243B5A] before:h-full before:top-0",
      icon: Users,
      iconToneClassName: "bg-[#243B5A] text-white",
    },
    {
      id: "teachers",
      labelKey: "userManagement.stats.teachers.label",
      value: "156",
      indicatorKey: "userManagement.stats.teachers.indicator",
      accentClassName: "before:bg-[#D6B66A] before:h-full before:top-0",
      icon: GraduationCap,
      iconToneClassName: "bg-[#F8EFD5] text-[#A17A12]",
    },
    {
      id: "activeSubscriptions",
      labelKey: "userManagement.stats.activeSubscriptions.label",
      value: "92%",
      indicatorKey: "userManagement.stats.activeSubscriptions.indicator",
      accentClassName: "before:bg-[#5CCB29] before:h-full before:top-0",
      icon: ShieldCheck,
      iconToneClassName: "bg-emerald-100 text-emerald-600",
    },
    {
      id: "blockedAccounts",
      labelKey: "userManagement.stats.blockedAccounts.label",
      value: "14",
      indicatorKey: "userManagement.stats.blockedAccounts.indicator",
      accentClassName: "before:bg-[#F25555] before:h-full before:top-0",
      icon: Ban,
      iconToneClassName: "bg-rose-100 text-rose-600",
    },
  ],
  filters: {
    roles: [
      { id: "all", labelKey: "userManagement.filters.roles.all" },
      { id: "student", labelKey: "userManagement.roles.student" },
      { id: "teacher", labelKey: "userManagement.roles.teacher" },
    ],
    schools: [
      { id: "all", labelKey: "userManagement.filters.schools.all" },
      { id: "alnour", labelKey: "userManagement.schools.alnour" },
      { id: "riyadhPrivate", labelKey: "userManagement.schools.riyadhPrivate" },
      { id: "alfajr", labelKey: "userManagement.schools.alfajr" },
    ],
    grades: [
      { id: "allGrades", labelKey: "userManagement.filters.grades.all" },
      { id: "grade5", labelKey: "userManagement.grades.grade5" },
      { id: "grade4", labelKey: "userManagement.grades.grade4" },
    ],
    subscriptions: [
      { id: "all", labelKey: "userManagement.filters.subscriptions.all" },
      { id: "active", labelKey: "userManagement.subscriptions.active" },
      { id: "inactive", labelKey: "userManagement.subscriptions.inactive" },
    ],
  },
  rows: [
    {
      id: "salman-bin-khaled",
      fullName: "سلمان بن خالد",
      phoneNumber: "+966 55 123 4567",
      roleId: "student",
      schoolId: "alnour",
      gradeId: "grade5",
      subscriptionId: "active",
      statusId: "active",
      lastActivityKey: "userManagement.lastActivity.tenMinutes",
      avatarInitials: "سك",
      avatarClassName: "bg-[#D9F2F7] text-[#127A9C]",
    },
    {
      id: "sarah-aleman",
      fullName: "أ. سارة اليمان",
      phoneNumber: "+966 50 987 6543",
      roleId: "teacher",
      schoolId: "riyadhPrivate",
      gradeId: null,
      subscriptionId: "active",
      statusId: "active",
      lastActivityKey: "userManagement.lastActivity.twoHours",
      avatarInitials: "سا",
      avatarClassName: "bg-[#FCE7D6] text-[#9A4B1D]",
    },
    {
      id: "faisal-aldosary",
      fullName: "فهد الدوسري",
      phoneNumber: "+966 54 321 0987",
      roleId: "student",
      schoolId: "alfajr",
      gradeId: "grade4",
      subscriptionId: "inactive",
      statusId: "inactive",
      lastActivityKey: "userManagement.lastActivity.yesterday",
      avatarInitials: "فد",
      avatarClassName: "bg-[#DBEEF6] text-[#255E8A]",
    },
  ],
  pagination: {
    currentPage: 1,
    totalPages: 3,
    totalItems: 142,
    visibleItems: 10,
  },
};

export const userManagementAddUserIcon = UserRoundPlus;
