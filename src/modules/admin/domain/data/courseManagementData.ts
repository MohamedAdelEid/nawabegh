import {
  BadgeDollarSign,
  BookOpenCheck,
  ClipboardClock,
  GraduationCap,
} from "lucide-react";
import type { SidebarIcon } from "@/shared/domain/types/sidebar.types";
import { IconTone } from "@/shared/domain/types/common.types";

import type {
  CourseAccessTypeId,
  CourseReviewReasonId,
  CourseStatusId,
} from "@/shared/domain/enums/cms.mappers";

export type { CourseAccessTypeId, CourseReviewReasonId, CourseStatusId };

export type CoursePricingTypeId = "oneTime" | "free";
export type CoursePricingType = {
  text: string;
  icon: React.ReactNode;
  iconTone: IconTone;
};

export interface CourseManagementStat {
  id: string;
  labelKey: string;
  value: string;
  indicatorKey: string;
  indicatorToneClassName: string;
  icon: SidebarIcon;
  iconTone: "primary" | "success" | "warning" | "info";
}

export interface CourseManagementRow {
  id: string;
  title: string;
  subject: string;
  grade: string;
  gradeNameAr: string;
  gradeNameEn: string;
  teacherName: string;
  teacherAvatarUrl?: string;
  accessType: CourseAccessTypeId;
  statusId: CourseStatusId;
  isPublished: boolean;
  coverTone: "blue" | "green" | "gold" | "slate";
  coverLabel: string;
  /** When set with a usable URL, `CourseCoverPreview` shows the remote image instead of gradients. */
  coverImageUrl?: string | null;
  courseId?: string;
  term?: number;
  revenue: string;
  lessonCount: number;
  studentCount: number;
  createdAt: string;
}

export interface CourseCurriculumItem {
  id: string;
  title: string;
  type: "video" | "quiz" | "pdf" | "locked";
  durationLabel: string;
  metaLabel: string;
  stationType?: number;
  locked?: boolean;
}

export interface CourseCurriculumUnit {
  id: string;
  title: string;
  statusId?: CourseStatusId;
  expanded: boolean;
  items: CourseCurriculumItem[];
}

export interface CourseReviewDetail extends CourseManagementRow {
  description: string;
  stageLabel: string;
  termLabel: string;
  priceLabel: string;
  completionRate: number;
  totalRevenueLabel: string;
  reviewNotes: string;
  reviewReasons: CourseReviewReasonId[];
  reviewerName: string;
  reviewedAt: string;
  submittedAt: string;
  durationLabel: string;
  categoryLabel: string;
  learningPathCount: number;
  curriculumLoadError?: string | null;
  curriculum: CourseCurriculumUnit[];
}

export interface CourseCreateDraft {
  title: string;
  description: string;
  subject: string;
  country: string;
  educationLevel: string;
  grade: string;
  term: string;
  teacher: string;
  pricingType: CoursePricingTypeId;
  basePrice: string;
  offerPrice: string;
  lessonCount: string;
  pathCount: string;
}

export interface CourseManagementData {
  stats: CourseManagementStat[];
  rows: CourseManagementRow[];
  details: CourseReviewDetail[];
  createDraft: CourseCreateDraft;
  rejectReasons: CourseReviewReasonId[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    visibleItems: number;
  };
}

const rows: CourseManagementRow[] = [
  {
    id: "course-ai-101",
    title: "أساسيات الذكاء الاصطناعي",
    subject: "علوم الحاسب",
    grade: "المرحلة الثانوية",
    gradeNameAr: "المرحلة الثانوية",
    gradeNameEn: "High School",
    teacherName: "د. أحمد الصالح",
    accessType: "subscription",
    statusId: "pending",
    isPublished: false,
    coverTone: "blue",
    coverLabel: "AI",
    revenue: "84,000 ر.ع.",
    lessonCount: 24,
    studentCount: 150,
    createdAt: "2026-05-08",
  },
  {
    id: "course-math-201",
    title: "تطبيقات التفاضل والتكامل",
    subject: "الرياضيات",
    grade: "المرحلة الثانوية",
    gradeNameAr: "المرحلة الثانوية",
    gradeNameEn: "High School",
    teacherName: "أ. منى الهاشمي",
    accessType: "free",
    statusId: "approved",
    isPublished: true,
    coverTone: "green",
    coverLabel: "MATH",
    revenue: "12,900 ر.ع.",
    lessonCount: 18,
    studentCount: 84,
    createdAt: "2026-05-06",
  },
  {
    id: "course-art-301",
    title: "الفنون البصرية المعاصرة",
    subject: "التربية الفنية",
    grade: "المرحلة المتوسطة",
    gradeNameAr: "المرحلة المتوسطة",
    gradeNameEn: "Middle School",
    teacherName: "أ. فهد الهادي",
    accessType: "paid",
    statusId: "rejected",
    isPublished: false,
    coverTone: "gold",
    coverLabel: "ART",
    revenue: "4,200 ر.ع.",
    lessonCount: 12,
    studentCount: 36,
    createdAt: "2026-05-03",
  },
  {
    id: "course-history-401",
    title: "تاريخ الحضارات القديمة",
    subject: "التاريخ",
    grade: "المرحلة المتوسطة",
    gradeNameAr: "المرحلة المتوسطة",
    gradeNameEn: "Middle School",
    teacherName: "أنت (مسودة)",
    accessType: "unlisted",
    statusId: "draft",
    isPublished: false,
    coverTone: "slate",
    coverLabel: "HIS",
    revenue: "0 ر.ع.",
    lessonCount: 8,
    studentCount: 0,
    createdAt: "2026-05-01",
  },
];

const aiCurriculum: CourseCurriculumUnit[] = [
  {
    id: "unit-1",
    title: "الوحدة الأولى: مدخل إلى الروابط الإلكترونية",
    expanded: true,
    items: [
      {
        id: "lesson-1",
        title: "مقدمة في الهجين المعرفي",
        type: "video",
        durationLabel: "15:00 دقيقة",
        metaLabel: "فيديو تعليمي عالي الجودة",
      },
      {
        id: "quiz-1",
        title: "اختبار قصير: الروابط التساهمية",
        type: "quiz",
        durationLabel: "10 أسئلة",
        metaLabel: "درجة النجاح 70%",
      },
    ],
  },
  {
    id: "unit-2",
    title: "الوحدة الثانية: البيدروكربونات والألكانات",
    expanded: true,
    items: [
      {
        id: "pdf-1",
        title: "ملخص تسمية الكائنات (PDF)",
        type: "pdf",
        durationLabel: "4.5 MB",
        metaLabel: "ملف مرفق للمراجعة",
      },
      {
        id: "locked-1",
        title: "التفاعلات الكيميائية في الكائنات",
        type: "locked",
        durationLabel: "قيد الإعداد",
        metaLabel: "يحتاج إلى تحسين صوتي",
        locked: true,
      },
    ],
  },
];

const details: CourseReviewDetail[] = rows.map((row) => ({
  ...row,
  description:
    "مسار تعليمي تفاعلي يشرح المفاهيم الأساسية بأسلوب تطبيقي مع مراجعات قصيرة بعد كل وحدة.",
  stageLabel: row.grade,
  gradeNameAr: row.gradeNameAr,
  gradeNameEn: row.gradeNameEn,
  termLabel: "الفصل الدراسي الثاني",
  priceLabel: row.accessType === "free" ? "مجاني" : row.accessType === "paid" ? "150 ر.ع." : "اشتراك",
  completionRate: row.statusId === "rejected" ? 62 : 84,
  totalRevenueLabel: row.revenue,
  reviewNotes:
    "نقدر الجهد المبذول في إعداد هذا المسار، لكن يلزم تحسين بعض الملفات وتوضيح المراجع العلمية قبل النشر.",
  reviewReasons:
    row.statusId === "rejected"
      ? ["incompleteMaterials", "technicalIssues", "contentQuality"]
      : ["incompleteMaterials"],
  reviewerName: "أحمد السالم",
  reviewedAt: "2026-05-12T11:00:00.000Z",
  submittedAt: "2026-05-10T09:30:00.000Z",
  durationLabel: "12 ساعة تدريبية معتمدة",
  categoryLabel: row.subject,
  learningPathCount: 1,
  curriculumLoadError: null,
  curriculum: aiCurriculum,
}));

export const courseManagementData: CourseManagementData = {
  stats: [
    {
      id: "totalCourses",
      labelKey: "courseManagement.stats.totalCourses.label",
      value: "1,284",
      indicatorKey: "courseManagement.stats.totalCourses.indicator",
      indicatorToneClassName: "text-emerald-500",
      icon: BookOpenCheck,
      iconTone: "primary",
    },
    {
      id: "pendingApproval",
      labelKey: "courseManagement.stats.pendingApproval.label",
      value: "24",
      indicatorKey: "courseManagement.stats.pendingApproval.indicator",
      indicatorToneClassName: "text-amber-600",
      icon: ClipboardClock,
      iconTone: "warning",
    },
    {
      id: "activeLearners",
      labelKey: "courseManagement.stats.activeLearners.label",
      value: "45,200",
      indicatorKey: "courseManagement.stats.activeLearners.indicator",
      indicatorToneClassName: "text-emerald-500",
      icon: GraduationCap,
      iconTone: "success",
    },
    {
      id: "monthlyRevenue",
      labelKey: "courseManagement.stats.monthlyRevenue.label",
      value: "84,000 ر.ع.",
      indicatorKey: "courseManagement.stats.monthlyRevenue.indicator",
      indicatorToneClassName: "text-slate-400",
      icon: BadgeDollarSign,
      iconTone: "info",
    },
  ],
  rows,
  details,
  createDraft: {
    title: "الرياضيات المتقدمة للصف الثاني الثانوي",
    description: "",
    subject: "mathematics",
    country: "",
    educationLevel: "",
    grade: "secondary2",
    term: "term2",
    teacher: "teacher-ahmed",
    pricingType: "oneTime",
    basePrice: "299",
    offerPrice: "150",
    lessonCount: "13",
    pathCount: "02",
  },
  rejectReasons: [
    "contentQuality",
    "incompleteMaterials",
    "technicalIssues",
    "policyConflict",
    "copyrightIssue",
  ],
  pagination: {
    currentPage: 1,
    totalPages: 3,
    totalItems: 1284,
    visibleItems: rows.length,
  },
};
