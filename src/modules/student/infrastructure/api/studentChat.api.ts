import type { EnrolledCourseCardDto } from "@/modules/student/domain/progress/progress.types";
import type { StudentChatGroupListItem } from "@/modules/student/domain/chat-groups/student-chat.types";
import { getSubscriptionsDashboard } from "@/modules/student/infrastructure/api/progress.api";
import {
  fetchChatDetails,
  fetchChatMessages,
  fetchTeacherChatConversation,
  fetchTeacherChatMembers,
  sendChatMessage,
  addChatMessageReaction,
  removeChatMessageReaction,
  updateChatMemberPreferences,
  type SendChatMessagePayload,
} from "@/modules/teacher/infrastructure/api/teacherChatApi";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";

function formatMessageTime(createdAt: string, locale: string): string | null {
  if (!createdAt) return null;
  try {
    return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(
      new Date(createdAt),
    );
  } catch {
    return null;
  }
}

async function enrichCourseAsChatGroup(
  course: EnrolledCourseCardDto,
  locale: string,
): Promise<StudentChatGroupListItem> {
  const [detailsResult, previewResult] = await Promise.allSettled([
    fetchChatDetails(course.courseId),
    fetchChatMessages(course.courseId, { pageNumber: 1, pageSize: 1 }),
  ]);

  const details = detailsResult.status === "fulfilled" ? detailsResult.value : null;
  const previewMessage =
    previewResult.status === "fulfilled" ? (previewResult.value.messages[0] ?? null) : null;

  const groupName =
    details?.groupName?.trim() ||
    [course.title, course.instructorName].filter(Boolean).join(" - ") ||
    course.title;

  return {
    courseId: course.courseId,
    groupName,
    instructorName: course.instructorName,
    coverImageUrl:
      resolveFileUrl(details?.coverImageUrl) ?? resolveFileUrl(course.thumbnailUrl) ?? null,
    participantsCount: details?.participantsCount ?? 0,
    isMuted: details?.isMuted ?? false,
    isPinnedInList: details?.isPinnedInList ?? false,
    isActiveEnrollment: course.status === "active",
    lastMessagePreview: previewMessage?.content ?? previewMessage?.attachments[0]?.fileName ?? null,
    lastMessageSender: previewMessage?.senderName ?? null,
    lastMessageAt: previewMessage?.createdAt ?? null,
    lastMessageAtLabel: previewMessage
      ? formatMessageTime(previewMessage.createdAt, locale)
      : null,
  };
}

function sortChatGroups(groups: StudentChatGroupListItem[]): StudentChatGroupListItem[] {
  return [...groups].sort((a, b) => {
    if (a.isPinnedInList !== b.isPinnedInList) {
      return a.isPinnedInList ? -1 : 1;
    }
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return bTime - aTime;
  });
}

export async function fetchStudentChatGroups(locale = "ar"): Promise<StudentChatGroupListItem[]> {
  const dashboard = await getSubscriptionsDashboard();
  const groups = await Promise.all(
    dashboard.courses.map((course) => enrichCourseAsChatGroup(course, locale)),
  );
  return sortChatGroups(groups);
}

export async function fetchStudentChatConversation(courseId: string, locale = "ar") {
  return fetchTeacherChatConversation(courseId, locale);
}

export async function fetchStudentChatMembers(courseId: string, locale = "ar") {
  return fetchTeacherChatMembers(courseId, locale);
}

export async function sendStudentChatMessage(
  courseId: string,
  payload: SendChatMessagePayload,
): Promise<{ id: string }> {
  const id = await sendChatMessage(courseId, payload);
  return { id };
}

export async function toggleStudentChatReaction(
  messageId: string,
  emoji: string,
  reactions: Array<{ emoji: string; reactedByCurrentUser?: boolean }> = [],
) {
  const myCurrentEmoji = reactions.find((item) => item.reactedByCurrentUser)?.emoji;
  if (myCurrentEmoji === emoji) {
    return removeChatMessageReaction(messageId, emoji);
  }
  return addChatMessageReaction(messageId, emoji);
}

export async function updateStudentChatMemberPreferences(
  courseId: string,
  preferences: { isMuted: boolean; isPinnedInList: boolean },
): Promise<void> {
  return updateChatMemberPreferences(courseId, preferences);
}

export type { SendChatMessagePayload };
