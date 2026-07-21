import type { CourseAccessType } from "@/shared/domain/enums/course.enums";
import type {
  LearningPathStatus,
  StationAccessPolicy,
  StationProgressStatus,
  StationType,
} from "@/shared/domain/enums/learning-path.enums";
import type { PaginatedQueryParams } from "@/shared/domain/types/paginated-query.types";

export type CourseResourceFileDto = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  accessPolicy: string;
  resourceFileType: string;
  previewUrl: string;
};

export type CourseChatDto = {
  hasChatGroup: boolean;
  chatGroupId: string;
  groupName: string;
  description: string;
  participantsCount: number;
  previewAvatarCount: number;
  additionalParticipantsCount: number;
  previewParticipantAvatarUrls: string[];
  canEnterChat: boolean;
};

export const EMPTY_COURSE_CHAT: CourseChatDto = {
  hasChatGroup: false,
  chatGroupId: "",
  groupName: "",
  description: "",
  participantsCount: 0,
  previewAvatarCount: 0,
  additionalParticipantsCount: 0,
  previewParticipantAvatarUrls: [],
  canEnterChat: false,
};

export type ExploreCourseDto = {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  subjectNameAr: string;
  subjectNameEn: string;
  gradeId: number;
  gradeNameAr: string;
  gradeNameEn: string;
  term: number;
  teacherFullName: string;
  teacherAvatarUrl: string;
  accessType: CourseAccessType;
  originalPrice: number;
  discountedPrice: number;
  status: number;
  isPublished: boolean;
  enrolledStudentsCount: number;
  isEnrolled: boolean;
  progressPercentage: number;
  isBestSeller: boolean;
  actionLabel: string;
  courseFilesCount: number;
  resourceFiles: CourseResourceFileDto[];
  chat: CourseChatDto;
};

export type ExploreCoursesQueryParams = PaginatedQueryParams & {
  subjectId?: number;
  teacherId?: string;
  accessType?: CourseAccessType;
};

export type ExploreCoursesPage = {
  rows: ExploreCourseDto[];
  currentPage: number;
  pageSize: number;
  totalCount?: number;
  totalPages: number;
  hasMore: boolean;
  hasPrevious: boolean;
};

/** UI-facing course card model with optional future fields. */
export type CourseCardModel = {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string | null;
  subjectName: string;
  teacherFullName: string;
  teacherAvatarUrl: string | null;
  accessType: CourseAccessType;
  originalPrice: number;
  discountedPrice: number;
  enrolledStudentsCount: number;
  isEnrolled: boolean;
  progressPercentage: number;
  isBestSeller: boolean;
  courseFilesCount: number;
  /** Reserved for future API fields — do not render when absent. */
  levelLabel?: string;
  /** Reserved for future API fields — do not render when absent. */
  durationLabel?: string;
};

export type CourseLearningOutcomeDto = {
  id: string;
  title: string;
  description: string;
  iconKey: string;
  order: number;
};

export type CourseFaqItemDto = {
  id: string;
  question: string;
  answer: string;
  order: number;
};

export type CourseDetailsTeacherDto = {
  id: string;
  fullName: string;
  avatarUrl: string;
  jobTitle: string;
  about: string;
  rating: number;
  yearsOfExperience: number;
  studentCount: number;
  publishedCoursesCount: number;
  isExpert: boolean;
  expertBadgeLabel: string;
};

export type CourseDetailsStationDto = {
  id: string;
  name: string;
  stationType: StationType;
  progressStatus: StationProgressStatus;
  isLocked: boolean;
  accessPolicy: StationAccessPolicy;
};

export type CourseDetailsLearningPathDto = {
  id: string;
  title: string;
  stationsCount: number;
  completedStations: number;
  progressPercent: number;
  status: LearningPathStatus;
  isLocked: boolean;
  stations: CourseDetailsStationDto[];
};

export type CourseDetailsNextLearningPathDto = {
  id: string;
  title: string;
  progressPercent: number;
  stationsCount: number;
  completedStations: number;
  isLocked: boolean;
};

export type CourseDetailsNextStationDto = {
  id: string;
  name: string;
  stationType: StationType;
  progressStatus: StationProgressStatus;
  isLocked: boolean;
  accessPolicy: StationAccessPolicy;
};

export type CourseDetailsChatDto = {
  id: string;
  name: string;
  participantsCount: number;
  previewParticipantAvatarUrls: string[];
  additionalParticipantsCount: number;
  canEnterChat: boolean;
};

export const EMPTY_COURSE_DETAILS_CHAT: CourseDetailsChatDto = {
  id: "",
  name: "",
  participantsCount: 0,
  previewParticipantAvatarUrls: [],
  additionalParticipantsCount: 0,
  canEnterChat: false,
};

export type CourseDetailsDto = {
  id: string;
  title: string;
  description: string;
  subjectId: number;
  subjectNameAr: string;
  subjectNameEn: string;
  gradeId: number;
  gradeNameAr: string;
  term: number;
  coverImageUrl: string;
  promoVideoUrl: string;
  prerequisites: string;
  targetAudience: string;
  courseLevel: number;
  learningOutcomes: CourseLearningOutcomeDto[];
  faqItems: CourseFaqItemDto[];
  accessType: CourseAccessType;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  currency: string;
  enrolledStudentsCount: number;
  isEnrolled: boolean;
  progressPercentage: number;
  isBestSeller: boolean;
  actionLabel: string;
  teacher: CourseDetailsTeacherDto | null;
  learningPaths: CourseDetailsLearningPathDto[];
  chat: CourseDetailsChatDto;
  nextLearningPath: CourseDetailsNextLearningPathDto | null;
  nextStation: CourseDetailsNextStationDto | null;
};

/** UI-facing course details model — locale-resolved labels, no API envelope. */
export type CourseDetailsModel = {
  id: string;
  title: string;
  description: string;
  subjectName: string;
  gradeName: string;
  coverImageUrl: string | null;
  promoVideoUrl: string | null;
  prerequisites: string;
  targetAudience: string;
  accessType: CourseAccessType;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  currency: string;
  enrolledStudentsCount: number;
  isEnrolled: boolean;
  progressPercentage: number;
  isBestSeller: boolean;
  actionLabel: string;
  learningOutcomes: CourseLearningOutcomeDto[];
  faqItems: CourseFaqItemDto[];
  teacher: CourseDetailsTeacherDto | null;
  learningPaths: CourseDetailsLearningPathDto[];
  chat: CourseDetailsChatDto;
  nextLearningPath: CourseDetailsNextLearningPathDto | null;
  nextStation: CourseDetailsNextStationDto | null;
  /** Reserved — API field not available yet. */
  durationLabel?: string;
  /** Reserved — API field not available yet. */
  ratingLabel?: string;
};
