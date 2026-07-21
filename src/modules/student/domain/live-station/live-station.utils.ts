import { LiveSessionRuntimeMode } from "@/modules/student/domain/progress/progress.enums";
import { StudentStationProgressStatus } from "@/modules/student/domain/progress/progress.enums";
import type {
  LiveChatMessageDto,
  LiveChatMessagesPageDto,
  LiveHandRaisedEvent,
  LiveParticipantDto,
  LiveRecordingProgressDto,
  LiveStationAttachment,
  LiveStationCompletionResultDto,
  LiveStationFeatures,
  LiveStationInfoDto,
  LiveStationJoinResultDto,
  LiveStationPhase,
  LiveStationPreSessionTask,
  LiveStationResponsibleTeacher,
} from "./live-station.types";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function readString(record: UnknownRecord | null, keys: string[], fallback = ""): string {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") return value;
  }
  return fallback;
}

function readNumber(record: UnknownRecord | null, keys: string[], fallback = 0): number {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return fallback;
}

function readNullableString(record: UnknownRecord | null, keys: string[]): string | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed || null;
    }
    if (value === null) return null;
  }
  return null;
}

function readBoolean(record: UnknownRecord | null, keys: string[], fallback = false): boolean {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true") return true;
      if (normalized === "false") return false;
    }
  }
  return fallback;
}

function readArray(record: UnknownRecord | null, keys: string[]): unknown[] {
  if (!record) return [];
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function parseRuntimeMode(value: unknown): LiveSessionRuntimeMode {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value as LiveSessionRuntimeMode;
  }
  if (typeof value !== "string") return LiveSessionRuntimeMode.Upcoming;

  const trimmed = value.trim();
  if (trimmed !== "" && !Number.isNaN(Number(trimmed))) {
    return Number(trimmed) as LiveSessionRuntimeMode;
  }

  switch (trimmed.toLowerCase()) {
    case "live":
      return LiveSessionRuntimeMode.Live;
    case "recorded":
    case "recordingavailable":
      return LiveSessionRuntimeMode.Recorded;
    case "endedwithoutrecording":
    case "ended":
      return LiveSessionRuntimeMode.EndedWithoutRecording;
    default:
      return LiveSessionRuntimeMode.Upcoming;
  }
}

function mapTeacher(value: unknown): LiveStationResponsibleTeacher | null {
  const record = asRecord(value);
  if (!record) return null;
  const userId = readString(record, ["userId", "id"], "").trim();
  const fullName = readString(record, ["fullName", "name", "displayName"], "").trim();
  if (!userId && !fullName) return null;
  return {
    userId,
    fullName,
    profileImageUrl: readNullableString(record, ["profileImageUrl", "avatarUrl", "imageUrl"]),
    jobTitle: readString(record, ["jobTitle", "title"], ""),
  };
}

function mapFeatures(value: unknown): LiveStationFeatures | null {
  const record = asRecord(value);
  if (!record) return null;
  return {
    interactiveChatEnabled: readBoolean(record, ["interactiveChatEnabled"], true),
    highQualityStream: readBoolean(record, ["highQualityStream"], true),
    recordingAfterSession: readBoolean(record, ["recordingAfterSession"], true),
  };
}

function mapAttachment(value: unknown, index: number): LiveStationAttachment | null {
  const record = asRecord(value);
  if (!record) return null;
  const fileUrl = readString(record, ["fileUrl", "url"], "").trim();
  if (!fileUrl) return null;
  return {
    id: readString(record, ["id"], `attachment-${index}`),
    fileName: readString(record, ["fileName", "name"], `file-${index}`),
    fileUrl,
    fileType: readString(record, ["fileType", "contentType", "mimeType"], "application/pdf"),
    order: readNumber(record, ["order"], index),
  };
}

function mapTask(value: unknown, index: number): LiveStationPreSessionTask | null {
  const record = asRecord(value);
  if (!record) return null;
  const title = readString(record, ["title"], "").trim();
  if (!title) return null;
  return {
    title,
    description: readString(record, ["description"], ""),
    order: readNumber(record, ["order"], index),
  };
}

function mapLearningGoals(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      const record = asRecord(item);
      return readString(record, ["text", "title", "goal"], "").trim();
    })
    .filter(Boolean);
}

export function mapLiveStationInfoDto(data: unknown): LiveStationInfoDto | null {
  const record = asRecord(data);
  if (!record) return null;

  const title = readString(record, ["title"], "").trim();
  if (!title) return null;

  return {
    liveSessionId: readNullableString(record, ["liveSessionId"]),
    stationType: readNumber(record, ["stationType"]),
    title,
    description: readString(record, ["description"], ""),
    coverImageUrl: readString(record, ["coverImageUrl"], ""),
    scheduledAt: readString(record, ["scheduledAt"], ""),
    scheduledEndAt: readString(record, ["scheduledEndAt", "scheduledEndUtc"], ""),
    durationMinutes: readNumber(record, ["durationMinutes", "durationMin"]),
    status: readNumber(record, ["status"]),
    runtimeMode: parseRuntimeMode(record.runtimeMode),
    recordingUrl: readNullableString(record, ["recordingUrl"]),
    studentProgressStatus: readNumber(
      record,
      ["studentProgressStatus"],
      StudentStationProgressStatus.Available,
    ) as StudentStationProgressStatus,
    studentHasAttended: readBoolean(record, ["studentHasAttended"]),
    studentMinutesAttended: readNumber(record, ["studentMinutesAttended"]),
    liveParticipantCount: readNumber(record, ["liveParticipantCount", "participantCount"]),
    learningGoals: mapLearningGoals(record.learningGoals),
    preSessionTasks: readArray(record, ["preSessionTasks", "tasks"])
      .map(mapTask)
      .filter((task): task is LiveStationPreSessionTask => Boolean(task)),
    attachments: readArray(record, ["attachments"])
      .map(mapAttachment)
      .filter((item): item is LiveStationAttachment => Boolean(item)),
    responsibleTeacherId: readString(record, ["responsibleTeacherId"], ""),
    hostIdentity: readString(record, ["hostIdentity"], ""),
    courseTitle: readString(record, ["courseTitle"], ""),
    learningPathTitle: readString(record, ["learningPathTitle"], ""),
    responsibleTeacher: mapTeacher(record.responsibleTeacher),
    remainingMinutes: readNumber(record, ["remainingMinutes", "startsInMinutes"]),
    features: mapFeatures(record.features),
  };
}

export function mapLiveStationJoinResultDto(data: unknown): LiveStationJoinResultDto | null {
  const record = asRecord(data);
  if (!record) return null;
  const token = readString(record, ["token"], "").trim();
  const wsUrl = readString(record, ["wsUrl", "roomUrl"], "").trim();
  const liveSessionId = readString(record, ["liveSessionId"], "").trim();
  if (!token || !wsUrl || !liveSessionId) return null;

  return {
    liveSessionId,
    roomName: readString(record, ["roomName"], ""),
    token,
    wsUrl,
    studentDisplayName: readString(record, ["studentDisplayName", "displayName"], ""),
    studentEmail: readString(record, ["studentEmail", "email"], ""),
  };
}

export function mapLiveChatMessageDto(data: unknown): LiveChatMessageDto | null {
  const record = asRecord(data);
  if (!record) return null;
  const id = readString(record, ["id"], "").trim();
  const body = readString(record, ["body", "message", "text"], "");
  if (!id && !body) return null;

  return {
    id: id || `msg-${readString(record, ["sentAt"], Date.now().toString())}`,
    liveSessionId: readString(record, ["liveSessionId"], ""),
    senderId: readString(record, ["senderId", "userId"], ""),
    senderName: readString(record, ["senderName", "displayName"], ""),
    senderRole: readString(record, ["senderRole", "role"], "Student"),
    body,
    sentAt: readString(record, ["sentAt", "createdAt"], new Date().toISOString()),
    isSystemEvent: readBoolean(record, ["isSystemEvent", "isSystem"]),
  };
}

export function mapLiveChatMessagesPageDto(data: unknown): LiveChatMessagesPageDto {
  const record = asRecord(data);
  const items = readArray(record, ["items", "messages"])
    .map(mapLiveChatMessageDto)
    .filter((item): item is LiveChatMessageDto => Boolean(item));

  return {
    items,
    pageNumber: readNumber(record, ["pageNumber"], 1),
    pageSize: readNumber(record, ["pageSize"], items.length || 50),
    totalCount: readNumber(record, ["totalCount"], items.length),
    totalPages: readNumber(record, ["totalPages"], 1),
  };
}

export function mapLiveParticipantDto(data: unknown): LiveParticipantDto | null {
  const record = asRecord(data);
  if (!record) return null;
  const userId = readString(record, ["userId", "id"], "").trim();
  const displayName = readString(record, ["displayName", "fullName", "name"], "").trim();
  if (!userId && !displayName) return null;

  return {
    userId,
    displayName,
    profileImageUrl: readNullableString(record, ["profileImageUrl", "avatarUrl", "imageUrl"]),
    role: readString(record, ["role"], "Student"),
    isHandRaised: readBoolean(record, ["isHandRaised", "handRaised"]),
    isMuted: readBoolean(record, ["isMuted"], true),
    isCameraOff: readBoolean(record, ["isCameraOff"], true),
  };
}

export function mapLiveHandRaisedEvent(data: unknown): LiveHandRaisedEvent | null {
  const record = asRecord(data);
  if (!record) return null;
  const userId = readString(record, ["userId", "id"], "").trim();
  if (!userId) return null;
  return {
    userId,
    displayName: readString(record, ["displayName", "fullName", "name"], ""),
    raised: readBoolean(record, ["raised", "isHandRaised"], true),
  };
}

export function mapLiveRecordingProgressDto(data: unknown): LiveRecordingProgressDto {
  const record = asRecord(data);
  return {
    lastPositionSeconds: readNumber(record, ["lastPositionSeconds", "positionSeconds"]),
    durationSeconds: (() => {
      const value = readNumber(record, ["durationSeconds"], -1);
      return value < 0 ? null : value;
    })(),
  };
}

export function mapLiveStationCompletionResultDto(
  data: unknown,
): LiveStationCompletionResultDto | null {
  const record = asRecord(data);
  if (!record) return null;
  return {
    pathCompleted: readBoolean(record, ["pathCompleted"]),
    pathId: readNullableString(record, ["pathId"]),
    pathPointsEarned: readNumber(record, ["pathPointsEarned", "pointsEarned"]),
    totalPoints: readNumber(record, ["totalPoints"]),
    currentLevel: readNumber(record, ["currentLevel"]),
    pointsToNextLevel: readNumber(record, ["pointsToNextLevel"]),
  };
}

export function phaseForRuntimeMode(mode: LiveSessionRuntimeMode): LiveStationPhase {
  switch (mode) {
    case LiveSessionRuntimeMode.Recorded:
      return "recorded";
    case LiveSessionRuntimeMode.EndedWithoutRecording:
      return "ended";
    case LiveSessionRuntimeMode.Live:
    case LiveSessionRuntimeMode.Upcoming:
    default:
      return "overview";
  }
}

export function canJoinLive(info: LiveStationInfoDto): boolean {
  return (
    info.runtimeMode === LiveSessionRuntimeMode.Live &&
    info.studentProgressStatus !== StudentStationProgressStatus.Locked
  );
}

export function isTeacherRole(role: string): boolean {
  const normalized = role.trim().toLowerCase();
  return normalized === "teacher" || normalized === "host" || normalized === "instructor";
}

export function formatSessionShortId(liveSessionId: string | null | undefined): string {
  if (!liveSessionId) return "—";
  const compact = liveSessionId.replace(/-/g, "");
  return compact.slice(0, 4).toUpperCase() || "—";
}

export function formatMinutesLabel(minutes: number): string {
  return `${Math.max(0, Math.round(minutes))}`;
}

export function appendChatMessage(
  messages: LiveChatMessageDto[],
  next: LiveChatMessageDto,
): LiveChatMessageDto[] {
  if (messages.some((msg) => msg.id === next.id)) return messages;
  return [...messages, next];
}

export function mergeHandRaiseIntoParticipants(
  participants: LiveParticipantDto[],
  event: LiveHandRaisedEvent,
): LiveParticipantDto[] {
  return participants.map((participant) =>
    participant.userId === event.userId
      ? { ...participant, isHandRaised: event.raised }
      : participant,
  );
}
