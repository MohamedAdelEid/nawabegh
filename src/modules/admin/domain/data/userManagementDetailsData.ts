import {
  Award,
  BookOpenCheck,
  CheckCheck,
  Clock3,
  GraduationCap,
  Printer,
  Share2,
  Trophy,
  UserRound,
} from "lucide-react";
import Bill from "@/modules/admin/presentation/assets/icons/Bill";
import type { SidebarIcon } from "@/shared/domain/types/sidebar.types";
import type {
  UserManagementGradeId,
  UserManagementRoleId,
  UserManagementSchoolId,
  UserManagementStatusId,
  UserManagementSubscriptionId,
} from "./userManagementDashboardData";

export interface UserDetailStat {
  id: string;
  labelKey: string;
  value: string;
  accentClassName: string;
  icon: SidebarIcon;
  iconToneClassName: string;
}

export interface UserDetailWeeklyMetric {
  id: string;
  labelKey: string;
  lessons: number;
  tests: number;
}

export interface UserDetailActivity {
  id: string;
  titleKey: string;
  descriptionKey: string;
  timestampKey: string;
  icon: SidebarIcon;
  toneClassName: string;
}

export interface UserDetailSubscriptionRow {
  id: string;
  planKey: string;
  startDateKey: string;
  endDateKey: string;
  statusId: UserManagementStatusId;
}

export interface UserManagementDetail {
  id: string;
  fullName: string;
  phoneNumber: string;
  roleId: Exclude<UserManagementRoleId, "all">;
  schoolId: Exclude<UserManagementSchoolId, "all">;
  gradeId: Exclude<UserManagementGradeId, "all" | "allGrades"> | null;
  subscriptionId: Exclude<UserManagementSubscriptionId, "all">;
  statusId: UserManagementStatusId;
  profileTag: string;
  profileImageSrc?: string;
  studentCode: string;
  linkedParentName: string;
  linkedParentPhone: string;
  stats: UserDetailStat[];
  weeklyPerformance: UserDetailWeeklyMetric[];
  activities: UserDetailActivity[];
  subscriptions: UserDetailSubscriptionRow[];
  floatingActions: {
    contactKey: string;
    shareLabelKey: string;
    printLabelKey: string;
    shareIcon: SidebarIcon;
    printIcon: SidebarIcon;
  };
}

const userManagementDetailsMap: Record<string, UserManagementDetail> = {
  "salman-bin-khaled": {
    id: "salman-bin-khaled",
    fullName: "سلمان بن خالد",
    phoneNumber: "+966 50 XXX XXXX",
    roleId: "student",
    schoolId: "alnour",
    gradeId: "grade5",
    subscriptionId: "active",
    statusId: "active",
    profileTag: "LVL 12",
    studentCode: "#ID-8842",
    linkedParentName: "خالد بن سلمان",
    linkedParentPhone: "+966 50 XXX XXXX",
    stats: [
      {
        id: "studyHours",
        labelKey: "userManagement.details.stats.studyHours",
        value: "128h",
        accentClassName: "before:bg-[#D6B66A]",
        icon: Clock3,
        iconToneClassName: "bg-[#FAF1DA] text-[#B08A1C]",
      },
      {
        id: "testResults",
        labelKey: "userManagement.details.stats.testResults",
        value: "92%",
        accentClassName: "before:bg-[#67C23A]",
        icon: Trophy,
        iconToneClassName: "bg-emerald-100 text-emerald-600",
      },
      {
        id: "completedLessons",
        labelKey: "userManagement.details.stats.completedLessons",
        value: "42",
        accentClassName: "before:bg-[#243B5A]",
        icon: CheckCheck,
        iconToneClassName: "bg-[#E8EEF8] text-[#243B5A]",
      },
    ],
    weeklyPerformance: [
      { id: "sunday", labelKey: "userManagement.details.chart.days.sunday", lessons: 54, tests: 38 },
      { id: "monday", labelKey: "userManagement.details.chart.days.monday", lessons: 31, tests: 22 },
      { id: "tuesday", labelKey: "userManagement.details.chart.days.tuesday", lessons: 66, tests: 42 },
      { id: "wednesday", labelKey: "userManagement.details.chart.days.wednesday", lessons: 49, tests: 33 },
      { id: "thursday", labelKey: "userManagement.details.chart.days.thursday", lessons: 64, tests: 40 },
      { id: "friday", labelKey: "userManagement.details.chart.days.friday", lessons: 30, tests: 18 },
      { id: "saturday", labelKey: "userManagement.details.chart.days.saturday", lessons: 44, tests: 29 },
    ],
    activities: [
      {
        id: "science-test",
        titleKey: "userManagement.details.activities.scienceTest.title",
        descriptionKey: "userManagement.details.activities.scienceTest.description",
        timestampKey: "userManagement.details.activities.scienceTest.time",
        icon: Trophy,
        toneClassName: "bg-[#58CC021A] text-[#58CC02]",
      },
      {
        id: "video-watch",
        titleKey: "userManagement.details.activities.videoWatch.title",
        descriptionKey: "userManagement.details.activities.videoWatch.description",
        timestampKey: "userManagement.details.activities.videoWatch.time",
        icon: BookOpenCheck,
        toneClassName: "bg-[#2B415E1A] text-[#2B415E]",
      },
      {
        id: "math-homework",
        titleKey: "userManagement.details.activities.mathHomework.title",
        descriptionKey: "userManagement.details.activities.mathHomework.description",
        timestampKey: "userManagement.details.activities.mathHomework.time",
        icon: GraduationCap,
        toneClassName: "bg-[#C7AF6D1A] text-[#C7AF6D]",
      },
    ],
    subscriptions: [
      {
        id: "gold-yearly",
        planKey: "userManagement.details.subscriptions.plans.goldYearly",
        startDateKey: "userManagement.details.subscriptions.dates.goldYearly.start",
        endDateKey: "userManagement.details.subscriptions.dates.goldYearly.end",
        statusId: "active",
      },
      {
        id: "term-one",
        planKey: "userManagement.details.subscriptions.plans.termOne",
        startDateKey: "userManagement.details.subscriptions.dates.termOne.start",
        endDateKey: "userManagement.details.subscriptions.dates.termOne.end",
        statusId: "inactive",
      },
      {
        id: "trial-month",
        planKey: "userManagement.details.subscriptions.plans.trialMonth",
        startDateKey: "userManagement.details.subscriptions.dates.trialMonth.start",
        endDateKey: "userManagement.details.subscriptions.dates.trialMonth.end",
        statusId: "inactive",
      },
    ],
    floatingActions: {
      contactKey: "userManagement.details.floatingActions.contact",
      shareLabelKey: "userManagement.details.floatingActions.share",
      printLabelKey: "userManagement.details.floatingActions.print",
      shareIcon: Share2,
      printIcon: Printer,
    },
  },
};

export function getUserManagementDetail(userId: string) {
  return userManagementDetailsMap[userId];
}

export const userManagementFallbackDetailId = "salman-bin-khaled";

export const userManagementProfileIcon = UserRound;
export const userManagementParentIcon = UserRound;
export const userManagementSubscriptionIcon = Bill;
