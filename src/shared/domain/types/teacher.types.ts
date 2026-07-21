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

export type TeacherCertificate = {
  title: string;
  description: string;
  year: number | null;
};

export type TeacherPublishedCourseSummary = {
  courseId: string;
  title: string;
  coverImageUrl: string | null;
  subjectNameAr: string;
  gradeId: number;
  gradeNameAr: string;
  gradeNameEn: string;
  discountedPrice: number;
  originalPrice: number;
};

export type TeacherPublicProfile = {
  teacherId: string;
  fullName: string;
  profileImageUrl: string | null;
  jobTitle: string;
  rating: number;
  yearsOfExperience: number;
  studentCount: number;
  location: string;
  isExpert: boolean;
  expertBadgeLabel: string;
  about: string;
  certificates: TeacherCertificate[];
  subjectsTaught: string[];
  publishedCourses: TeacherPublishedCourseSummary[];
};
