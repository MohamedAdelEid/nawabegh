import { BookOpenText, Clock3, NotebookText } from "lucide-react";
import type { SidebarIcon } from "@/shared/domain/types/sidebar.types";

export type InteractiveBookStatusId = "published" | "draft";

export interface InteractiveBooksStat {
  id: string;
  labelKey: string;
  value: string;
  indicatorKey: string;
  indicatorToneClassName: string;
  icon: SidebarIcon;
  iconTone: "primary" | "success" | "warning" | "info";
}

export interface InteractiveBooksRow {
  id: string;
  name: string;
  subjectKey: string;
  gradeKey: string;
  pages: number;
  points: number;
  views: string;
  statusId: InteractiveBookStatusId;
  createdAt: string;
}

/** Table row when data comes from `GET /api/v1/InteractiveBook`. */
export type InteractiveBookTableRow = {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  gradeId: number;
  gradeName: string;
  gradeNameAr: string;
  gradeNameEn: string;
  pageCount: number;
  hotspotCount: number;
  activeHotspotCount: number;
  viewCount: number;
  statusId: InteractiveBookStatusId;
  createdAt: string;
  /** Original PDF filename when the API returns it (optional). */
  pdfFileName?: string;
};

/** Full book payload from `GET /api/v1/InteractiveBook/course/{courseId}`. */
export type InteractiveBookDetail = InteractiveBookTableRow & {
  pdfUrl: string;
  updatedAt: string;
};

export interface InteractiveBooksDashboardData {
  stats: InteractiveBooksStat[];
  rows: InteractiveBooksRow[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    visibleItems: number;
  };
}

export const interactiveBooksDashboardData: InteractiveBooksDashboardData = {
  stats: [
    {
      id: "totalBooks",
      labelKey: "interactiveBooks.stats.totalBooks.label",
      value: "1,284",
      indicatorKey: "interactiveBooks.stats.totalBooks.indicator",
      indicatorToneClassName: "text-emerald-500",
      icon: NotebookText,
      iconTone: "primary",
    },
    {
      id: "activeReaders",
      labelKey: "interactiveBooks.stats.activeReaders.label",
      value: "8,432",
      indicatorKey: "interactiveBooks.stats.activeReaders.indicator",
      indicatorToneClassName: "text-emerald-500",
      icon: BookOpenText,
      iconTone: "warning",
    },
    {
      id: "readingTime",
      labelKey: "interactiveBooks.stats.readingTime.label",
      value: "42",
      indicatorKey: "interactiveBooks.stats.readingTime.indicator",
      indicatorToneClassName: "text-rose-500",
      icon: Clock3,
      iconTone: "success",
    },
  ],
  rows: [
    {
      id: "BK-8842",
      name: "interactiveBooks.rows.books.advancedBiology",
      subjectKey: "interactiveBooks.rows.subjects.science",
      gradeKey: "interactiveBooks.rows.grades.grade10",
      pages: 245,
      points: 124,
      views: "12.5k",
      statusId: "published",
      createdAt: "12/10/2023",
    },
    {
      id: "BK-8843",
      name: "interactiveBooks.rows.books.advancedPhysics",
      subjectKey: "interactiveBooks.rows.subjects.science",
      gradeKey: "interactiveBooks.rows.grades.grade10",
      pages: 245,
      points: 124,
      views: "12.5k",
      statusId: "published",
      createdAt: "12/10/2023",
    },
    {
      id: "BK-8844",
      name: "interactiveBooks.rows.books.advancedChemistry",
      subjectKey: "interactiveBooks.rows.subjects.science",
      gradeKey: "interactiveBooks.rows.grades.grade10",
      pages: 245,
      points: 124,
      views: "12.5k",
      statusId: "published",
      createdAt: "12/10/2023",
    },
  ],
  pagination: {
    currentPage: 1,
    totalPages: 3,
    totalItems: 1248,
    visibleItems: 3,
  },
};
