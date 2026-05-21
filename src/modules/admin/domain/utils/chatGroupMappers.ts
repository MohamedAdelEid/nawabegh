import type {
  ChatGroupDetailDto,
  ChatGroupListItemDto,
  UpdateChatGroupPayload,
} from "@/modules/admin/infrastructure/api/chatGroupsApi";
import { defaultChatGroupFormValues } from "@/modules/admin/domain/data/chatGroupFormData";
import type {
  ChatGroupAttachment,
  ChatGroupChatModeId,
  ChatGroupFormValues,
  ChatGroupRow,
  ChatGroupStatusId,
} from "@/modules/admin/domain/types/chatGroups.types";

const ROW_COLOR_PALETTE = ["#243B5A", "#FFB547", "#5B93FF", "#67C23A", "#F25555"];

function colorFromId(id: string): string {
  const sum = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return ROW_COLOR_PALETTE[sum % ROW_COLOR_PALETTE.length] ?? "#243B5A";
}

function mapChatMode(chatMode: string): ChatGroupChatModeId {
  const normalized = chatMode.trim().toLowerCase();
  if (
    normalized.includes("teacher") ||
    normalized === "teacheronly" ||
    normalized === "teacher_only"
  ) {
    return "teacherOnly";
  }
  return "everyone";
}

function mapStatus(status: string, isLocked: boolean): ChatGroupStatusId {
  if (isLocked) return "paused";
  const normalized = status.trim().toLowerCase();
  if (
    normalized.includes("pause") ||
    normalized.includes("lock") ||
    normalized.includes("inactive") ||
    normalized === "0"
  ) {
    return "paused";
  }
  return "active";
}

function mapAttachments(item: ChatGroupListItemDto): ChatGroupAttachment[] {
  const attachments: ChatGroupAttachment[] = [];
  if (item.allowDocuments) {
    attachments.push({ type: "pdf" });
    attachments.push({ type: "doc" });
  }
  if (item.allowImages) {
    attachments.push({ type: "img" });
  }
  if (item.allowWebLinks) {
    attachments.push({ type: "xls" });
  }
  return attachments;
}

function buildCourseSubtitle(item: ChatGroupListItemDto): string {
  const parts = [item.subjectNameAr, item.gradeNameAr].filter(
    (part) => part && part !== "—",
  );
  return parts.length > 0 ? parts.join(" · ") : "—";
}

export function mapChatGroupListItemToRow(
  item: ChatGroupListItemDto,
  lastActivityDisplay: string,
): ChatGroupRow {
  return {
    id: item.chatGroupId,
    courseId: item.courseId,
    groupName: item.groupName,
    courseSubtitle: buildCourseSubtitle(item),
    colorIndicator: colorFromId(item.chatGroupId),
    studentCount: item.studentsCount,
    chatModeId: mapChatMode(item.chatMode),
    attachments: mapAttachments(item),
    statusId: mapStatus(item.status, item.isLocked),
    lastActivityKey: "",
    lastActivityDisplay,
  };
}

export function mapChatGroupDetailToFormValues(detail: ChatGroupDetailDto): ChatGroupFormValues {
  const mediaBlocked =
    !detail.allowImages && !detail.allowDocuments && !detail.allowWebLinks;

  return {
    ...defaultChatGroupFormValues,
    chatGroupId: detail.chatGroupId,
    courseId: detail.courseId,
    groupName: detail.groupName,
    subjectDisplayName: detail.subjectNameAr,
    gradeDisplayName: detail.gradeNameAr,
    chatModeId: detail.isTeachersOnly ? "teacherOnly" : "everyone",
    mediaPermissions: {
      allowImages: detail.allowImages,
      allowFiles: detail.allowDocuments,
      allowPdf: detail.allowDocuments,
      allowWebLinks: detail.allowWebLinks,
    },
    blockAttachments: mediaBlocked,
    parentViewOnly: detail.allowParentView,
    isLocked: detail.isLocked,
  };
}

export function mapChatGroupFormToUpdatePayload(
  form: ChatGroupFormValues,
): UpdateChatGroupPayload {
  const blocked = form.blockAttachments;

  return {
    displayName: form.groupName.trim(),
    isTeachersOnly: form.chatModeId === "teacherOnly",
    allowImages: blocked ? false : form.mediaPermissions.allowImages,
    allowDocuments: blocked
      ? false
      : form.mediaPermissions.allowFiles || form.mediaPermissions.allowPdf,
    allowWebLinks: blocked ? false : form.mediaPermissions.allowWebLinks,
    allowParentView: form.parentViewOnly,
    isLocked: form.isLocked,
  };
}
