import type {
  TeacherCourseCreatePayload,
  TeacherCourseCreateResult,
  TeacherCourseCurriculumItem,
  TeacherCourseCurriculumUnit,
  TeacherCourseDetail,
  TeacherCourseListRow,
  TeacherCoursesListData,
  TeacherCoursesListParams,
  TeacherCourseStatus,
  TeacherCourseAccessType,
  TeacherKpiStat,
} from "@/modules/teacher/domain/types/teacher.types";
import { CourseAccessType, CourseTerm } from "@/shared/domain/enums/cms.enums";
import { formatNumber } from "@/shared/application/lib/format";
import { rejectApiResponse } from "@/shared/infrastructure/api/apiResponse.utils";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { parseXPaginationHeader } from "@/shared/infrastructure/http/xPagination";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { getGrades } from "@/shared/infrastructure/api/grade.api";
import { getSubjectsPage } from "@/modules/admin/infrastructure/api/subjectApi";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" ? (value as UnknownRecord) : null;
}

function readString(record: UnknownRecord | null, keys: string[], fallback = ""): string {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return fallback;
}

function readNumber(record: UnknownRecord | null, keys: string[], fallback?: number): number | null {
  if (!record) return fallback ?? null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return fallback ?? null;
}

function readBoolean(record: UnknownRecord | null, keys: string[], fallback = false): boolean {
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
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

function extractEnvelopeData(data: unknown): unknown {
  const record = asRecord(data);
  return record?.data ?? data;
}

function extractListRows(data: unknown): unknown[] {
  const unwrapped = extractEnvelopeData(data);
  if (Array.isArray(unwrapped)) return unwrapped;
  const record = asRecord(unwrapped);
  if (!record) return [];
  for (const key of ["items", "results", "records", "list", "rows", "data"]) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function mapCourseStatus(value: unknown): TeacherCourseStatus {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "pending") return "pending";
  if (normalized === "approved") return "approved";
  if (normalized === "rejected") return "rejected";
  if (normalized === "archived") return "archived";
  return "draft";
}

function mapAccessType(value: unknown): TeacherCourseAccessType {
  if (typeof value === "number") {
    if (value === CourseAccessType.Free) return "free";
    if (value === CourseAccessType.Paid) return "paid";
    if (value === CourseAccessType.Subscription) return "subscription";
    return "unspecified";
  }
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "free") return "free";
  if (normalized === "paid") return "paid";
  if (normalized.includes("subscri")) return "subscription";
  return "unspecified";
}

function statusToApiParam(status: TeacherCoursesListParams["status"]): string | undefined {
  if (!status || status === "all") return undefined;
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function coverToneFromTitle(title: string): TeacherCourseListRow["coverTone"] {
  const hash = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const tones: TeacherCourseListRow["coverTone"][] = ["blue", "green", "gold", "slate"];
  return tones[hash % tones.length] ?? "blue";
}

function coverLabelFromTitle(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase();
  }
  return title.slice(0, 3).toUpperCase() || "CRS";
}

function stationTypeToItemType(type: string): TeacherCourseCurriculumItem["type"] {
  const normalized = type.toLowerCase();
  if (normalized.includes("quiz") || normalized.includes("challenge")) return "quiz";
  if (normalized.includes("helper") || normalized.includes("resource")) return "pdf";
  if (normalized.includes("flashcard")) return "quiz";
  if (normalized.includes("live")) return "video";
  return "video";
}

function formatPriceLabel(
  accessType: TeacherCourseAccessType,
  originalPrice: number,
  discountedPrice: number,
  locale: string,
): string {
  if (accessType === "free") return locale.startsWith("ar") ? "مجاني" : "Free";
  const price = discountedPrice || originalPrice;
  if (!price) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "OMR",
    maximumFractionDigits: 0,
  }).format(price);
}

function termLabel(term: number, locale: string): string {
  if (locale.startsWith("ar")) {
    if (term === 2) return "الفصل الثاني";
    if (term === 3) return "الفصل الثالث";
    return "الفصل الأول";
  }
  return `Term ${term || 1}`;
}

function mapListRow(item: unknown): TeacherCourseListRow | null {
  const record = asRecord(item);
  if (!record) return null;
  const id = readString(record, ["courseId", "id"], "").trim();
  if (!id) return null;

  const title = readString(record, ["title"], "—");
  const coverImageUrl = readString(record, ["coverImageUrl"], "") || null;

  return {
    id,
    title,
    subject: readString(record, ["subject", "subjectNameAr"], "—"),
    grade: readString(record, ["gradeNameAr", "gradeName"], "—"),
    accessType: mapAccessType(record.accessType ?? record.accessType),
    status: mapCourseStatus(record.status),
    coverTone: coverToneFromTitle(title),
    coverLabel: coverLabelFromTitle(title),
    coverImageUrl: resolveFileUrl(coverImageUrl),
    studentCount: readNumber(record, ["studentCount"], 0) ?? 0,
    learningPathCount: readNumber(record, ["learningPathCount"], 0) ?? 0,
    stationCount: readNumber(record, ["stationCount"], 0) ?? 0,
    fileCount: readNumber(record, ["fileCount"], 0) ?? 0,
    price: readNumber(record, ["price", "discountedPrice"], 0) ?? 0,
    originalPrice: readNumber(record, ["originalPrice"], 0) ?? 0,
    isPublished: readBoolean(record, ["isPublished"]),
    term: readNumber(record, ["term"], 1) ?? 1,
  };
}

function mapLearningPathsToCurriculum(paths: unknown[]): TeacherCourseCurriculumUnit[] {
  const units: TeacherCourseCurriculumUnit[] = [];

  for (const pathRaw of paths) {
    const path = asRecord(pathRaw);
    if (!path) continue;
    const pathId = readString(path, ["id"], "").trim();
    if (!pathId) continue;

    const stations = readArray(path, ["stations"]);
    const items: TeacherCourseCurriculumItem[] = stations
      .map((stationRaw) => {
        const station = asRecord(stationRaw);
        if (!station) return null;
        const stationId = readString(station, ["id"], "").trim();
        if (!stationId) return null;
        const stationType = readString(station, ["stationType", "type"], "Station");
        return {
          id: stationId,
          title: readString(station, ["name", "title"], "—"),
          type: stationTypeToItemType(stationType),
          metaLabel: stationType,
          order: readNumber(station, ["order"], 0) ?? 0,
        };
      })
      .filter((item): item is TeacherCourseCurriculumItem => item !== null)
      .sort((a, b) => a.order - b.order);

    units.push({
      id: pathId,
      title: readString(path, ["title"], "—"),
      items,
      order: readNumber(path, ["order"], 0) ?? 0,
      status: mapCourseStatus(path.status),
    });
  }

  return units.sort((a, b) => a.order - b.order);
}

function buildListStats(rows: TeacherCourseListRow[], totalItems: number, locale: string): TeacherKpiStat[] {
  const pendingCount = rows.filter((row) => row.status === "pending").length;
  const totalStudents = rows.reduce((sum, row) => sum + (row.studentCount ?? 0), 0);
  const totalTracks = rows.reduce((sum, row) => sum + (row.learningPathCount ?? 0), 0);

  return [
    {
      id: "totalCourses",
      labelKey: "courses.list.stats.totalCourses",
      value: formatNumber(totalItems, locale),
    },
    {
      id: "pendingApproval",
      labelKey: "courses.list.stats.pendingApproval",
      value: formatNumber(pendingCount, locale),
      trend: pendingCount > 0 ? "courses.list.stats.pendingOnPage" : undefined,
    },
    {
      id: "activeLearners",
      labelKey: "courses.list.stats.activeLearners",
      value: formatNumber(totalStudents, locale),
    },
    {
      id: "totalTracks",
      labelKey: "courses.list.stats.totalTracks",
      value: formatNumber(totalTracks, locale),
    },
  ];
}

function pricingTypeToAccessType(pricingType: TeacherCourseCreatePayload["pricingType"]): CourseAccessType {
  if (pricingType === "free") return CourseAccessType.Free;
  return CourseAccessType.Paid;
}

function buildCreatePayload(payload: TeacherCourseCreatePayload, submitForReview: boolean) {
  const originalPrice = Number(payload.basePrice) || 0;
  const discountedPrice = Number(payload.offerPrice) || 0;
  const accessType = pricingTypeToAccessType(payload.pricingType);

  return {
    title: payload.title.trim(),
    description: payload.description.trim(),
    subjectId: Number(payload.subjectId),
    gradeId: Number(payload.gradeId),
    term: Number(payload.termId) || CourseTerm.FirstTerm,
    coverImageUrl: payload.coverImageUrl ?? "",
    accessType,
    ...(accessType === CourseAccessType.Free
      ? {}
      : { originalPrice, discountedPrice }),
    submitForReview,
  };
}

function buildUpdatePayload(courseId: string, payload: TeacherCourseCreatePayload) {
  const base = buildCreatePayload(payload, false);
  return { ...base, id: courseId };
}

export async function fetchTeacherMyCourses(
  params: TeacherCoursesListParams,
  locale = "ar",
): Promise<TeacherCoursesListData> {
  const pageNumber = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;

  const [grades, subjectsResult] = await Promise.all([
    getGrades({ pageNumber: 1, pageSize: 100 }),
    getSubjectsPage({ pageNumber: 1, pageSize: 100 }),
  ]);

  const subjects = subjectsResult.data?.rows ?? [];
  const subjectName =
    params.subjectName ??
    (params.subjectId && params.subjectId !== "all"
      ? subjects.find((s) => String(s.id) === params.subjectId)?.nameAr
      : undefined);

  const coursesResponse = await httpClient.get<unknown>({
    url: "/api/v1/Teacher/my-courses",
    params: {
      pageNumber,
      pageSize,
      ...(params.query?.trim() ? { keyword: params.query.trim() } : {}),
      ...(statusToApiParam(params.status) ? { status: statusToApiParam(params.status) } : {}),
      ...(subjectName?.trim() ? { subject: subjectName.trim() } : {}),
    },
  });

  if (coursesResponse.status !== "Success" && !coursesResponse.isSuccess) {
    throw new Error(coursesResponse.error?.message ?? "Failed to load courses");
  }

  const headerMeta = parseXPaginationHeader(coursesResponse.headers ?? {});
  let rows = extractListRows(coursesResponse.data)
    .map(mapListRow)
    .filter((row): row is TeacherCourseListRow => row !== null);

  if (params.gradeId && params.gradeId !== "all") {
    const grade = grades.find((g) => String(g.id) === params.gradeId);
    if (grade) {
      const gradeLabel = locale.startsWith("ar") ? grade.nameAr : grade.nameEn;
      rows = rows.filter((row) => row.grade === gradeLabel || row.grade.includes(gradeLabel));
    }
  }

  const totalItems = headerMeta?.totalCount ?? rows.length;
  const pagination = {
    currentPage: headerMeta?.currentPage ?? pageNumber,
    totalPages: headerMeta?.totalPages ?? 1,
    totalItems,
    pageSize: headerMeta?.pageSize ?? pageSize,
  };

  return {
    stats: buildListStats(rows, totalItems, locale),
    rows,
    pagination,
    filterOptions: {
      grades: [
        { id: "all", labelKey: "courses.list.filters.allGrades" },
        ...grades.map((grade) => ({
          id: String(grade.id),
          label: locale.startsWith("ar") ? grade.nameAr : grade.nameEn,
        })),
      ],
      subjects: [
        { id: "all", labelKey: "courses.list.filters.allSubjects" },
        ...subjects.map((subject) => ({
          id: String(subject.id),
          label: locale.startsWith("ar") ? subject.nameAr : subject.nameEn,
        })),
      ],
      statuses: [
        { id: "all", labelKey: "courses.list.filters.allStatuses" },
        { id: "draft", labelKey: "courses.list.status.draft" },
        { id: "pending", labelKey: "courses.list.status.pending" },
        { id: "approved", labelKey: "courses.list.status.approved" },
        { id: "rejected", labelKey: "courses.list.status.rejected" },
        { id: "archived", labelKey: "courses.list.status.archived" },
      ],
    },
  };
}

export async function fetchTeacherCourseWorkspace(
  courseId: string,
  locale = "ar",
): Promise<TeacherCourseDetail> {
  const response = await httpClient.get<unknown>({
    url: `/api/v1/Teacher/my-courses/${encodeURIComponent(courseId)}`,
  });

  if (response.status !== "Success" && !response.isSuccess) {
    throw new Error(response.error?.message ?? "Failed to load course");
  }

  const root = asRecord(extractEnvelopeData(response.data));
  if (!root) throw new Error("Invalid course response");

  const course = asRecord(root.course);
  if (!course) throw new Error("Invalid course response");

  const stats = asRecord(root.stats);
  const learningPaths = readArray(root, ["learningPaths"]);
  const id = readString(course, ["id", "courseId"], courseId);
  const accessType = mapAccessType(course.accessType);
  const originalPrice = readNumber(course, ["originalPrice"], 0) ?? 0;
  const discountedPrice = readNumber(course, ["discountedPrice", "price"], 0) ?? 0;
  const term = readNumber(course, ["term"], 1) ?? 1;
  const stationCount = readNumber(stats, ["stationCount"], 0) ?? 0;

  return {
    id,
    title: readString(course, ["title"], "—"),
    description: readString(course, ["description"], "") || null,
    subject: readString(course, ["subjectNameAr", "subject"], "—"),
    subjectNameEn: readString(course, ["subjectNameEn"], ""),
    term,
    termLabel: termLabel(term, locale),
    grade: String(readNumber(course, ["gradeId"], 0) ?? "—"),
    gradeId: readNumber(course, ["gradeId"], 0) ?? 0,
    status: mapCourseStatus(course.status),
    instructorName: readString(course, ["teacherFullName"], "—"),
    instructorAvatarUrl: resolveFileUrl(readString(course, ["teacherAvatarUrl"], "") || null),
    coverImageUrl: resolveFileUrl(readString(course, ["coverImageUrl"], "") || null),
    lessonCount: stationCount,
    learningPathCount: readNumber(stats, ["learningPathCount"], learningPaths.length) ?? 0,
    fileCount: readNumber(stats, ["fileCount", "courseFilesCount"], 0) ?? 0,
    stationCount,
    priceLabel: formatPriceLabel(accessType, originalPrice, discountedPrice, locale),
    originalPrice,
    discountedPrice,
    accessType,
    registeredStudents: readNumber(stats, ["studentCount"], 0) ?? 0,
    curriculum: mapLearningPathsToCurriculum(learningPaths),
    canEditContent: readBoolean(root, ["canEditContent"], true),
    canSendForReview: readBoolean(root, ["canSendForReview"], false),
    isPublished: readBoolean(course, ["isPublished"]),
    rejectionNotes: readString(course, ["rejectionNotes"], "") || null,
    draftPathCount: readNumber(stats, ["draftPathCount"], 0) ?? 0,
    pendingPathCount: readNumber(stats, ["pendingPathCount"], 0) ?? 0,
    approvedPathCount: readNumber(stats, ["approvedPathCount"], 0) ?? 0,
    rejectedPathCount: readNumber(stats, ["rejectedPathCount"], 0) ?? 0,
  };
}

export async function createTeacherCourse(
  payload: TeacherCourseCreatePayload,
  submitForReview = false,
): Promise<TeacherCourseCreateResult> {
  const response = await httpClient.post<unknown>({
    url: "/api/v1/Course",
    data: buildCreatePayload(payload, submitForReview),
  });

  if (response.status !== "Success" && !response.isSuccess) {
    rejectApiResponse(response, "Failed to create course");
  }

  const record = asRecord(extractEnvelopeData(response.data));
  const courseId =
    readString(record, ["id", "courseId"], "").trim() ||
    readString(asRecord(response.data), ["id", "courseId"], "").trim();

  if (!courseId) throw new Error("Course was created but no id was returned");
  return { courseId };
}

export async function updateTeacherCourse(
  courseId: string,
  payload: TeacherCourseCreatePayload,
): Promise<TeacherCourseCreateResult> {
  const response = await httpClient.put<unknown>({
    url: `/api/v1/Course/${encodeURIComponent(courseId)}`,
    data: buildUpdatePayload(courseId, payload),
  });

  if (response.status !== "Success" && !response.isSuccess) {
    rejectApiResponse(response, "Failed to update course");
  }

  return { courseId };
}

export async function deleteTeacherCourse(courseId: string): Promise<void> {
  const response = await httpClient.delete<unknown>({
    url: `/api/v1/Course/${encodeURIComponent(courseId)}`,
  });

  if (response.status !== "Success" && !response.isSuccess) {
    throw new Error(response.error?.message ?? "Failed to delete course");
  }
}

export async function sendTeacherCourseForReview(courseId: string): Promise<void> {
  const response = await httpClient.post<unknown>({
    url: `/api/v1/Course/${encodeURIComponent(courseId)}/send-for-review`,
    data: {},
  });

  if (response.status !== "Success" && !response.isSuccess) {
    throw new Error(response.error?.message ?? "Failed to send course for review");
  }
}

export type TeacherMyCourseOption = {
  courseId: string;
  title: string;
  subject: string;
  gradeId: number;
  gradeNameAr: string;
  status: string;
  coverImageUrl: string | null;
  fileCount: number;
};

export async function fetchTeacherMyCoursesOptions(
  params: { keyword?: string; pageNumber?: number; pageSize?: number } = {},
): Promise<TeacherMyCourseOption[]> {
  const response = await httpClient.get<unknown>({
    url: "/api/v1/Teacher/my-courses",
    params: {
      pageNumber: params.pageNumber ?? 1,
      pageSize: params.pageSize ?? 100,
      ...(params.keyword?.trim() ? { keyword: params.keyword.trim() } : {}),
    },
  });

  if (response.status !== "Success" && !response.isSuccess) {
    throw new Error(response.error?.message ?? "Failed to load courses");
  }

  return extractListRows(response.data)
    .map((item) => {
      const record = asRecord(item);
      if (!record) return null;
      const courseId = readString(record, ["courseId", "id"], "").trim();
      if (!courseId) return null;
      return {
        courseId,
        title: readString(record, ["title"], "—"),
        subject: readString(record, ["subject"], ""),
        gradeId: readNumber(record, ["gradeId"], 0) ?? 0,
        gradeNameAr: readString(record, ["gradeNameAr"], ""),
        status: readString(record, ["status"], ""),
        coverImageUrl: resolveFileUrl(readString(record, ["coverImageUrl"], "") || null),
        fileCount: readNumber(record, ["fileCount"], 0) ?? 0,
      };
    })
    .filter((row): row is TeacherMyCourseOption => row !== null);
}

export async function fetchTeacherCourseForEdit(courseId: string): Promise<TeacherCourseCreatePayload | null> {
  const response = await httpClient.get<unknown>({
    url: `/api/v1/Teacher/my-courses/${encodeURIComponent(courseId)}`,
  });

  if (response.status !== "Success" && !response.isSuccess) return null;

  const root = asRecord(extractEnvelopeData(response.data));
  const course = asRecord(root?.course);
  if (!course) return null;

  const accessType = mapAccessType(course.accessType);
  let pricingType: TeacherCourseCreatePayload["pricingType"] = "oneTime";
  if (accessType === "free") pricingType = "free";
  else if (accessType === "subscription") pricingType = "oneTime";

  return {
    title: readString(course, ["title"], ""),
    description: readString(course, ["description"], ""),
    gradeId: String(readNumber(course, ["gradeId"], 0) ?? ""),
    subjectId: String(readNumber(course, ["subjectId"], 0) ?? ""),
    termId: String(readNumber(course, ["term"], 1) ?? 1),
    pricingType,
    basePrice: String(readNumber(course, ["originalPrice"], 0) ?? ""),
    offerPrice: String(readNumber(course, ["discountedPrice"], 0) ?? ""),
    coverImageUrl: readString(course, ["coverImageUrl"], "") || undefined,
  };
}
