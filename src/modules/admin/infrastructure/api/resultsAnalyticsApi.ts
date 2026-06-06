import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import {
  parseXPaginationHeader,
  type XPaginationMeta,
} from "@/shared/infrastructure/http/xPagination";
import {
  QUIZ_TYPE,
  RESULT_STATUS,
  type QuizAnalysisData,
  type QuizAnalysisHeader,
  type QuizAnalysisSummary,
  type QuizGradeDistributionRow,
  type QuizQuestionDetailRow,
  type QuizQuestionPerformanceRow,
  type QuizTopStudentRow,
  type QuizType,
  type ResultStatus,
  type ResultsOverviewData,
  type ResultsOverviewPage,
  type ResultsOverviewStudentRow,
  type ResultsOverviewSummary,
  type ResultsOverviewTrends,
  type ScoreMode,
  type StudentCertificatesData,
  type StudentExamRow,
  type StudentExamsPage,
  type StudentInactivityAlert,
  type StudentParentInfo,
  type StudentRecentAssessment,
  type StudentResultsDashboardData,
  type StudentResultsKpis,
  type StudentResultsProfile,
  type StudentSubscriptionInfo,
  type StudentWeeklyProgressRow,
} from "@/modules/admin/domain/types/resultsAnalytics.types";
import type { ResultsAnalyticsFilterState } from "@/modules/admin/domain/types/resultsAnalyticsFilters.types";
import {
  isQuestionDifficulty,
  isResultStatus,
} from "@/modules/admin/domain/utils/resultsAnalyticsDisplay";

const BASE = "/api/v1/admin/results";

export type ResultsAnalyticsApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
};

export type GetResultsOverviewParams = {
  quizId?: string;
  quizType?: number;
  courseId?: string;
  schoolId?: string;
  search?: string;
  scoreMode?: ScoreMode;
  pageNumber: number;
  pageSize: number;
};

export type GetStudentExamsParams = {
  studentId: string;
  scoreMode?: ScoreMode;
  pageNumber: number;
  pageSize: number;
};

export type GetQuizAnalysisParams = {
  quizId: string;
  scoreMode?: ScoreMode;
  schoolId?: string;
  questionSort?: number;
  questionPageNumber: number;
  questionPageSize: number;
  topStudentsCount?: number;
};

type UnknownRecord = Record<string, unknown>;

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

function readNumber(record: UnknownRecord | null, keys: string[], fallback: number | null = null) {
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
  if (!record) return data;
  if ("data" in record) return record.data;
  return data;
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

function buildErrorResult<T>(error: unknown, fallbackMessage: string): ResultsAnalyticsApiResult<T> {
  const axiosError = asRecord(error);
  const response = asRecord(axiosError?.response);
  const responseData = asRecord(response?.data) as BackendApiResponse<unknown> | null;
  const httpStatusCode = readNumber(response, ["status"]);

  return {
    status:
      (typeof responseData?.status === "string" ? responseData.status : undefined) ??
      mapHttpStatus(httpStatusCode),
    message: typeof responseData?.message === "string" ? responseData.message : undefined,
    errorMessage:
      responseData?.error?.message ??
      (typeof axiosError?.message === "string" ? axiosError.message : fallbackMessage),
    data: null,
  };
}

function mergePagination<T extends object>(
  payload: T,
  meta: XPaginationMeta | null,
): T & XPaginationMeta {
  return {
    ...payload,
    currentPage: meta?.currentPage ?? 1,
    totalPages: meta?.totalPages ?? 1,
    pageSize: meta?.pageSize ?? 10,
    totalCount: meta?.totalCount ?? 0,
    hasPrevious: meta?.hasPrevious ?? false,
    hasNext: meta?.hasNext ?? false,
  };
}

function mapTrends(record: UnknownRecord | null): ResultsOverviewTrends | null {
  if (!record) return null;
  return {
    studentsTestedChangePercent: readNumber(record, ["studentsTestedChangePercent"]),
    averageScoreChangePercent: readNumber(record, ["averageScoreChangePercent"]),
    passRateChangePercent: readNumber(record, ["passRateChangePercent"]),
    averageCompletionMinutesChangePercent: readNumber(record, [
      "averageCompletionMinutesChangePercent",
    ]),
  };
}

function mapSummary(record: UnknownRecord | null): ResultsOverviewSummary {
  const trendsRecord = asRecord(record?.trends);
  return {
    totalStudentsTested: readNumber(record, ["totalStudentsTested"], 0) ?? 0,
    averageScorePercent: readNumber(record, ["averageScorePercent"], 0) ?? 0,
    overallPassRatePercent: readNumber(record, ["overallPassRatePercent"], 0) ?? 0,
    averageCompletionMinutes: readNumber(record, ["averageCompletionMinutes"], 0) ?? 0,
    trends: mapTrends(trendsRecord),
  };
}

function mapResultStatus(value: unknown): ResultStatus {
  const raw = typeof value === "string" ? value : "";
  return isResultStatus(raw) ? raw : RESULT_STATUS.notAttempted;
}

function mapQuizType(value: unknown): QuizType | null {
  const num = readNumber(asRecord({ value }), ["value"], null);
  if (num === QUIZ_TYPE.stationQuiz || num === QUIZ_TYPE.finalExam) return num;
  return null;
}

function mapOverviewStudent(item: unknown): ResultsOverviewStudentRow | null {
  const record = asRecord(item);
  if (!record) return null;
  const userId = readString(record, ["userId"]);
  if (!userId) return null;

  const quizTypeRaw = readNumber(record, ["quizType"], null);
  const quizType =
    quizTypeRaw === QUIZ_TYPE.stationQuiz || quizTypeRaw === QUIZ_TYPE.finalExam
      ? quizTypeRaw
      : null;

  return {
    userId,
    fullName: readString(record, ["fullName"], "—"),
    profileImageUrl: readString(record, ["profileImageUrl"], "") || null,
    schoolName: readString(record, ["schoolName"], "—"),
    gradeName: readString(record, ["gradeName"], "—"),
    representativeScorePercent: readNumber(record, ["representativeScorePercent"], null),
    attemptCount: readNumber(record, ["attemptCount"], 0) ?? 0,
    lastActivityAt: readString(record, ["lastActivityAt"], "") || null,
    resultStatus: mapResultStatus(record.resultStatus),
    quizId: readString(record, ["quizId"], "") || null,
    quizTitle: readString(record, ["quizTitle"], "") || null,
    quizType,
  };
}

function mapOverviewData(data: unknown): ResultsOverviewData | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;

  const summaryRecord = asRecord(record.summary);
  const students = readArray(record, ["students"])
    .map(mapOverviewStudent)
    .filter((row): row is ResultsOverviewStudentRow => row !== null);

  return {
    summary: mapSummary(summaryRecord),
    students,
    isSingleExamView: readBoolean(record, ["isSingleExamView"], false),
    selectedQuizId: readString(record, ["selectedQuizId"], "") || null,
    selectedQuizTitle: readString(record, ["selectedQuizTitle"], "") || null,
  };
}

function mapProfile(record: UnknownRecord | null): StudentResultsProfile {
  return {
    userId: readString(record, ["userId"]),
    fullName: readString(record, ["fullName"], "—"),
    profileImageUrl: readString(record, ["profileImageUrl"], "") || null,
    isActive: readBoolean(record, ["isActive"], false),
    gradeName: readString(record, ["gradeName"], "—"),
    schoolName: readString(record, ["schoolName"], "—"),
    username: readString(record, ["username"], "—"),
    points: readNumber(record, ["points"], null),
    levelLabel: readString(record, ["levelLabel"], "—"),
  };
}

function mapInactivityAlert(record: UnknownRecord | null): StudentInactivityAlert {
  return {
    showAlert: readBoolean(record, ["showAlert"], false),
    daysSinceLastActivity: readNumber(record, ["daysSinceLastActivity"], null),
    message: readString(record, ["message"], ""),
  };
}

function mapKpis(record: UnknownRecord | null): StudentResultsKpis {
  return {
    averageScorePercent: readNumber(record, ["averageScorePercent"], 0) ?? 0,
    totalAttempts: readNumber(record, ["totalAttempts"], 0) ?? 0,
    attemptsThisMonth: readNumber(record, ["attemptsThisMonth"], 0) ?? 0,
    successfulExams: readNumber(record, ["successfulExams"], 0) ?? 0,
    failedExams: readNumber(record, ["failedExams"], 0) ?? 0,
    lastFailureAt: readString(record, ["lastFailureAt"], "") || null,
    lastActivityAt: readString(record, ["lastActivityAt"], "") || null,
    lastActivityLabel: readString(record, ["lastActivityLabel"], "—"),
  };
}

function mapWeeklyProgress(item: unknown): StudentWeeklyProgressRow | null {
  const record = asRecord(item);
  if (!record) return null;
  return {
    weekLabel: readString(record, ["weekLabel"], "—"),
    weekStartUtc: readString(record, ["weekStartUtc"], ""),
    averageScorePercent: readNumber(record, ["averageScorePercent"], 0) ?? 0,
    attemptCount: readNumber(record, ["attemptCount"], 0) ?? 0,
  };
}

function mapParent(record: UnknownRecord | null): StudentParentInfo | null {
  if (!record) return null;
  const parentUserId = readString(record, ["parentUserId"]);
  if (!parentUserId) return null;
  return {
    parentUserId,
    fullName: readString(record, ["fullName"], "—"),
    phoneNumber: readString(record, ["phoneNumber"], "—"),
    linkedChildrenCount: readNumber(record, ["linkedChildrenCount"], 0) ?? 0,
  };
}

function mapSubscription(record: UnknownRecord | null): StudentSubscriptionInfo | null {
  if (!record) return null;
  return {
    enrolledCoursesCount: readNumber(record, ["enrolledCoursesCount"], 0) ?? 0,
    completedCoursesCount: readNumber(record, ["completedCoursesCount"], 0) ?? 0,
    latestPackageLabel: readString(record, ["latestPackageLabel"], "—"),
    latestEnrollmentAt: readString(record, ["latestEnrollmentAt"], "") || null,
  };
}

function mapRecentAssessment(item: unknown): StudentRecentAssessment | null {
  const record = asRecord(item);
  if (!record) return null;
  const quizId = readString(record, ["quizId"]);
  if (!quizId) return null;
  const quizTypeRaw = readNumber(record, ["quizType"], QUIZ_TYPE.stationQuiz) ?? QUIZ_TYPE.stationQuiz;
  return {
    quizId,
    quizTitle: readString(record, ["quizTitle"], "—"),
    quizType: quizTypeRaw === QUIZ_TYPE.finalExam ? QUIZ_TYPE.finalExam : QUIZ_TYPE.stationQuiz,
    courseTitle: readString(record, ["courseTitle"], "—"),
    scorePercent: readNumber(record, ["scorePercent"], null),
    resultStatus: mapResultStatus(record.resultStatus),
    completedAt: readString(record, ["completedAt"], "") || null,
  };
}

function mapStudentDashboard(data: unknown): StudentResultsDashboardData | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;

  return {
    profile: mapProfile(asRecord(record.profile)),
    inactivityAlert: mapInactivityAlert(asRecord(record.inactivityAlert)),
    kpis: mapKpis(asRecord(record.kpis)),
    weeklyProgress: readArray(record, ["weeklyProgress"])
      .map(mapWeeklyProgress)
      .filter((row): row is StudentWeeklyProgressRow => row !== null),
    parent: mapParent(asRecord(record.parent)),
    subscription: mapSubscription(asRecord(record.subscription)),
    recentAssessments: readArray(record, ["recentAssessments"])
      .map(mapRecentAssessment)
      .filter((row): row is StudentRecentAssessment => row !== null),
  };
}

function mapStudentExam(item: unknown): StudentExamRow | null {
  const record = asRecord(item);
  if (!record) return null;
  const quizId = readString(record, ["quizId"]);
  if (!quizId) return null;
  const quizTypeRaw = readNumber(record, ["quizType"], QUIZ_TYPE.stationQuiz) ?? QUIZ_TYPE.stationQuiz;
  return {
    quizId,
    quizTitle: readString(record, ["quizTitle"], "—"),
    quizType: quizTypeRaw === QUIZ_TYPE.finalExam ? QUIZ_TYPE.finalExam : QUIZ_TYPE.stationQuiz,
    courseTitle: readString(record, ["courseTitle"], "—"),
    bestScorePercent: readNumber(record, ["bestScorePercent"], null),
    attemptCount: readNumber(record, ["attemptCount"], 0) ?? 0,
    lastAttemptAt: readString(record, ["lastAttemptAt"], "") || null,
    resultStatus: mapResultStatus(record.resultStatus),
    canAnalyze: readBoolean(record, ["canAnalyze"], false),
  };
}

function mapStudentExams(data: unknown): { exams: StudentExamRow[] } | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;
  const exams = readArray(record, ["exams"])
    .map(mapStudentExam)
    .filter((row): row is StudentExamRow => row !== null);
  return { exams };
}

function mapCertificate(item: unknown) {
  const record = asRecord(item);
  if (!record) return null;
  const certificateId = readString(record, ["certificateId"]);
  if (!certificateId) return null;
  return {
    certificateId,
    courseId: readString(record, ["courseId"], ""),
    courseTitle: readString(record, ["courseTitle"], "—"),
    certificateTitle: readString(record, ["certificateTitle"], "—"),
    issueDateUtc: readString(record, ["issueDateUtc"], ""),
    finalScorePercent: readNumber(record, ["finalScorePercent"], 0) ?? 0,
    gradeLabel: readString(record, ["gradeLabel"], "—"),
    serialNumber: readString(record, ["serialNumber"], "—"),
    attemptId: readString(record, ["attemptId"], ""),
    status: readString(record, ["status"], "Active"),
    certificateUrl: readString(record, ["certificateUrl"], "") || null,
  };
}

function mapCertificates(data: unknown): StudentCertificatesData | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;
  const certificates = readArray(record, ["certificates"])
    .map(mapCertificate)
    .filter((row): row is NonNullable<ReturnType<typeof mapCertificate>> => row !== null);
  return {
    totalCount: readNumber(record, ["totalCount"], certificates.length) ?? certificates.length,
    certificates,
  };
}

function mapQuizHeader(record: UnknownRecord | null): QuizAnalysisHeader {
  const quizTypeRaw = readNumber(record, ["quizType"], QUIZ_TYPE.finalExam) ?? QUIZ_TYPE.finalExam;
  return {
    quizId: readString(record, ["quizId"]),
    quizTitle: readString(record, ["quizTitle"], "—"),
    quizType: quizTypeRaw === QUIZ_TYPE.stationQuiz ? QUIZ_TYPE.stationQuiz : QUIZ_TYPE.finalExam,
    courseTitle: readString(record, ["courseTitle"], "—"),
    examDateUtc: readString(record, ["examDateUtc"], "") || null,
    totalStudents: readNumber(record, ["totalStudents"], 0) ?? 0,
    statusLabel: readString(record, ["statusLabel"], "—"),
  };
}

function mapQuizSummary(record: UnknownRecord | null): QuizAnalysisSummary {
  return {
    averageScorePercent: readNumber(record, ["averageScorePercent"], 0) ?? 0,
    passRatePercent: readNumber(record, ["passRatePercent"], 0) ?? 0,
    averageCompletionMinutes: readNumber(record, ["averageCompletionMinutes"], 0) ?? 0,
    participationRatePercent: readNumber(record, ["participationRatePercent"], 0) ?? 0,
  };
}

function mapQuestionPerformance(item: unknown): QuizQuestionPerformanceRow | null {
  const record = asRecord(item);
  if (!record) return null;
  return {
    order: readNumber(record, ["order"], 0) ?? 0,
    questionId: readString(record, ["questionId"], ""),
    questionTextPreview: readString(record, ["questionTextPreview"], "—"),
    correctAnswerPercent: readNumber(record, ["correctAnswerPercent"], 0) ?? 0,
  };
}

function mapGradeDistribution(item: unknown): QuizGradeDistributionRow | null {
  const record = asRecord(item);
  if (!record) return null;
  return {
    rangeLabel: readString(record, ["rangeLabel"], "—"),
    minScoreInclusive: readNumber(record, ["minScoreInclusive"], 0) ?? 0,
    maxScoreInclusive: readNumber(record, ["maxScoreInclusive"], 0) ?? 0,
    studentCount: readNumber(record, ["studentCount"], 0) ?? 0,
  };
}

function mapQuestionDetail(item: unknown): QuizQuestionDetailRow | null {
  const record = asRecord(item);
  if (!record) return null;
  const difficultyRaw = readNumber(record, ["difficulty"], 0) ?? 0;
  return {
    order: readNumber(record, ["order"], 0) ?? 0,
    questionId: readString(record, ["questionId"], ""),
    questionText: readString(record, ["questionText"], "—"),
    classification: readString(record, ["classification"], "—"),
    difficulty: isQuestionDifficulty(difficultyRaw) ? difficultyRaw : 0,
    correctAnswerPercent: readNumber(record, ["correctAnswerPercent"], 0) ?? 0,
  };
}

function mapTopStudent(item: unknown): QuizTopStudentRow | null {
  const record = asRecord(item);
  if (!record) return null;
  const userId = readString(record, ["userId"]);
  if (!userId) return null;
  return {
    rank: readNumber(record, ["rank"], 0) ?? 0,
    userId,
    fullName: readString(record, ["fullName"], "—"),
    profileImageUrl: readString(record, ["profileImageUrl"], "") || null,
    levelLabel: readString(record, ["levelLabel"], "—"),
    scorePercent: readNumber(record, ["scorePercent"], 0) ?? 0,
    completionMinutes: readNumber(record, ["completionMinutes"], 0) ?? 0,
  };
}

function mapQuizAnalysis(data: unknown, pagination: XPaginationMeta | null): QuizAnalysisData | null {
  const record = asRecord(extractEnvelopeData(data));
  if (!record) return null;

  return {
    header: mapQuizHeader(asRecord(record.header)),
    summary: mapQuizSummary(asRecord(record.summary)),
    questionPerformance: readArray(record, ["questionPerformance"])
      .map(mapQuestionPerformance)
      .filter((row): row is QuizQuestionPerformanceRow => row !== null),
    gradeDistribution: readArray(record, ["gradeDistribution"])
      .map(mapGradeDistribution)
      .filter((row): row is QuizGradeDistributionRow => row !== null),
    questionDetails: readArray(record, ["questionDetails"])
      .map(mapQuestionDetail)
      .filter((row): row is QuizQuestionDetailRow => row !== null),
    topStudents: readArray(record, ["topStudents"])
      .map(mapTopStudent)
      .filter((row): row is QuizTopStudentRow => row !== null),
    questionPagination: {
      currentPage: pagination?.currentPage ?? 1,
      totalPages: pagination?.totalPages ?? 1,
      pageSize: pagination?.pageSize ?? 10,
      totalCount: pagination?.totalCount ?? 0,
      hasPrevious: pagination?.hasPrevious ?? false,
      hasNext: pagination?.hasNext ?? false,
    },
  };
}

export function filtersToOverviewParams(
  filters: ResultsAnalyticsFilterState,
  debouncedSearch: string,
  pageNumber: number,
  pageSize: number,
): GetResultsOverviewParams {
  return {
    pageNumber,
    pageSize,
    scoreMode: filters.scoreMode,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(filters.quizId ? { quizId: filters.quizId } : {}),
    ...(filters.schoolId ? { schoolId: filters.schoolId } : {}),
  };
}

export async function getResultsOverview(
  params: GetResultsOverviewParams,
): Promise<ResultsAnalyticsApiResult<ResultsOverviewPage>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `${BASE}/overview`,
      params: {
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        scoreMode: params.scoreMode ?? 0,
        ...(params.search?.trim() ? { search: params.search.trim() } : {}),
        ...(params.quizId?.trim() ? { quizId: params.quizId.trim() } : {}),
        ...(params.quizType != null ? { quizType: params.quizType } : {}),
        ...(params.courseId?.trim() ? { courseId: params.courseId.trim() } : {}),
        ...(params.schoolId?.trim() ? { schoolId: params.schoolId.trim() } : {}),
      },
    });

    const mapped = mapOverviewData(response.data);
    if (!mapped) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Invalid overview response",
        data: null,
      };
    }

    const pagination = parseXPaginationHeader(response.headers ?? {});
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mergePagination(mapped, pagination),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load results overview");
  }
}

export async function getStudentResultsDashboard(
  studentId: string,
  periodDays = 30,
): Promise<ResultsAnalyticsApiResult<StudentResultsDashboardData>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `${BASE}/students/${encodeURIComponent(studentId)}/dashboard`,
      params: { periodDays },
    });

    const mapped = mapStudentDashboard(response.data);
    if (!mapped) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Invalid student dashboard response",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapped,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load student dashboard");
  }
}

export async function getStudentResultsExams(
  params: GetStudentExamsParams,
): Promise<ResultsAnalyticsApiResult<StudentExamsPage>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `${BASE}/students/${encodeURIComponent(params.studentId)}/exams`,
      params: {
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        scoreMode: params.scoreMode ?? 0,
      },
    });

    const mapped = mapStudentExams(response.data);
    if (!mapped) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Invalid student exams response",
        data: null,
      };
    }

    const pagination = parseXPaginationHeader(response.headers ?? {});
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mergePagination(mapped, pagination),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load student exams");
  }
}

export async function getStudentResultsCertificates(
  studentId: string,
): Promise<ResultsAnalyticsApiResult<StudentCertificatesData>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `${BASE}/students/${encodeURIComponent(studentId)}/certificates`,
    });

    const mapped = mapCertificates(response.data);
    if (!mapped) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Invalid certificates response",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapped,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load student certificates");
  }
}

export async function getQuizAnalysis(
  params: GetQuizAnalysisParams,
): Promise<ResultsAnalyticsApiResult<QuizAnalysisData>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `${BASE}/quizzes/${encodeURIComponent(params.quizId)}/analysis`,
      params: {
        scoreMode: params.scoreMode ?? 0,
        questionSort: params.questionSort ?? 0,
        questionPageNumber: params.questionPageNumber,
        questionPageSize: params.questionPageSize,
        topStudentsCount: params.topStudentsCount ?? 4,
        ...(params.schoolId?.trim() ? { schoolId: params.schoolId.trim() } : {}),
      },
    });

    const pagination = parseXPaginationHeader(response.headers ?? {});
    const mapped = mapQuizAnalysis(response.data, pagination);
    if (!mapped) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Invalid quiz analysis response",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapped,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load quiz analysis");
  }
}
