import { CourseAccessType } from "@/shared/domain/enums/course.enums";
import {
  EMPTY_COURSE_CHAT,
  type CourseCardModel,
  type CourseChatDto,
  type CourseResourceFileDto,
  type ExploreCourseDto,
} from "@/shared/domain/types/course.types";

type ExploreCourseApiRow = Partial<ExploreCourseDto> & {
  id?: string;
  chat?: Partial<CourseChatDto>;
  resourceFiles?: CourseResourceFileDto[];
};

function mapCourseChat(chat: Partial<CourseChatDto> | undefined): CourseChatDto {
  if (!chat) return EMPTY_COURSE_CHAT;

  return {
    hasChatGroup: Boolean(chat.hasChatGroup),
    chatGroupId: chat.chatGroupId ?? "",
    groupName: chat.groupName ?? "",
    description: chat.description ?? "",
    participantsCount: Number(chat.participantsCount ?? 0),
    previewAvatarCount: Number(chat.previewAvatarCount ?? 0),
    additionalParticipantsCount: Number(chat.additionalParticipantsCount ?? 0),
    previewParticipantAvatarUrls: Array.isArray(chat.previewParticipantAvatarUrls)
      ? chat.previewParticipantAvatarUrls
      : [],
    canEnterChat: Boolean(chat.canEnterChat),
  };
}

/** Normalizes a raw API row into a typed explore-course entity. */
export function mapExploreCourseDto(item: unknown): ExploreCourseDto | null {
  if (!item || typeof item !== "object") return null;

  const row = item as ExploreCourseApiRow;
  const id = row.id?.trim();
  if (!id) return null;

  return {
    id,
    title: row.title ?? "",
    description: row.description?.trim() ?? "",
    coverImageUrl: row.coverImageUrl ?? "",
    subjectNameAr: row.subjectNameAr ?? "",
    subjectNameEn: row.subjectNameEn ?? "",
    gradeId: Number(row.gradeId ?? 0),
    term: Number(row.term ?? 0),
    teacherFullName: row.teacherFullName ?? "",
    teacherAvatarUrl: row.teacherAvatarUrl ?? "",
    accessType: Number(row.accessType ?? CourseAccessType.Free) as CourseAccessType,
    originalPrice: Number(row.originalPrice ?? 0),
    discountedPrice: Number(row.discountedPrice ?? 0),
    status: Number(row.status ?? 0),
    isPublished: Boolean(row.isPublished),
    enrolledStudentsCount: Number(row.enrolledStudentsCount ?? 0),
    isEnrolled: Boolean(row.isEnrolled),
    progressPercentage: Number(row.progressPercentage ?? 0),
    isBestSeller: Boolean(row.isBestSeller),
    actionLabel: row.actionLabel ?? "",
    courseFilesCount: Number(row.courseFilesCount ?? 0),
    resourceFiles: Array.isArray(row.resourceFiles) ? row.resourceFiles : [],
    chat: mapCourseChat(row.chat),
  };
}

export function mapExploreCourseToCard(
  dto: ExploreCourseDto,
  locale: string,
): CourseCardModel {
  const isArabic = locale.startsWith("ar");

  return {
    id: dto.id,
    title: dto.title,
    description: dto.description?.trim() ?? "",
    coverImageUrl: dto.coverImageUrl?.trim() || null,
    subjectName: isArabic ? dto.subjectNameAr : dto.subjectNameEn || dto.subjectNameAr,
    teacherFullName: dto.teacherFullName,
    teacherAvatarUrl: dto.teacherAvatarUrl?.trim() || null,
    accessType: dto.accessType,
    originalPrice: dto.originalPrice,
    discountedPrice: dto.discountedPrice,
    enrolledStudentsCount: dto.enrolledStudentsCount,
    isEnrolled: dto.isEnrolled,
    progressPercentage: dto.progressPercentage,
    isBestSeller: dto.isBestSeller,
    courseFilesCount: dto.courseFilesCount,
  };
}
