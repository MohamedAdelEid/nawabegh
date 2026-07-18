export type SchoolHomeArticleStatus =
  | "Draft"
  | "PendingReview"
  | "NeedsEdits"
  | "Published"
  | "Hidden";

export type SchoolHomeArticleStatusFilter = "all" | SchoolHomeArticleStatus;

export interface SchoolHomeKpis {
  registeredStudentsCount: number;
  studentsGrowthPercent: number;
  studentsGrowthLabel: string;
  schoolRank: number;
  totalSchools: number;
  performanceBadge: string | null;
  activeCoursesCount: number;
  activeCoursesProgressPercent: number;
  todayRegistrationsCount: number;
  lastRegistrationAgoText: string;
}

export interface SchoolCompetitionCenter {
  competitionPointsPercent: number;
  competitionPointsLabel: string;
  competitionRank: number;
  competitionRankLabel: string;
  medalsCount: number;
  thisSchoolTotalPoints: number;
  topSchoolTotalPoints: number;
}

export interface SchoolHomeAnnouncement {
  id: string;
  title: string;
  type: string;
  isUrgent: boolean;
  priorityLabel: string;
  date: string;
  dateLabel: string;
}

export interface SchoolHomeArticle {
  articleId: string;
  title: string;
  author: {
    userId: string;
    fullName: string;
    avatarUrl: string | null;
    roleLabel: string;
  };
  likesCount: number;
  commentsCount: number;
  publishedAt: string;
  publishedAtLabel: string;
  status: SchoolHomeArticleStatus;
  statusLabel: string;
  canHide: boolean;
  canDelete: boolean;
}

export interface SchoolHomeData {
  schoolId: string;
  schoolName: string;
  schoolLogoUrl: string | null;
  hasUnreadNotifications: boolean;
  kpis: SchoolHomeKpis;
  competitionCenter: SchoolCompetitionCenter;
  latestAnnouncements: SchoolHomeAnnouncement[];
  latestArticles: SchoolHomeArticle[];
  articlesTotalCount: number;
}

export interface SchoolHomeArticlesPage {
  items: SchoolHomeArticle[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
