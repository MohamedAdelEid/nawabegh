import type { PaginatedQueryParams } from "@/shared/domain/types/paginated-query.types";

export type TeacherDto = {
  teacherId: string;
  fullName: string;
  profileImageUrl: string;
  jobTitle: string;
  primarySubjectNameAr: string;
  rating: number;
  location: string;
  studentCount: number;
  isExpert: boolean;
  expertBadgeLabel: string;
};

export type Teacher = {
  teacherId: string;
  fullName: string;
  profileImageUrl: string | null;
  jobTitle: string;
  primarySubjectNameAr: string;
  rating: number;
  location: string;
  studentCount: number;
  isExpert: boolean;
  expertBadgeLabel: string;
};

export type TeachersQueryParams = PaginatedQueryParams & {
  subjectId?: number;
};

export type TeachersPage = {
  rows: Teacher[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
};
