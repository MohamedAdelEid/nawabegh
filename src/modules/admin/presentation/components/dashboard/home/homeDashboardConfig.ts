import {
  AlertCircle,
  Award,
  Bell,
  BookOpen,
  Building2,
  ClipboardList,
  GraduationCap,
  Plus,
  TrendingUp,
  UserRound,
  Users,
  Video,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import type { IconTone } from "@/shared/domain/types/common.types";

type SummaryCardVisual = { icon: LucideIcon; tone: IconTone };

const SUMMARY_CARD_VISUALS: Record<string, SummaryCardVisual> = {
  activeSubscriptions: { icon: Wallet, tone: "gold" },
  publishedCourses: { icon: BookOpen, tone: "primary" },
  totalCourses: { icon: BookOpen, tone: "primary" },
  courses: { icon: BookOpen, tone: "primary" },
  schools: { icon: Building2, tone: "info" },
  teachers: { icon: GraduationCap, tone: "success" },
  students: { icon: Users, tone: "info" },
  parents: { icon: Users, tone: "neutral" },
  totalUsers: { icon: Users, tone: "primary" },
};

const DEFAULT_SUMMARY_CARD_VISUAL: SummaryCardVisual = { icon: TrendingUp, tone: "neutral" };

export function getSummaryCardVisual(key: string): SummaryCardVisual {
  return SUMMARY_CARD_VISUALS[key] ?? DEFAULT_SUMMARY_CARD_VISUAL;
}

const ACTIVITY_METRIC_ORDER = [
  "completedLessons",
  "liveSessionsToday",
  "issuedCertificates",
  "completedExams",
] as const;

export type ActivityMetricKey = (typeof ACTIVITY_METRIC_ORDER)[number];

export const ACTIVITY_METRICS: Array<{
  key: ActivityMetricKey;
  unitKey: string;
  icon: LucideIcon;
  tone: IconTone;
}> = [
  { key: "completedLessons", unitKey: "lessons", icon: BookOpen, tone: "success" },
  { key: "liveSessionsToday", unitKey: "sessions", icon: Video, tone: "primary" },
  { key: "issuedCertificates", unitKey: "certificates", icon: Award, tone: "gold" },
  { key: "completedExams", unitKey: "exams", icon: ClipboardList, tone: "info" },
];

export const QUICK_LINKS: Array<{
  id: string;
  href: string;
  icon: LucideIcon;
  tone: IconTone;
}> = [
  { id: "sendNotification", href: ROUTES.ADMIN.SEND_NOTIFICATION.LIST, icon: Bell, tone: "primary" },
  { id: "blockViolator", href: ROUTES.ADMIN.USER_MANAGEMENT.LIST, icon: Users, tone: "info" },
  { id: "pendingReports", href: ROUTES.ADMIN.SUPPORT_TICKETS.LIST, icon: AlertCircle, tone: "danger" },
  { id: "interactiveBook", href: ROUTES.ADMIN.INTERACTIVE_BOOKS.LIST, icon: BookOpen, tone: "gold" },
  { id: "addCourse", href: ROUTES.ADMIN.COURSE_MANAGEMENT.CREATE, icon: Plus, tone: "success" },
  { id: "addUser", href: ROUTES.ADMIN.USER_MANAGEMENT.ADD.ROOT, icon: UserRound, tone: "neutral" },
];

const REVIEW_TASK_ROUTES: Record<string, string> = {
  pendingCourses: ROUTES.ADMIN.COURSE_MANAGEMENT.LIST,
  courses: ROUTES.ADMIN.COURSE_MANAGEMENT.LIST,
  documentVerifications: ROUTES.ADMIN.USER_MANAGEMENT.LIST,
  contentReports: ROUTES.ADMIN.ARTICLE_EDITOR.LIST,
  articles: ROUTES.ADMIN.ARTICLE_EDITOR.LIST,
  communityArticles: ROUTES.ADMIN.ARTICLE_EDITOR.LIST,
  supportTickets: ROUTES.ADMIN.SUPPORT_TICKETS.LIST,
};

export function getReviewTaskRoute(key: string): string {
  return REVIEW_TASK_ROUTES[key] ?? ROUTES.ADMIN.SUPPORT_TICKETS.LIST;
}

const REVIEW_TASK_TONES: IconTone[] = ["danger", "success", "info", "gold"];

export function getReviewTaskTone(index: number): IconTone {
  return REVIEW_TASK_TONES[index % REVIEW_TASK_TONES.length] ?? "primary";
}
