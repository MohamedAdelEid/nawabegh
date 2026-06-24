import { AlertCircle, Archive, CheckCircle2, Newspaper } from "lucide-react";
import type { SidebarIcon } from "@/shared/domain/types/sidebar.types";
import type { IconTone } from "@/shared/domain/types/common.types";
import { Article } from "../../presentation/assets/icons/Article";
import { UnderReview } from "../../presentation/assets/icons/UnderReview";
import { Paind } from "../../presentation/assets/icons/Paind";

export type ArticleStatusId =
  | "published"
  | "pendingReview"
  | "draft"
  | "rejected"
  | "needsEdits"
  | "hidden";

export type ArticleRow = {
  id: string;
  title: string;
  category: string;
  readTimeMinutes: number;
  authorName: string;
  /** Author profile image URL when provided by the API */
  authorAvatarImageUrl: string | null;
  authorUserId?: string;
  authorRole: string;
  schoolName: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  publishedAt: string;
  statusId: ArticleStatusId;
  isHidden: boolean;
};

export type ArticleStat = {
  id: string;
  labelKey: string;
  value: string;
  indicatorKey?: string;
  indicatorToneClassName?: string;
  icon: SidebarIcon;
  iconTone: IconTone;
  accentClassName: string;
};

export const articleEditorStats: ArticleStat[] = [
  {
    id: "totalArticles",
    labelKey: "articleEditor.stats.totalArticles.label",
    value: "1,284",
    icon: Article,
    iconTone: "info",
    accentClassName: "before:bg-[#2C4260]",
  },
  {
    id: "pendingReview",
    labelKey: "articleEditor.stats.pendingReview.label",
    value: "42",
    icon: UnderReview,
    iconTone: "warning",
    accentClassName: "before:bg-[#C7AF6E]",
  },
  {
    id: "publishedToday",
    labelKey: "articleEditor.stats.publishedToday.label",
    value: "15",
    icon: CheckCircle2,
    iconTone: "success",
    accentClassName: "before:bg-[#67C23A]",
  },
  {
    id: "reports",
    labelKey: "articleEditor.stats.reports.label",
    value: "08",
    icon: Paind,
    iconTone: "danger",
    accentClassName: "before:bg-[#F25555]",
  },
];

export const articleEditorRowsSeed: ArticleRow[] = [
  {
    id: "art-1001",
    title: "تطور الذكاء الاصطناعي في التعليم",
    category: "تقنيات التعليم",
    readTimeMinutes: 3,
    authorName: "سارة أحمد",
    authorAvatarImageUrl: null,
    authorRole: "معلمة",
    schoolName: "مدرسة آفاق الدولية",
    likesCount: 12,
    commentsCount: 24,
    viewsCount: 142,
    publishedAt: "12 أكتوبر 2025",
    statusId: "published",
    isHidden: false,
  },
  {
    id: "art-1002",
    title: "تجارب في مختبر الفيزياء الحديث",
    category: "علوم",
    readTimeMinutes: 5,
    authorName: "سارة أحمد",
    authorAvatarImageUrl: null,
    authorRole: "معلم فيزياء",
    schoolName: "مدرسة آفاق الدولية",
    likesCount: 4,
    commentsCount: 8,
    viewsCount: 56,
    publishedAt: "12 أكتوبر 2025",
    statusId: "pendingReview",
    isHidden: false,
  },
  {
    id: "art-1003",
    title: "أهمية الرياضة البدنية للتركيز",
    category: "صحة",
    readTimeMinutes: 6,
    authorName: "سارة أحمد",
    authorAvatarImageUrl: null,
    authorRole: "معلم",
    schoolName: "مدرسة آفاق الدولية",
    likesCount: 6,
    commentsCount: 12,
    viewsCount: 89,
    publishedAt: "12 أكتوبر 2025",
    statusId: "draft",
    isHidden: true,
  },
];
