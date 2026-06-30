import axiosClient from "@/shared/infrastructure/http/axiosClient";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { parseXPaginationHeader } from "@/shared/infrastructure/http/xPagination";
import { FILE_UPLOAD_URL } from "@/shared/infrastructure/files/fileUrl";
import type {
  CreateSchoolAnnouncementResult,
  SchoolAnnouncementAttachment,
  SchoolAnnouncementAttachmentInput,
  SchoolAnnouncementAudience,
  SchoolAnnouncementChannel,
  SchoolAnnouncementDetail,
  SchoolAnnouncementKpis,
  SchoolAnnouncementListFilter,
  SchoolAnnouncementListItem,
  SchoolAnnouncementListPage,
  SchoolAnnouncementOperationLogEntry,
  SchoolAnnouncementStatusTone,
  SchoolAnnouncementType,
  SchoolDashboardActivityItem,
  SchoolDashboardCallout,
  SchoolDashboardData,
  SchoolDashboardSidebarItem,
  SchoolDeliveryChannelCode,
  SchoolRealtimeTracking,
  UpsertSchoolAnnouncementPayload,
} from "@/modules/school/domain/types/schoolAnnouncements.types";
import {
  SCHOOL_ANNOUNCEMENTS_SEED_DASHBOARD,
  SCHOOL_ANNOUNCEMENTS_SEED_KPIS,
  SCHOOL_ANNOUNCEMENTS_SEED_ROWS,
  getSchoolAnnouncementSeedDetail,
} from "@/modules/school/domain/data/schoolAnnouncementsSeed";

const BASE = "/api/v1/school/announcements";
const USE_MOCK = process.env.NEXT_PUBLIC_SCHOOL_ANNOUNCEMENTS_USE_MOCK === "true";

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
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return fallback;
}

function readNumber(record: UnknownRecord | null, keys: string[], fallback = 0): number {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return fallback;
}

function readNullableNumber(record: UnknownRecord | null, keys: string[]): number | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

function readBoolean(record: UnknownRecord | null, keys: string[], fallback = false): boolean {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
    if (value === "true") return true;
    if (value === "false") return false;
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

function unwrapData(data: unknown): unknown {
  const record = asRecord(data);
  if (record && "data" in record) return record.data;
  return data;
}

function normalizeType(raw: string): SchoolAnnouncementType {
  return raw.toLowerCase().includes("urgent") || raw.toLowerCase().includes("alert")
    ? "UrgentAlert"
    : "Ad";
}

function normalizeStatusTone(raw: string, isUrgent: boolean): SchoolAnnouncementStatusTone {
  if (isUrgent) return "urgent";
  const l = raw.toLowerCase();
  if (l.includes("draft")) return "draft";
  if (l.includes("schedul")) return "scheduled";
  if (l.includes("fail")) return "failed";
  if (l.includes("process") || l.includes("sending") || l.includes("pending")) return "sending";
  if (l.includes("success")) return "success";
  return "published";
}

function normalizeAudience(raw: string): SchoolAnnouncementAudience {
  const l = raw.toLowerCase();
  const hasStudent = l.includes("student");
  const hasTeacher = l.includes("teacher");
  const hasParent = l.includes("parent");
  if (l === "students_teachers_parents" || (hasStudent && hasTeacher && hasParent)) {
    return "studentsTeachersParents";
  }
  if (hasStudent) return "students";
  if (hasParent) return "parents";
  if (hasTeacher) return "teachers";
  return "all";
}

function audienceToApiCode(audience: SchoolAnnouncementAudience): string {
  switch (audience) {
    case "students":
      return "students";
    case "parents":
      return "parents";
    case "teachers":
      return "teachers";
    case "studentsTeachersParents":
      return "students_teachers_parents";
    default:
      return "all";
  }
}

function normalizeChannelCode(raw: string): SchoolDeliveryChannelCode {
  const l = raw.toLowerCase();
  if (l.includes("push") || l.includes("mobile")) return "MobilePush";
  if (l.includes("sms")) return "Sms";
  return "InApp";
}

function mapKpis(data: unknown): SchoolAnnouncementKpis {
  const record = asRecord(data);
  return {
    totalAnnouncements: readNumber(record, ["totalAnnouncements"]),
    totalAnnouncementsChangePercent: readNullableNumber(record, [
      "totalAnnouncementsChangePercent",
    ]),
    activeAlerts: readNumber(record, ["activeAlerts"]),
    activeAlertsChangePercent: readNullableNumber(record, ["activeAlertsChangePercent"]),
    reachRate: readNumber(record, ["reachRate"]),
    reachRateLabel: readString(record, ["reachRateLabel"]) || null,
    scheduledSoon: readNumber(record, ["scheduledSoon"]),
  };
}

function mapListItem(item: unknown): SchoolAnnouncementListItem | null {
  const record = asRecord(item);
  if (!record) return null;
  const id = readString(record, ["id", "announcementId"]);
  if (!id) return null;
  const isUrgent = readBoolean(record, ["isUrgent"]);
  const status = readString(record, ["status"], "Published");
  const statusTone = normalizeStatusTone(status, isUrgent);
  const canEdit = readBoolean(record, ["canEdit"], statusTone === "draft" || statusTone === "scheduled");
  const canDelete = readBoolean(record, ["canDelete"], statusTone === "draft" || statusTone === "scheduled");
  return {
    id,
    referenceCode: readString(record, ["referenceCode"]),
    title: readString(record, ["title"], "—"),
    type: normalizeType(readString(record, ["type"], "Ad")),
    isUrgent,
    audience: normalizeAudience(readString(record, ["audience"], "all")),
    audienceLabel: readString(record, ["audienceLabel"]),
    statusTone,
    statusLabel: readString(record, ["statusLabel"]),
    date: readString(record, ["date", "createdAt", "sentAt"]),
    reachPercentage: readNumber(record, ["reachPercentage"]),
    sentCount: readNumber(record, ["sentCount"]),
    failedCount: readNumber(record, ["failedCount"]),
    totalRecipients: readNumber(record, ["totalRecipients"]),
    canEdit,
    canDelete,
    canView: readBoolean(record, ["canView"], true),
  };
}

function mapChannels(value: unknown): SchoolAnnouncementChannel[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const record = asRecord(item);
      if (!record) return null;
      return {
        code: normalizeChannelCode(readString(record, ["code"], "InApp")),
        label: readString(record, ["label"]),
        enabled: readBoolean(record, ["enabled"]),
      } satisfies SchoolAnnouncementChannel;
    })
    .filter((c): c is SchoolAnnouncementChannel => c !== null);
}

function mapAttachments(value: unknown): SchoolAnnouncementAttachment[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      const record = asRecord(item);
      if (!record) return null;
      return {
        id: readString(record, ["id"], `att-${index}`),
        fileName: readString(record, ["fileName"], "file"),
        fileUrl: readString(record, ["fileUrl"]),
        mimeType: readString(record, ["mimeType"]),
        fileSizeBytes: readNumber(record, ["fileSizeBytes"]),
        fileSizeLabel: readString(record, ["fileSizeLabel"]),
      } satisfies SchoolAnnouncementAttachment;
    })
    .filter((a): a is SchoolAnnouncementAttachment => a !== null);
}

function mapOperationLog(value: unknown): SchoolAnnouncementOperationLogEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      const record = asRecord(item);
      if (!record) return null;
      return {
        id: readString(record, ["id"], `log-${index}`),
        eventType: readString(record, ["eventType"]),
        eventLabel: readString(record, ["eventLabel"]),
        description: readString(record, ["description"]),
        occurredAt: readString(record, ["occurredAt"]),
        icon: readString(record, ["icon"], "create"),
      } satisfies SchoolAnnouncementOperationLogEntry;
    })
    .filter((e): e is SchoolAnnouncementOperationLogEntry => e !== null);
}

function mapRealtimeTracking(value: unknown): SchoolRealtimeTracking | null {
  const record = asRecord(value);
  if (!record) return null;
  const id = readString(record, ["announcementId", "id"]);
  return {
    isActive: readBoolean(record, ["isActive"], true),
    announcementId: id,
    referenceCode: readString(record, ["referenceCode"]),
    title: readString(record, ["title"]),
    statusTone: normalizeStatusTone(readString(record, ["status"], "Processing"), false),
    statusLabel: readString(record, ["statusLabel"]),
    sentCount: readNumber(record, ["sentCount"]),
    inProgressCount: readNumber(record, ["inProgressCount"]),
    failedCount: readNumber(record, ["failedCount"]),
    totalRecipients: readNumber(record, ["totalRecipients"]),
    progressPercentage: readNumber(record, ["progressPercentage"]),
  };
}

function mapCallout(value: unknown): SchoolDashboardCallout | null {
  const record = asRecord(value);
  if (!record) return null;
  return {
    title: readString(record, ["title"]),
    body: readString(record, ["body"]),
    actionLabel: readString(record, ["actionLabel"]),
    actionUrl: readString(record, ["actionUrl"]) || null,
  };
}

function mapDashboardSidebarItem(item: unknown): SchoolDashboardSidebarItem | null {
  const record = asRecord(item);
  if (!record) return null;
  const id = readString(record, ["id", "announcementId"]);
  if (!id) return null;
  const isUrgent = readBoolean(record, ["isUrgent"]);
  const status = readString(record, ["status"], "Published");
  return {
    id,
    referenceCode: readString(record, ["referenceCode"]),
    title: readString(record, ["title"], "—"),
    type: normalizeType(readString(record, ["type"], "Ad")),
    isUrgent,
    audience: normalizeAudience(readString(record, ["audience"], "all")),
    audienceLabel: readString(record, ["audienceLabel"]),
    statusTone: normalizeStatusTone(status, isUrgent),
    statusLabel: readString(record, ["statusLabel"]),
    scheduledOrSentAt: readString(record, ["scheduledOrSentAt"]) || null,
    timeLabel: readString(record, ["timeLabel"]) || null,
    canEdit: readBoolean(record, ["canEdit"]),
    canView: readBoolean(record, ["canView"], true),
    canDelete: readBoolean(record, ["canDelete"]),
  };
}

function mapDashboardActivityItem(item: unknown): SchoolDashboardActivityItem | null {
  const record = asRecord(item);
  if (!record) return null;
  const id = readString(record, ["id", "announcementId"]);
  if (!id) return null;
  const status = readString(record, ["status"], "Success");
  return {
    id,
    title: readString(record, ["title"], "—"),
    type: normalizeType(readString(record, ["type"], "Ad")),
    typeLabel: readString(record, ["typeLabel"]),
    statusTone: normalizeStatusTone(status, false),
    statusLabel: readString(record, ["statusLabel"]),
    date: readString(record, ["date", "createdAt"]),
  };
}

function mapDashboard(data: unknown): SchoolDashboardData {
  const record = asRecord(data);
  return {
    kpis: mapKpis(record?.kpis),
    activeAndScheduled: readArray(record, ["activeAndScheduled"])
      .map(mapDashboardSidebarItem)
      .filter((i): i is SchoolDashboardSidebarItem => i !== null),
    recentActivity: readArray(record, ["recentActivity"])
      .map(mapDashboardActivityItem)
      .filter((i): i is SchoolDashboardActivityItem => i !== null),
    realtimeTracking: mapRealtimeTracking(record?.realtimeTracking),
    tips: mapCallout(record?.tips),
    smartRecommendations: mapCallout(record?.smartRecommendations),
  };
}

function mapDetail(data: unknown): SchoolAnnouncementDetail | null {
  const record = asRecord(data);
  if (!record) return null;
  const id = readString(record, ["id", "announcementId"]);
  if (!id) return null;
  const isUrgent = readBoolean(record, ["isUrgent"]);
  const status = readString(record, ["status"], "Published");
  const statistics = asRecord(record.statistics);
  const content = asRecord(record.content);
  const targetGroups = asRecord(record.targetGroups);
  const createdBy = asRecord(record.createdBy);
  const actions = asRecord(record.actions);

  return {
    id,
    referenceCode: readString(record, ["referenceCode"]),
    title: readString(record, ["title"], "—"),
    type: normalizeType(readString(record, ["type"], "Ad")),
    isUrgent,
    statusTone: normalizeStatusTone(status, isUrgent),
    statusLabel: readString(record, ["statusLabel"]),
    createdAt: readString(record, ["createdAt"]),
    sentAt: readString(record, ["sentAt"]) || null,
    scheduledAt: readString(record, ["scheduledAt"]) || null,
    createdByName: readString(createdBy, ["fullName", "name"]),
    statistics: {
      deliveryRate: readNumber(statistics, ["deliveryRate"]),
      totalRecipients: readNumber(statistics, ["totalRecipients"]),
      successCount: readNumber(statistics, ["successCount"]),
      failureCount: readNumber(statistics, ["failureCount"]),
      inProgressCount: readNumber(statistics, ["inProgressCount"]),
      reachPercentage: readNumber(statistics, ["reachPercentage"]),
    },
    body: readString(content, ["body"]),
    bodyHtml: readString(content, ["bodyHtml", "body"]),
    displayDurationHours: readNumber(content, ["displayDurationHours"], 24),
    attachments: mapAttachments(record.attachments),
    audience: normalizeAudience(readString(targetGroups, ["audience"], "all")),
    audienceLabel: readString(targetGroups, ["audienceLabel"]),
    studentsCount: readNumber(targetGroups, ["studentsCount"]),
    parentsCount: readNumber(targetGroups, ["parentsCount"]),
    teachersCount: readNumber(targetGroups, ["teachersCount"]),
    channels: mapChannels(targetGroups?.channels),
    operationLog: mapOperationLog(record.operationLog),
    actions: {
      canEdit: readBoolean(actions, ["canEdit"]),
      canDelete: readBoolean(actions, ["canDelete"]),
      canResend: readBoolean(actions, ["canResend"]),
      canArchive: readBoolean(actions, ["canArchive"]),
      canPrintReport: readBoolean(actions, ["canPrintReport"]),
    },
  };
}

function isFailure(response: { status?: string | number; isSuccess?: boolean }): boolean {
  if (response.isSuccess === true) return false;
  return response.status !== "Success";
}

export type GetSchoolAnnouncementsParams = {
  status: SchoolAnnouncementListFilter;
  search?: string;
  pageNumber: number;
  pageSize: number;
};

export async function getSchoolAnnouncementsKpis(): Promise<SchoolAnnouncementKpis> {
  if (USE_MOCK) return SCHOOL_ANNOUNCEMENTS_SEED_KPIS;
  const response = await httpClient.get<unknown>({ url: `${BASE}/kpis` });
  if (isFailure(response)) {
    throw new Error(response.error?.message ?? "Failed to load KPIs");
  }
  return mapKpis(response.data);
}

export async function getSchoolAnnouncements(
  params: GetSchoolAnnouncementsParams,
): Promise<SchoolAnnouncementListPage> {
  if (USE_MOCK) {
    const keyword = params.search?.trim().toLowerCase();
    let rows = SCHOOL_ANNOUNCEMENTS_SEED_ROWS;
    if (params.status !== "all") {
      const tone = params.status.toLowerCase();
      rows = rows.filter((row) =>
        tone === "published"
          ? row.statusTone === "published" || row.statusTone === "urgent"
          : row.statusTone === tone,
      );
    }
    if (keyword) {
      rows = rows.filter(
        (row) =>
          row.title.toLowerCase().includes(keyword) ||
          row.referenceCode.toLowerCase().includes(keyword),
      );
    }
    return {
      items: rows,
      currentPage: 1,
      pageSize: params.pageSize,
      totalCount: rows.length,
      totalPages: 1,
    };
  }

  const response = await httpClient.get<unknown>({
    url: BASE,
    params: {
      status: params.status,
      search: params.search?.trim() || undefined,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
    },
  });
  if (isFailure(response)) {
    throw new Error(response.error?.message ?? "Failed to load announcements");
  }

  const list = Array.isArray(response.data) ? response.data : readArray(asRecord(response.data), ["items", "data"]);
  const items = list
    .map(mapListItem)
    .filter((i): i is SchoolAnnouncementListItem => i !== null);
  const meta = parseXPaginationHeader(response.headers ?? {});

  return {
    items,
    currentPage: meta?.currentPage ?? params.pageNumber,
    pageSize: meta?.pageSize ?? params.pageSize,
    totalCount: meta?.totalCount ?? items.length,
    totalPages: meta?.totalPages ?? 1,
  };
}

export async function getSchoolDashboard(): Promise<SchoolDashboardData> {
  if (USE_MOCK) return SCHOOL_ANNOUNCEMENTS_SEED_DASHBOARD;
  const response = await httpClient.get<unknown>({ url: `${BASE}/dashboard` });
  if (isFailure(response)) {
    throw new Error(response.error?.message ?? "Failed to load dashboard");
  }
  return mapDashboard(response.data);
}

export async function getSchoolAnnouncementById(id: string): Promise<SchoolAnnouncementDetail> {
  if (USE_MOCK) return getSchoolAnnouncementSeedDetail(id);
  const response = await httpClient.get<unknown>({
    url: `${BASE}/${encodeURIComponent(id)}`,
  });
  if (isFailure(response)) {
    throw new Error(response.error?.message ?? "Failed to load announcement");
  }
  const detail = mapDetail(response.data);
  if (!detail) throw new Error("Invalid announcement response");
  return detail;
}

export async function createSchoolAnnouncement(
  payload: UpsertSchoolAnnouncementPayload,
): Promise<CreateSchoolAnnouncementResult> {
  const response = await httpClient.post<unknown>({ url: BASE, data: payload });
  if (isFailure(response)) {
    throw new Error(response.error?.message ?? response.message ?? "Failed to create announcement");
  }
  const data = asRecord(unwrapData(response.data) ?? response.data);
  return {
    id: readString(data, ["id"]),
    referenceCode: readString(data, ["referenceCode"]),
    statusTone: normalizeStatusTone(readString(data, ["status"], "Published"), false),
    statusLabel: readString(data, ["statusLabel"]),
    realtimeTracking: mapRealtimeTracking(data?.realtimeTracking),
  };
}

export async function updateSchoolAnnouncement(
  id: string,
  payload: UpsertSchoolAnnouncementPayload,
): Promise<void> {
  const response = await httpClient.put<unknown>({
    url: `${BASE}/${encodeURIComponent(id)}`,
    data: payload,
  });
  if (isFailure(response)) {
    throw new Error(response.error?.message ?? "Failed to update announcement");
  }
}

export async function sendSchoolAnnouncementDraft(id: string): Promise<void> {
  const response = await httpClient.post<unknown>({
    url: `${BASE}/${encodeURIComponent(id)}/send`,
    data: {},
  });
  if (isFailure(response)) {
    throw new Error(response.error?.message ?? "Failed to send announcement");
  }
}

export async function resendSchoolAnnouncement(id: string): Promise<void> {
  const response = await httpClient.post<unknown>({
    url: `${BASE}/${encodeURIComponent(id)}/resend`,
    data: {},
  });
  if (isFailure(response)) {
    throw new Error(response.error?.message ?? "Failed to resend announcement");
  }
}

export async function archiveSchoolAnnouncement(id: string): Promise<void> {
  const response = await httpClient.post<unknown>({
    url: `${BASE}/${encodeURIComponent(id)}/archive`,
    data: {},
  });
  if (isFailure(response)) {
    throw new Error(response.error?.message ?? "Failed to archive announcement");
  }
}

export async function deleteSchoolAnnouncement(id: string): Promise<void> {
  const response = await httpClient.delete<unknown>({
    url: `${BASE}/${encodeURIComponent(id)}`,
  });
  if (isFailure(response)) {
    throw new Error(response.error?.message ?? "Failed to delete announcement");
  }
}

/** Uploads a single attachment to the shared FileUpload endpoint. */
export async function uploadSchoolAnnouncementAttachment(
  file: File,
): Promise<SchoolAnnouncementAttachmentInput> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "school-announcements");

  const response = await httpClient.post<unknown>({
    url: FILE_UPLOAD_URL,
    data: formData,
    isFormData: true,
  });

  const record = asRecord(unwrapData(response) ?? response);
  const fileUrl = readString(record, ["filePath", "fileUrl", "url", "path"]);
  if (!fileUrl) {
    throw new Error(readString(record, ["message"]) || "Upload failed");
  }
  return {
    fileName: file.name,
    fileUrl,
    mimeType: file.type,
    fileSizeBytes: file.size,
  };
}

/** Triggers a CSV download of all announcements. */
export async function exportSchoolAnnouncements(): Promise<void> {
  const response = await axiosClient.get<Blob>(`${BASE}/export`, {
    responseType: "blob",
  });
  const blob = new Blob([response.data], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `school-announcements-${date}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export { audienceToApiCode };
