import { BookOpen, Clock3, FileClock, HandCoins } from "lucide-react";
import type { SidebarIcon } from "@/shared/domain/types/sidebar.types";
import type { IconTone } from "@/shared/domain/types/common.types";

export type ContentFileTypeId = "pdf" | "video" | "zip";
export type ContentFileAccessId = "public" | "subscribersOnly";

export interface ContentManagementStat {
  id: string;
  labelKey: string;
  value: string;
  indicatorKey: string;
  indicatorToneClassName: string;
  icon: SidebarIcon;
  iconTone: IconTone;
}

export interface ContentManagementFilterOption {
  id: string;
  labelKey: string;
}

export interface ContentManagementRow {
  id: string;
  fileTitle: string;
  extensionLabel: string;
  sizeLabel: string;
  courseName: string;
  subjectName: string;
  teacherName: string;
  teacherAvatarInitials: string;
  policyLabelKey: string;
  downloadsCount: number;
  active: boolean;
  fileTypeId: ContentFileTypeId;
}

export interface ContentActivityItem {
  id: string;
  titleKey: string;
  detailKey: string;
  actionLabelKey: string;
  tone: "success" | "warning" | "danger";
}

export interface ContentFileDetails {
  id: string;
  title: string;
  extensionLabel: string;
  sizeLabel: string;
  statusLabelKey: string;
  uploadDate: string;
  teacherName: string;
  teacherAvatarInitials: string;
  versionLabel: string;
  downloadsLabel: string;
  policyLabel: string;
  courseName: string;
  responsibleTeacher: string;
  subjectName: string;
  gradeName: string;
  readsLastMonth: number[];
  showPublicly: boolean;
  downloadable: boolean;
}

export interface ContentManagementDashboardData {
  stats: ContentManagementStat[];
  rows: ContentManagementRow[];
  activities: ContentActivityItem[];
  filters: {
    subjects: ContentManagementFilterOption[];
    grades: ContentManagementFilterOption[];
    fileTypes: ContentManagementFilterOption[];
  };
}

export interface ContentFileUpsertPayload {
  courseLink: string;
  title: string;
  description: string;
  access: ContentFileAccessId;
}

const DASHBOARD_DATA: ContentManagementDashboardData = {
  stats: [
    {
      id: "revenue",
      labelKey: "contentManagement.stats.revenue.label",
      value: "136,500",
      indicatorKey: "contentManagement.stats.revenue.indicator",
      indicatorToneClassName: "text-amber-700",
      icon: HandCoins,
      iconTone: "primary",
    },
    {
      id: "activeStudents",
      labelKey: "contentManagement.stats.activeStudents.label",
      value: "8,900",
      indicatorKey: "contentManagement.stats.activeStudents.indicator",
      indicatorToneClassName: "text-emerald-600",
      icon: BookOpen,
      iconTone: "success",
    },
    {
      id: "pendingApproval",
      labelKey: "contentManagement.stats.pendingApproval.label",
      value: "45",
      indicatorKey: "contentManagement.stats.pendingApproval.indicator",
      indicatorToneClassName: "text-amber-600",
      icon: FileClock,
      iconTone: "warning",
    },
    {
      id: "totalFiles",
      labelKey: "contentManagement.stats.totalFiles.label",
      value: "2,000",
      indicatorKey: "contentManagement.stats.totalFiles.indicator",
      indicatorToneClassName: "text-slate-400",
      icon: Clock3,
      iconTone: "info",
    },
  ],
  filters: {
    subjects: [
      { id: "all", labelKey: "contentManagement.filters.subject.all" },
      { id: "physics", labelKey: "contentManagement.filters.subject.physics" },
      { id: "math", labelKey: "contentManagement.filters.subject.math" },
    ],
    grades: [
      { id: "all", labelKey: "contentManagement.filters.grade.all" },
      { id: "grade11", labelKey: "contentManagement.filters.grade.grade11" },
      { id: "grade12", labelKey: "contentManagement.filters.grade.grade12" },
    ],
    fileTypes: [
      { id: "all", labelKey: "contentManagement.filters.fileType.all" },
      { id: "pdf", labelKey: "contentManagement.filters.fileType.pdf" },
      { id: "video", labelKey: "contentManagement.filters.fileType.video" },
      { id: "zip", labelKey: "contentManagement.filters.fileType.zip" },
    ],
  },
  rows: [
    {
      id: "file-101",
      fileTitle: "ملخص قوانين الحركة",
      extensionLabel: "PDF",
      sizeLabel: "4.2 MB",
      courseName: "الفيزياء",
      subjectName: "الفيزياء",
      teacherName: "أ. محمد علي",
      teacherAvatarInitials: "مع",
      policyLabelKey: "contentManagement.policy.public",
      downloadsCount: 1240,
      active: true,
      fileTypeId: "pdf",
    },
    {
      id: "file-102",
      fileTitle: "شرح ميكانيكا الكم",
      extensionLabel: "MP4",
      sizeLabel: "128 MB",
      courseName: "فيزياء",
      subjectName: "فيزياء",
      teacherName: "د. ليلى خالد",
      teacherAvatarInitials: "لك",
      policyLabelKey: "contentManagement.policy.subscribersOnly",
      downloadsCount: 856,
      active: true,
      fileTypeId: "video",
    },
    {
      id: "file-103",
      fileTitle: "الإحصاء التطبيقي",
      extensionLabel: "ZIP",
      sizeLabel: "15 MB",
      courseName: "فيزياء",
      subjectName: "فيزياء",
      teacherName: "أ. سامي يوسف",
      teacherAvatarInitials: "سي",
      policyLabelKey: "contentManagement.policy.public",
      downloadsCount: 320,
      active: false,
      fileTypeId: "zip",
    },
  ],
  activities: [
    {
      id: "a1",
      titleKey: "contentManagement.activity.items.upload.title",
      detailKey: "contentManagement.activity.items.upload.detail",
      actionLabelKey: "contentManagement.activity.items.upload.action",
      tone: "success",
    },
    {
      id: "a2",
      titleKey: "contentManagement.activity.items.policy.title",
      detailKey: "contentManagement.activity.items.policy.detail",
      actionLabelKey: "contentManagement.activity.items.policy.action",
      tone: "warning",
    },
    {
      id: "a3",
      titleKey: "contentManagement.activity.items.delete.title",
      detailKey: "contentManagement.activity.items.delete.detail",
      actionLabelKey: "contentManagement.activity.items.delete.action",
      tone: "danger",
    },
  ],
};

const FILE_DETAILS: ContentFileDetails[] = [
  {
    id: "file-101",
    title: "مقدمة في الجبر المتقدم.pdf",
    extensionLabel: "PDF Document",
    sizeLabel: "4.2 MB",
    statusLabelKey: "status.available",
    uploadDate: "12 أكتوبر 2023",
    teacherName: "د. أحمد علي",
    teacherAvatarInitials: "دع",
    versionLabel: "v2.1.0",
    downloadsLabel: "1,248",
    policyLabel: "Public",
    courseName: "الرياضيات الأساسية 101",
    responsibleTeacher: "أ. سارة المنصور",
    subjectName: "الرياضيات",
    gradeName: "الثاني ثانوي",
    readsLastMonth: [63, 58, 49, 36, 42, 55, 84, 76, 66, 50, 59, 47],
    showPublicly: true,
    downloadable: true,
  },
];

export async function getContentManagementDashboardData(): Promise<ContentManagementDashboardData> {
  await Promise.resolve();
  return DASHBOARD_DATA;
}

export async function getContentFileDetailsById(fileId: string): Promise<ContentFileDetails | null> {
  await Promise.resolve();
  return FILE_DETAILS.find((item) => item.id === fileId) ?? null;
}

export async function submitContentFile(payload: ContentFileUpsertPayload): Promise<{ id: string }> {
  await Promise.resolve();
  void payload;
  return { id: "file-101" };
}

export async function updateContentFile(fileId: string, payload: ContentFileUpsertPayload): Promise<void> {
  await Promise.resolve();
  void fileId;
  void payload;
}

export async function deleteContentFile(fileId: string): Promise<void> {
  await Promise.resolve();
  void fileId;
}
