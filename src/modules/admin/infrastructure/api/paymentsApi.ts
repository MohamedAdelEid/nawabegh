import type { BackendApiResponse, BackendStatus } from "@/shared/domain/types/api.types";
import type {
  AdminPaymentTransactionDetail,
  AdminPaymentTransactionListItem,
  AdminPaymentsOverview,
  AdminPaymentTransactionsPage,
  AdminStudentEnrollmentDetail,
  AdminStudentEnrollmentListItem,
  AdminStudentEnrollmentsPage,
  PaymentGatewaySettings,
  PaymentTransactionsListParams,
  StudentEnrollmentsListParams,
  UpdatePaymentGatewaySettingsPayload,
} from "@/modules/admin/domain/types/payments.types";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import { parseXPaginationHeader, type XPaginationMeta } from "@/shared/infrastructure/http/xPagination";

const PAYMENTS_BASE = "/api/v1/admin/payments";
const GATEWAY_BASE = "/api/v1/admin/payment-gateway";

type UnknownRecord = Record<string, unknown>;

export type PaymentsApiResult<T> = {
  status: BackendStatus | string;
  message?: string;
  errorMessage?: string;
  data: T | null;
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

function readNullableString(record: UnknownRecord | null, keys: string[]): string | null {
  const value = readString(record, keys, "").trim();
  return value || null;
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

function readArray(record: UnknownRecord | null, keys: string[]): unknown[] | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return null;
}

function extractEnvelopeData(data: unknown): unknown {
  const record = asRecord(data);
  return record?.data ?? data;
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
    default:
      return "Error";
  }
}

function buildErrorResult<T>(error: unknown, fallbackMessage: string): PaymentsApiResult<T> {
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

function mapTransactionListItem(record: UnknownRecord): AdminPaymentTransactionListItem | null {
  const id = readString(record, ["id"], "").trim();
  if (!id) return null;

  return {
    id,
    isPaymentTransaction: readBoolean(record, ["isPaymentTransaction"]),
    sessionId: readString(record, ["sessionId"], ""),
    referenceNumber: readString(record, ["referenceNumber"], ""),
    studentId: readString(record, ["studentId"], ""),
    studentName: readString(record, ["studentName"], ""),
    studentAvatarUrl: readNullableString(record, ["studentAvatarUrl"]),
    parentUserId: readNullableString(record, ["parentUserId"]),
    parentName: readNullableString(record, ["parentName"]),
    parentEmail: readNullableString(record, ["parentEmail"]),
    parentAvatarUrl: readNullableString(record, ["parentAvatarUrl"]),
    productType: (readString(record, ["productType"], "course") as "course" | "bundle"),
    productName: readString(record, ["productName"], ""),
    amount: readNumber(record, ["amount"]) ?? 0,
    currency: readString(record, ["currency"], "OMR"),
    paymentMethod: readString(record, ["paymentMethod"], ""),
    paymentMethodLabelAr: readString(record, ["paymentMethodLabelAr"], ""),
    providerKey: readString(record, ["providerKey"], ""),
    status: readString(record, ["status"], ""),
    statusLabelAr: readString(record, ["statusLabelAr"], ""),
    occurredAt: readNullableString(record, ["occurredAt"]),
    createdAt: readString(record, ["createdAt"], ""),
  };
}

function mapMonthlyRevenue(record: UnknownRecord) {
  return {
    year: readNumber(record, ["year"]) ?? new Date().getUTCFullYear(),
    month: readNumber(record, ["month"]) ?? 1,
    amount: readNumber(record, ["amount"]) ?? 0,
    currency: readString(record, ["currency"], "OMR"),
  };
}

function mapOverview(record: UnknownRecord): AdminPaymentsOverview {
  const summaryRecord = asRecord(record.summary) ?? {};
  const monthlyRevenue =
    readArray(record, ["monthlyRevenue"])?.map((item) => mapMonthlyRevenue(asRecord(item) ?? {})) ?? [];
  const recentTransactions =
    readArray(record, ["recentTransactions"])
      ?.map((item) => mapTransactionListItem(asRecord(item) ?? {}))
      .filter((row): row is AdminPaymentTransactionListItem => row !== null) ?? [];

  return {
    summary: {
      totalRevenue: readNumber(summaryRecord, ["totalRevenue"]) ?? 0,
      currency: readString(summaryRecord, ["currency"], "OMR"),
      revenueChangePercent: readNumber(summaryRecord, ["revenueChangePercent"]) ?? 0,
      activeEnrollments: readNumber(summaryRecord, ["activeEnrollments"]) ?? 0,
      activeEnrollmentsChangePercent:
        readNumber(summaryRecord, ["activeEnrollmentsChangePercent"]) ?? 0,
      failedPaymentCount: readNumber(summaryRecord, ["failedPaymentCount"]) ?? 0,
      failedPaymentsChangePercent: readNumber(summaryRecord, ["failedPaymentsChangePercent"]) ?? 0,
    },
    monthlyRevenue,
    recentTransactions,
  };
}

function mapTransactionsSummary(record: UnknownRecord) {
  return {
    totalRevenue: readNumber(record, ["totalRevenue"]) ?? 0,
    currency: readString(record, ["currency"], "OMR"),
    revenueChangePercent: readNumber(record, ["revenueChangePercent"]) ?? 0,
    succeededCount: readNumber(record, ["succeededCount"]) ?? 0,
    successRatePercent: readNumber(record, ["successRatePercent"]) ?? 0,
    failedCount: readNumber(record, ["failedCount"]) ?? 0,
  };
}

function extractPageMeta(
  params: { pageNumber: number; pageSize: number },
  rowCount: number,
  headerMeta: XPaginationMeta | null,
) {
  const currentPage = headerMeta?.currentPage ?? params.pageNumber;
  const pageSize = headerMeta?.pageSize ?? params.pageSize;
  const totalItems =
    headerMeta?.totalCount ??
    (rowCount < pageSize ? (currentPage - 1) * pageSize + rowCount : currentPage * pageSize);
  const totalPages = headerMeta?.totalPages ?? Math.max(1, Math.ceil(totalItems / pageSize));
  const hasNextPage = headerMeta?.hasNext ?? rowCount >= pageSize;

  return { currentPage, pageSize, totalItems, totalPages, hasNextPage };
}

function mapPartyUser(record: UnknownRecord | null) {
  if (!record) return null;
  const userId = readString(record, ["userId"], "").trim();
  if (!userId) return null;
  return {
    userId,
    fullName: readString(record, ["fullName"], ""),
    email: readNullableString(record, ["email"]),
    phone: readNullableString(record, ["phone"]),
    avatarUrl: readNullableString(record, ["avatarUrl"]),
  };
}

function mapStudentParty(record: UnknownRecord | null) {
  const userId = readString(record, ["userId"], "").trim();
  return {
    userId,
    fullName: readString(record, ["fullName"], ""),
    avatarUrl: readNullableString(record, ["avatarUrl"]),
    gradeNameAr: readNullableString(record, ["gradeNameAr"]),
    educationLevelNameAr: readNullableString(record, ["educationLevelNameAr"]),
    schoolName: readNullableString(record, ["schoolName"]),
  };
}

function mapTransactionDetail(record: UnknownRecord): AdminPaymentTransactionDetail | null {
  const id = readString(record, ["id"], "").trim();
  if (!id) return null;

  const partiesRecord = asRecord(record.parties) ?? {};
  const invoiceRecord = asRecord(record.invoice);
  const timeline =
    readArray(record, ["timeline"])?.map((item) => {
      const row = asRecord(item) ?? {};
      return {
        key: readString(row, ["key"], ""),
        labelAr: readString(row, ["labelAr"], ""),
        occurredAt: readNullableString(row, ["occurredAt"]),
        isCompleted: readBoolean(row, ["isCompleted"]),
      };
    }) ?? [];

  const accessRecord = asRecord(record.accessGranted);

  return {
    id,
    referenceNumber: readString(record, ["referenceNumber"], ""),
    amount: readNumber(record, ["amount"]) ?? 0,
    currency: readString(record, ["currency"], "OMR"),
    status: readString(record, ["status"], ""),
    statusLabelAr: readString(record, ["statusLabelAr"], ""),
    occurredAt: readNullableString(record, ["occurredAt"]),
    operationType: readString(record, ["operationType"], ""),
    operationTypeLabelAr: readString(record, ["operationTypeLabelAr"], ""),
    paymentMethodLabelAr: readString(record, ["paymentMethodLabelAr"], ""),
    providerKey: readString(record, ["providerKey"], ""),
    parties: {
      parent: mapPartyUser(asRecord(partiesRecord.parent)),
      student: mapStudentParty(asRecord(partiesRecord.student)),
    },
    invoice: invoiceRecord
      ? {
          referenceNumber: readString(invoiceRecord, ["referenceNumber"], ""),
          studentName: readString(invoiceRecord, ["studentName"], ""),
          productName: readString(invoiceRecord, ["productName"], ""),
          currency: readString(invoiceRecord, ["currency"], "OMR"),
          originalPrice: readNumber(invoiceRecord, ["originalPrice"]) ?? 0,
          discountAmount: readNumber(invoiceRecord, ["discountAmount"]) ?? 0,
          vatRate: readNumber(invoiceRecord, ["vatRate"]) ?? 0,
          vatAmount: readNumber(invoiceRecord, ["vatAmount"]) ?? 0,
          finalPrice: readNumber(invoiceRecord, ["finalPrice"]) ?? 0,
          paymentMethod: readString(invoiceRecord, ["paymentMethod"], ""),
          couponCode: readNullableString(invoiceRecord, ["couponCode"]),
          paidAt: readNullableString(invoiceRecord, ["paidAt"]),
        }
      : null,
    timeline,
    accessGranted: accessRecord
      ? {
          startsAt: readNullableString(accessRecord, ["startsAt"]),
          endsAt: readNullableString(accessRecord, ["endsAt"]),
          endsAtDisplay: readNullableString(accessRecord, ["endsAtDisplay"]),
          accessDurationDays: readNumber(accessRecord, ["accessDurationDays"]),
        }
      : null,
  };
}

function mapEnrollmentListItem(record: UnknownRecord): AdminStudentEnrollmentListItem | null {
  const enrollmentId = readString(record, ["enrollmentId"], "").trim();
  if (!enrollmentId) return null;

  return {
    enrollmentId,
    studentId: readString(record, ["studentId"], ""),
    studentName: readString(record, ["studentName"], ""),
    studentAvatarUrl: readNullableString(record, ["studentAvatarUrl"]),
    parentUserId: readNullableString(record, ["parentUserId"]),
    parentName: readNullableString(record, ["parentName"]),
    parentAvatarUrl: readNullableString(record, ["parentAvatarUrl"]),
    courseId: readString(record, ["courseId"], ""),
    courseTitle: readString(record, ["courseTitle"], ""),
    bundleId: readNullableString(record, ["bundleId"]),
    bundleName: readNullableString(record, ["bundleName"]),
    productName: readString(record, ["productName"], ""),
    productType: (readString(record, ["productType"], "course") as "course" | "bundle"),
    status: readString(record, ["status"], ""),
    statusLabelAr: readString(record, ["statusLabelAr"], ""),
    startsAt: readNullableString(record, ["startsAt"]),
    endsAt: readNullableString(record, ["endsAt"]),
    endsAtDisplay: readNullableString(record, ["endsAtDisplay"]),
    enrolledAt: readNullableString(record, ["enrolledAt"]),
  };
}

function mapEnrollmentsSummary(record: UnknownRecord) {
  return {
    totalEnrollments: readNumber(record, ["totalEnrollments"]) ?? 0,
    activeCount: readNumber(record, ["activeCount"]) ?? 0,
    expiredCount: readNumber(record, ["expiredCount"]) ?? 0,
    inactiveCount: readNumber(record, ["inactiveCount"]) ?? 0,
  };
}

function mapEnrollmentDetail(record: UnknownRecord): AdminStudentEnrollmentDetail | null {
  const enrollmentId = readString(record, ["enrollmentId"], "").trim();
  if (!enrollmentId) return null;

  const paymentSummaryRecord = asRecord(record.paymentSummary) ?? {};
  const partiesRecord = asRecord(record.parties) ?? {};
  const productRecord = asRecord(record.product) ?? {};
  const timelineRecord = asRecord(record.timeline) ?? {};
  const paymentHistory =
    readArray(record, ["paymentHistory"])?.map((item) => {
      const row = asRecord(item) ?? {};
      return {
        id: readString(row, ["id"], ""),
        isPaymentTransaction: readBoolean(row, ["isPaymentTransaction"]),
        sessionId: readString(row, ["sessionId"], ""),
        referenceNumber: readString(row, ["referenceNumber"], ""),
        paidAt: readNullableString(row, ["paidAt"]),
        description: readString(row, ["description"], ""),
        amount: readNumber(row, ["amount"]) ?? 0,
        currency: readString(row, ["currency"], "OMR"),
        status: readString(row, ["status"], ""),
        statusLabelAr: readString(row, ["statusLabelAr"], ""),
        paymentMethod: readString(row, ["paymentMethod"], ""),
        paymentMethodLabelAr: readString(row, ["paymentMethodLabelAr"], ""),
      };
    }) ?? [];

  return {
    enrollmentId,
    paymentSummary: {
      totalPaid: readNumber(paymentSummaryRecord, ["totalPaid"]) ?? 0,
      currency: readString(paymentSummaryRecord, ["currency"], "OMR"),
      paymentCount: readNumber(paymentSummaryRecord, ["paymentCount"]) ?? 0,
      summaryLabelAr: readString(paymentSummaryRecord, ["summaryLabelAr"], ""),
    },
    parties: {
      parent: mapPartyUser(asRecord(partiesRecord.parent)),
      student: mapStudentParty(asRecord(partiesRecord.student)),
    },
    product: {
      productName: readString(productRecord, ["productName"], ""),
      productType: (readString(productRecord, ["productType"], "course") as "course" | "bundle"),
      courseTitle: readNullableString(productRecord, ["courseTitle"]),
      bundleName: readNullableString(productRecord, ["bundleName"]),
      startsAt: readNullableString(productRecord, ["startsAt"]),
      endsAtDisplay: readNullableString(productRecord, ["endsAtDisplay"]),
      accessDurationDays: readNumber(productRecord, ["accessDurationDays"]),
      paymentMethodLabelAr: readNullableString(productRecord, ["paymentMethodLabelAr"]),
    },
    timeline: {
      accountCreatedAt: readNullableString(timelineRecord, ["accountCreatedAt"]),
      firstPaymentAt: readNullableString(timelineRecord, ["firstPaymentAt"]),
      isActiveNow: readBoolean(timelineRecord, ["isActiveNow"]),
      endsAtDisplay: readNullableString(timelineRecord, ["endsAtDisplay"]),
      progressPercent: readNumber(timelineRecord, ["progressPercent"]) ?? 0,
    },
    paymentHistory,
  };
}

function mapGatewaySettings(record: UnknownRecord): PaymentGatewaySettings {
  return {
    provider: readString(record, ["provider"], "tap"),
    merchantId: readString(record, ["merchantId"], ""),
    isConfiguredInDatabase: readBoolean(record, ["isConfiguredInDatabase"]),
    hasSecretKey: readBoolean(record, ["hasSecretKey"]),
    hasWebhookSecret: readBoolean(record, ["hasWebhookSecret"]),
    secretKeyHint: readNullableString(record, ["secretKeyHint"]),
    webhookSecretHint: readNullableString(record, ["webhookSecretHint"]),
  };
}

export async function getPaymentsOverview(params?: {
  year?: number;
  recentTransactionsCount?: number;
}): Promise<PaymentsApiResult<AdminPaymentsOverview>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `${PAYMENTS_BASE}/overview`,
      params: {
        ...(params?.year !== undefined ? { year: params.year } : {}),
        ...(params?.recentTransactionsCount !== undefined
          ? { recentTransactionsCount: params.recentTransactionsCount }
          : {}),
      },
    });
    const payload = asRecord(extractEnvelopeData(response.data));
    if (!payload) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Invalid overview response",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapOverview(payload),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load payments overview");
  }
}

export async function getPaymentTransactionsPage(
  params: PaymentTransactionsListParams,
): Promise<PaymentsApiResult<AdminPaymentTransactionsPage>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `${PAYMENTS_BASE}/transactions`,
      params: {
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        ...(params.search?.trim() ? { search: params.search.trim() } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.method !== undefined ? { method: params.method } : {}),
        ...(params.fromDate ? { fromDate: params.fromDate } : {}),
        ...(params.toDate ? { toDate: params.toDate } : {}),
      },
    });

    const payload = asRecord(extractEnvelopeData(response.data)) ?? {};
    const items =
      readArray(payload, ["items"])
        ?.map((item) => mapTransactionListItem(asRecord(item) ?? {}))
        .filter((row): row is AdminPaymentTransactionListItem => row !== null) ?? [];
    const headerMeta = parseXPaginationHeader(response.headers ?? {});
    const meta = extractPageMeta(params, items.length, headerMeta);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: {
        summary: mapTransactionsSummary(asRecord(payload.summary) ?? {}),
        items,
        ...meta,
      },
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load transactions");
  }
}

export async function getPaymentTransactionById(
  transactionId: string,
): Promise<PaymentsApiResult<AdminPaymentTransactionDetail>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `${PAYMENTS_BASE}/transactions/${encodeURIComponent(transactionId)}`,
    });
    const detail = mapTransactionDetail(asRecord(extractEnvelopeData(response.data)) ?? {});
    if (!detail) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Transaction was not found",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: detail,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load transaction details");
  }
}

export async function getStudentEnrollmentsPage(
  params: StudentEnrollmentsListParams,
): Promise<PaymentsApiResult<AdminStudentEnrollmentsPage>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `${PAYMENTS_BASE}/student-enrollments`,
      params: {
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        ...(params.search?.trim() ? { search: params.search.trim() } : {}),
        ...(params.status !== undefined ? { status: params.status } : {}),
        ...(params.courseId ? { courseId: params.courseId } : {}),
        ...(params.bundleId ? { bundleId: params.bundleId } : {}),
        ...(params.startsFrom ? { startsFrom: params.startsFrom } : {}),
        ...(params.startsTo ? { startsTo: params.startsTo } : {}),
        ...(params.endsFrom ? { endsFrom: params.endsFrom } : {}),
        ...(params.endsTo ? { endsTo: params.endsTo } : {}),
      },
    });

    const payload = asRecord(extractEnvelopeData(response.data)) ?? {};
    const items =
      readArray(payload, ["items"])
        ?.map((item) => mapEnrollmentListItem(asRecord(item) ?? {}))
        .filter((row): row is AdminStudentEnrollmentListItem => row !== null) ?? [];
    const headerMeta = parseXPaginationHeader(response.headers ?? {});
    const meta = extractPageMeta(params, items.length, headerMeta);

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: {
        summary: mapEnrollmentsSummary(asRecord(payload.summary) ?? {}),
        items,
        ...meta,
      },
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load student enrollments");
  }
}

export async function getStudentEnrollmentById(
  enrollmentId: string,
): Promise<PaymentsApiResult<AdminStudentEnrollmentDetail>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `${PAYMENTS_BASE}/student-enrollments/${encodeURIComponent(enrollmentId)}`,
    });
    const detail = mapEnrollmentDetail(asRecord(extractEnvelopeData(response.data)) ?? {});
    if (!detail) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Enrollment was not found",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: detail,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load enrollment details");
  }
}

export async function getPaymentGatewaySettings(): Promise<PaymentsApiResult<PaymentGatewaySettings>> {
  try {
    const response = await httpClient.get<unknown>({
      url: `${GATEWAY_BASE}/settings`,
    });
    const payload = asRecord(extractEnvelopeData(response.data));
    if (!payload) {
      return {
        status: response.status,
        message: response.message,
        errorMessage: response.error?.message ?? "Invalid gateway settings response",
        data: null,
      };
    }

    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: mapGatewaySettings(payload),
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to load payment gateway settings");
  }
}

export async function updatePaymentGatewaySettings(
  payload: UpdatePaymentGatewaySettingsPayload,
): Promise<PaymentsApiResult<PaymentGatewaySettings>> {
  try {
    const response = await httpClient.put<unknown>({
      url: `${GATEWAY_BASE}/settings`,
      data: payload,
    });
    const settings = mapGatewaySettings(asRecord(extractEnvelopeData(response.data)) ?? {});
    return {
      status: response.status,
      message: response.message,
      errorMessage: response.error?.message,
      data: settings,
    };
  } catch (error) {
    return buildErrorResult(error, "Failed to update payment gateway settings");
  }
}
