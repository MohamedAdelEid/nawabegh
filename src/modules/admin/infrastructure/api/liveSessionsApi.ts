import type { BackendStatus } from "@/shared/domain/types/api.types";
import { env } from "@/shared/infrastructure/config/env";
import { httpClient } from "@/shared/infrastructure/http/httpClient";

type UnknownRecord = Record<string, unknown>;

export type LiveSessionApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

export type LiveSessionGoalPayload = {
  text: string;
  order: number;
};

export type LiveSessionPreTaskPayload = {
  title: string;
  description: string;
  order: number;
};

export type LiveSessionAttachmentPayload = {
  fileName: string;
  fileUrl: string;
  fileType: string;
  order: number;
};

export type CreateLiveSessionPayload = {
  stationId: string;
  title: string;
  coverImageUrl: string;
  description: string;
  responsibleTeacherId: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  roomUrl: string;
  goals: LiveSessionGoalPayload[];
  preSessionTasks: LiveSessionPreTaskPayload[];
  attachments: LiveSessionAttachmentPayload[];
};

export type LiveSessionResponsibleTeacher = {
  userId: string;
  fullName: string;
  profileImageUrl: string | null;
  jobTitle: string;
};

export type LiveSessionGoal = {
  id: number;
  text: string;
  order: number;
};

export type LiveSessionTask = {
  id: number;
  title: string;
  description: string;
  order: number;
};

export type LiveSessionAttachment = {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  order: number;
};

export type LiveSession = {
  id: string;
  stationId: string;
  stationName: string;
  stationType: number;
  courseId: string;
  courseTitle: string;
  learningPathId: string;
  learningPathTitle: string;
  title: string;
  coverImageUrl: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  scheduledAt: string;
  durationMinutes: number;
  roomUrl: string;
  zoomMeetingId: string;
  zoomJoinUrl: string;
  zoomStartUrl: string;
  zoomPassword: string;
  status: string;
  recordingUrl: string | null;
  recordingLinkedAt: string | null;
  activeEnrollmentCount: number;
  responsibleTeacher: LiveSessionResponsibleTeacher | null;
  goals: LiveSessionGoal[];
  tasks: LiveSessionTask[];
  attachments: LiveSessionAttachment[];
};

export type CreatedLiveSession = {
  id: string;
  stationId: string;
  title: string;
  scheduledDate: string;
  scheduledTime: string;
  scheduledAt: string;
  durationMinutes: number;
  zoomMeetingId: string;
  zoomJoinUrl: string;
  zoomStartUrl: string;
  zoomPassword: string;
};

export type LiveStationPreSessionTask = {
  title: string;
  description: string;
  order: number;
};

export type LiveStationFeatures = {
  interactiveChatEnabled: boolean;
  highQualityStream: boolean;
  recordingAfterSession: boolean;
};

export type LiveStationInfo = {
  liveSessionId: string | null;
  stationType: number;
  title: string;
  description: string;
  coverImageUrl: string;
  scheduledAt: string;
  scheduledEndAt: string;
  durationMinutes: number;
  status: number;
  runtimeMode: number;
  recordingUrl: string | null;
  learningGoals: string[];
  preSessionTasks: LiveStationPreSessionTask[];
  attachments: LiveSessionAttachment[];
  responsibleTeacherId: string;
  hostIdentity: string;
  courseTitle: string;
  learningPathTitle: string;
  responsibleTeacher: LiveSessionResponsibleTeacher | null;
  remainingMinutes: number;
  features: LiveStationFeatures | null;
};

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" ? (value as UnknownRecord) : null;
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

function mapHttpStatus(statusCode: number | null): BackendStatus | "Error" {
  switch (statusCode) {
    case 400:
      return "BadRequest";
    case 401:
      return "Unauthorized";
    case 403:
      return "Forbidden";
    case 404:
      return "NotFound";
    case 409:
      return "Conflict";
    default:
      return "Error";
  }
}

function extractEnvelopeData(data: unknown): unknown {
  const record = asRecord(data);
  return record?.data ?? data;
}

function buildErrorResult<T>(error: unknown, fallbackMessage: string): LiveSessionApiResult<T> {
  const axiosError = asRecord(error);
  const response = asRecord(axiosError?.response);
  const responseData = asRecord(response?.data);
  const httpStatusCode = response ? readNumber(response, ["status"], 0) : null;

  const detailMessage =
    readString(responseData, ["detail", "title", "message"], "") ||
    readString(asRecord(responseData?.error), ["message"], "") ||
    (typeof axiosError?.message === "string" ? axiosError.message : fallbackMessage);

  return {
    status: mapHttpStatus(httpStatusCode),
    errorMessage: detailMessage,
    data: null,
  };
}

function mapResponsibleTeacher(data: unknown): LiveSessionResponsibleTeacher | null {
  const record = asRecord(data);
  const userId = readString(record, ["userId", "id"], "").trim();
  if (!record || !userId) return null;

  return {
    userId,
    fullName: readString(record, ["fullName", "name"], ""),
    profileImageUrl: readNullableString(record, ["profileImageUrl", "avatarUrl"]),
    jobTitle: readString(record, ["jobTitle", "title"], ""),
  };
}

function mapGoal(data: unknown): LiveSessionGoal | null {
  const record = asRecord(data);
  if (!record) return null;
  const text = readString(record, ["text"], "").trim();
  if (!text) return null;

  return {
    id: readNumber(record, ["id"]),
    text,
    order: readNumber(record, ["order"]),
  };
}

function mapTask(data: unknown): LiveSessionTask | null {
  const record = asRecord(data);
  if (!record) return null;
  const title = readString(record, ["title", "label"], "").trim();
  if (!title) return null;

  return {
    id: readNumber(record, ["id"]),
    title,
    description: readString(record, ["description", "subtitle"], ""),
    order: readNumber(record, ["order"]),
  };
}

function mapAttachment(data: unknown): LiveSessionAttachment | null {
  const record = asRecord(data);
  if (!record) return null;
  const fileName = readString(record, ["fileName", "name"], "").trim();
  if (!fileName) return null;

  return {
    id: readNumber(record, ["id"]),
    fileName,
    fileUrl: readString(record, ["fileUrl", "url"], ""),
    fileType: readString(record, ["fileType", "type"], ""),
    order: readNumber(record, ["order"]),
  };
}

function mapLearningResource(data: unknown, order: number): LiveSessionAttachment | null {
  const record = asRecord(data);
  if (!record) return null;
  const fileName = readString(record, ["fileName", "title", "name"], "").trim();
  if (!fileName) return null;

  const idRaw = readString(record, ["id", "fileId"], "");
  const numericId = Number(idRaw);

  return {
    id: Number.isFinite(numericId) && numericId > 0 ? numericId : order + 1,
    fileName,
    fileUrl: readString(record, ["fileUrl", "url"], ""),
    fileType: readString(record, ["fileType", "type", "source"], ""),
    order,
  };
}

function resolveBroadcastLink(record: UnknownRecord | null): string {
  const hostTokenPath = readString(record, ["hostTokenPath"], "").trim();
  const roomUrl = readString(record, ["roomUrl", "broadcastLink"], "").trim();
  const zoomJoinUrl = readString(record, ["zoomJoinUrl"], "").trim();

  if (hostTokenPath) {
    if (hostTokenPath.startsWith("http://") || hostTokenPath.startsWith("https://")) {
      return hostTokenPath;
    }
    const base = env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
    return `${base}${hostTokenPath.startsWith("/") ? hostTokenPath : `/${hostTokenPath}`}`;
  }

  return roomUrl || zoomJoinUrl;
}

function mapLiveSessionAttachments(record: UnknownRecord | null): LiveSessionAttachment[] {
  const attachments = readArray(record, ["attachments"])
    .map(mapAttachment)
    .filter((attachment): attachment is LiveSessionAttachment => Boolean(attachment));

  const learningResources = readArray(record, ["learningResources"])
    .map((item, index) => mapLearningResource(item, index))
    .filter((resource): resource is LiveSessionAttachment => Boolean(resource));

  return attachments.length > 0 ? attachments : learningResources;
}

function mapLiveSession(data: unknown): LiveSession | null {
  const record = asRecord(extractEnvelopeData(data));
  const id = readString(record, ["id", "liveSessionId", "sessionId"], "").trim();
  if (!record || !id) return null;

  const broadcastLink = resolveBroadcastLink(record);
  const runtimeMode = readString(record, ["runtimeMode"], "");
  const status = readString(record, ["status"], "");

  return {
    id,
    stationId: readString(record, ["stationId"], ""),
    stationName: readString(record, ["stationName"], ""),
    stationType: readNumber(record, ["stationType"]),
    courseId: readString(record, ["courseId"], ""),
    courseTitle: readString(record, ["courseTitle"], ""),
    learningPathId: readString(record, ["learningPathId"], ""),
    learningPathTitle: readString(record, ["learningPathTitle"], ""),
    title: readString(record, ["title", "sessionTitle"], ""),
    coverImageUrl: readString(record, ["coverImageUrl", "thumbnailUrl", "courseCoverImageUrl"], ""),
    description: readString(record, ["description"], ""),
    scheduledDate: readString(record, ["scheduledDate"], ""),
    scheduledTime: readString(record, ["scheduledTime"], ""),
    scheduledAt: readString(record, ["scheduledAt", "scheduledAtUtc"], ""),
    durationMinutes: readNumber(record, ["durationMinutes", "durationMin"]),
    roomUrl: broadcastLink,
    zoomMeetingId: readString(record, ["zoomMeetingId"], ""),
    zoomJoinUrl: broadcastLink || readString(record, ["zoomJoinUrl"], ""),
    zoomStartUrl: readString(record, ["zoomStartUrl"], ""),
    zoomPassword: readString(record, ["zoomPassword"], ""),
    status: runtimeMode || status,
    recordingUrl: readNullableString(record, ["recordingUrl"]),
    recordingLinkedAt: readNullableString(record, ["recordingLinkedAt"]),
    activeEnrollmentCount: readNumber(record, [
      "activeEnrollmentCount",
      "registeredCount",
      "enrolledCount",
    ]),
    responsibleTeacher: mapResponsibleTeacher(record.responsibleTeacher),
    goals: readArray(record, ["goals", "objectives"])
      .map(mapGoal)
      .filter((goal): goal is LiveSessionGoal => Boolean(goal)),
    tasks: readArray(record, ["tasks", "preSessionTasks", "preTasks"])
      .map(mapTask)
      .filter((task): task is LiveSessionTask => Boolean(task)),
    attachments: mapLiveSessionAttachments(record),
  };
}

function mapCreatedLiveSession(data: unknown): CreatedLiveSession | null {
  const record = asRecord(extractEnvelopeData(data));
  const id = readString(record, ["id", "liveSessionId", "sessionId"], "").trim();
  if (!record || !id) return null;

  return {
    id,
    stationId: readString(record, ["stationId"], ""),
    title: readString(record, ["title"], ""),
    scheduledDate: readString(record, ["scheduledDate"], ""),
    scheduledTime: readString(record, ["scheduledTime"], ""),
    scheduledAt: readString(record, ["scheduledAt"], ""),
    durationMinutes: readNumber(record, ["durationMinutes", "durationMin"]),
    zoomMeetingId: readString(record, ["zoomMeetingId"], ""),
    zoomJoinUrl: readString(record, ["zoomJoinUrl"], ""),
    zoomStartUrl: readString(record, ["zoomStartUrl"], ""),
    zoomPassword: readString(record, ["zoomPassword"], ""),
  };
}

function mapLearningGoals(data: unknown): string[] {
  if (!Array.isArray(data)) return [];
  return data
    .map((item) => {
      if (typeof item === "string") return item.trim();
      return readString(asRecord(item), ["text", "title"], "").trim();
    })
    .filter(Boolean);
}

function mapLiveStationPreSessionTask(data: unknown): LiveStationPreSessionTask | null {
  const record = asRecord(data);
  if (!record) return null;
  const title = readString(record, ["title"], "").trim();
  if (!title) return null;

  return {
    title,
    description: readString(record, ["description"], ""),
    order: readNumber(record, ["order"]),
  };
}

function mapLiveStationFeatures(data: unknown): LiveStationFeatures | null {
  const record = asRecord(data);
  if (!record) return null;

  return {
    interactiveChatEnabled: readBoolean(record, ["interactiveChatEnabled"]),
    highQualityStream: readBoolean(record, ["highQualityStream"]),
    recordingAfterSession: readBoolean(record, ["recordingAfterSession"]),
  };
}

function mapLiveStationInfo(data: unknown): LiveStationInfo | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;

  const liveSessionId = readString(record, ["liveSessionId"], "").trim() || null;

  return {
    liveSessionId,
    stationType: readNumber(record, ["stationType"]),
    title: readString(record, ["title"], ""),
    description: readString(record, ["description"], ""),
    coverImageUrl: readString(record, ["coverImageUrl"], ""),
    scheduledAt: readString(record, ["scheduledAt"], ""),
    scheduledEndAt: readString(record, ["scheduledEndAt", "scheduledEndUtc"], ""),
    durationMinutes: readNumber(record, ["durationMinutes", "durationMin"]),
    status: readNumber(record, ["status"]),
    runtimeMode: readNumber(record, ["runtimeMode"]),
    recordingUrl: readNullableString(record, ["recordingUrl"]),
    learningGoals: mapLearningGoals(record.learningGoals),
    preSessionTasks: readArray(record, ["preSessionTasks", "tasks"])
      .map(mapLiveStationPreSessionTask)
      .filter((task): task is LiveStationPreSessionTask => Boolean(task)),
    attachments: readArray(record, ["attachments"])
      .map(mapAttachment)
      .filter((attachment): attachment is LiveSessionAttachment => Boolean(attachment)),
    responsibleTeacherId: readString(record, ["responsibleTeacherId"], ""),
    hostIdentity: readString(record, ["hostIdentity"], ""),
    courseTitle: readString(record, ["courseTitle"], ""),
    learningPathTitle: readString(record, ["learningPathTitle"], ""),
    responsibleTeacher: mapResponsibleTeacher(record.responsibleTeacher),
    remainingMinutes: readNumber(record, ["remainingMinutes", "startsInMinutes"]),
    features: mapLiveStationFeatures(record.features),
  };
}

export async function createLiveSession(
  payload: CreateLiveSessionPayload,
): Promise<LiveSessionApiResult<CreatedLiveSession>> {
  try {
    const response = await httpClient.post<unknown>({
      url: "/api/v1/live-sessions",
      data: payload,
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapCreatedLiveSession(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to create live session");
  }
}

export async function getLiveSession(
  sessionId: string,
): Promise<LiveSessionApiResult<LiveSession>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/live-sessions/${encodeURIComponent(sessionId)}`,
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapLiveSession(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load live session");
  }
}

export async function getLiveSessionWorkspace(
  sessionId: string,
): Promise<LiveSessionApiResult<LiveSession>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/Teacher/live-sessions/${encodeURIComponent(sessionId)}/workspace`,
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapLiveSession(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load live session workspace");
  }
}

export async function getLiveStationInfo(
  stationId: string,
): Promise<LiveSessionApiResult<LiveStationInfo>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/live-stations/${encodeURIComponent(stationId)}/info`,
    });

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapLiveStationInfo(response.data),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load live station info");
  }
}

export async function getLiveSessionIdForStation(
  stationId: string,
): Promise<LiveSessionApiResult<string>> {
  const result = await getLiveStationInfo(stationId);
  return {
    status: result.status,
    message: result.message,
    errorMessage: result.errorMessage,
    data: result.data?.liveSessionId ?? null,
  };
}
