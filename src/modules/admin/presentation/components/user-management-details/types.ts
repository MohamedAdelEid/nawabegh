import type {
  ParentUserDetail,
  StudentUserDetail,
  TeacherUserDetail,
} from "@/modules/admin/infrastructure/api/userManagementApi";
import type { SidebarIcon } from "@/shared/domain/types/sidebar.types";

export type UserManagementRemoteDetail =
  | { kind: "student"; data: StudentUserDetail }
  | { kind: "teacher"; data: TeacherUserDetail }
  | { kind: "parent"; data: ParentUserDetail };

export type UserManagementProfileView = {
  fullName: string;
  subtitle: string;
  schoolLabel: string;
  statusLabel: string;
  subscriptionLabel: string;
  codeValue: string;
  profileImageUrl: string | null;
  profileTag: string;
  isActive: boolean;
  phoneNumber: string;
  linkedParentName: string;
  linkedParentPhone: string;
  schoolLabelTitle: string;
  contactKey: string;
};

export type UserManagementParentChildRow = {
  id: string;
  fullName: string;
  username: string;
  gradeName: string;
  profileImageUrl: string | null;
};

export type UserManagementActivityRow = {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: SidebarIcon;
  toneClassName: string;
};

export type UserManagementWeeklyPerformanceRow = {
  id: string;
  label: string;
  lessons: number;
  tests: number;
};
