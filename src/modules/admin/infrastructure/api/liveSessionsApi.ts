import type { BackendStatus } from "@/shared/domain/types/api.types";
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

function mapLiveSession(data: unknown): LiveSession | null {
  const record = asRecord(extractEnvelopeData(data));
  const id = readString(record, ["id", "liveSessionId", "sessionId"], "").trim();
  if (!record || !id) return null;

  return {
    id,
    stationId: readString(record, ["stationId"], ""),
    stationName: readString(record, ["stationName"], ""),
    stationType: readNumber(record, ["stationType"]),
    courseId: readString(record, ["courseId"], ""),
    courseTitle: readString(record, ["courseTitle"], ""),
    learningPathId: readString(record, ["learningPathId"], ""),
    learningPathTitle: readString(record, ["learningPathTitle"], ""),
    title: readString(record, ["title"], ""),
    coverImageUrl: readString(record, ["coverImageUrl", "thumbnailUrl"], ""),
    description: readString(record, ["description"], ""),
    scheduledDate: readString(record, ["scheduledDate"], ""),
    scheduledTime: readString(record, ["scheduledTime"], ""),
    scheduledAt: readString(record, ["scheduledAt"], ""),
    durationMinutes: readNumber(record, ["durationMinutes", "durationMin"]),
    roomUrl: readString(record, ["roomUrl", "broadcastLink"], ""),
    zoomMeetingId: readString(record, ["zoomMeetingId"], ""),
    zoomJoinUrl: readString(record, ["zoomJoinUrl"], ""),
    zoomStartUrl: readString(record, ["zoomStartUrl"], ""),
    zoomPassword: readString(record, ["zoomPassword"], ""),
    status: readString(record, ["status"], ""),
    recordingUrl: readNullableString(record, ["recordingUrl"]),
    recordingLinkedAt: readNullableString(record, ["recordingLinkedAt"]),
    activeEnrollmentCount: readNumber(record, ["activeEnrollmentCount", "registeredCount"]),
    responsibleTeacher: mapResponsibleTeacher(record.responsibleTeacher),
    goals: readArray(record, ["goals", "objectives"])
      .map(mapGoal)
      .filter((goal): goal is LiveSessionGoal => Boolean(goal)),
    tasks: readArray(record, ["tasks", "preSessionTasks", "preTasks"])
      .map(mapTask)
      .filter((task): task is LiveSessionTask => Boolean(task)),
    attachments: readArray(record, ["attachments"])
      .map(mapAttachment)
      .filter((attachment): attachment is LiveSessionAttachment => Boolean(attachment)),
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

function findLiveSessionId(value: unknown): string {
  const record = asRecord(value);
  if (!record) return "";

  const explicitSessionId = readString(
    record,
    ["liveSessionId", "liveStreamSessionId", "sessionId"],
    "",
  ).trim();
  if (explicitSessionId) return explicitSessionId;

  for (const key of ["liveSession", "liveStreamSession", "session", "liveBroadcast"]) {
    const nestedId = findLiveSessionId(record[key]);
    if (nestedId) return nestedId;
  }

  return "";
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

export async function getLiveSessionIdForStation(
  stationId: string,
): Promise<LiveSessionApiResult<string>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `/api/v1/Station/${encodeURIComponent(stationId)}`,
    });
    const sessionId = findLiveSessionId(extractEnvelopeData(response.data));

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: sessionId || null,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load station live session");
  }
}
