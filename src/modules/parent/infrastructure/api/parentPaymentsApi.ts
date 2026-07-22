import type {
  ParentActiveSubscription,
  ParentPaymentTransactionDetail,
  ParentPaymentTransactionListItem,
  ParentPaymentTransactionsPage,
  ParentPaymentTransactionsQuery,
  ParentPaymentsDashboard,
} from "@/modules/parent/domain/types/parentPayments.types";
import type {
  CheckoutInvoiceDto,
  CheckoutResultDto,
  CheckoutSessionDto,
  PaymentInitiateDto,
} from "@/modules/student/domain/enrollment/enrollment.types";
import {
  mapCheckoutInvoiceDto,
  mapCheckoutResultDto,
  mapCheckoutSessionDto,
  mapPaymentInitiateDto,
} from "@/modules/student/domain/enrollment/enrollment.utils";
import {
  extractApiErrorMessage,
  resolveApiData,
} from "@/shared/infrastructure/api/apiResponse.utils";
import { httpClient } from "@/shared/infrastructure/http/httpClient";
import {
  parseXPaginationHeader,
  resolveListPageMeta,
} from "@/shared/infrastructure/http/xPagination";

const PAYMENTS_URL = "/api/v1/Parent/payments";
const CHECKOUT_SESSIONS_URL = `${PAYMENTS_URL}/checkout/sessions`;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function mapPaymentTransactionListItem(
  raw: unknown,
): ParentPaymentTransactionListItem {
  const item = asRecord(raw);
  return {
    id: asString(item.id),
    sessionId: asNullableString(item.sessionId),
    referenceNumber: asString(item.referenceNumber),
    studentUserId: asString(item.studentUserId),
    studentName: asString(item.studentName),
    studentAvatarUrl: asNullableString(item.studentAvatarUrl),
    productName: asString(item.productName),
    productNameAr:
      typeof item.productNameAr === "string" ? item.productNameAr : null,
    productType: asString(item.productType, "course"),
    amount: typeof item.amount === "number" ? item.amount : Number(item.amount) || 0,
    currency: asString(item.currency, "OMR"),
    status: asString(item.status, "pending"),
    statusLabelAr:
      typeof item.statusLabelAr === "string" ? item.statusLabelAr : null,
    statusLabelEn:
      typeof item.statusLabelEn === "string" ? item.statusLabelEn : null,
    occurredAt: asNullableString(item.occurredAt),
    createdAt: asString(item.createdAt),
  };
}

function mapActiveSubscription(raw: unknown): ParentActiveSubscription {
  const item = asRecord(raw);
  return {
    enrollmentId: asString(item.enrollmentId),
    studentUserId: asString(item.studentUserId),
    studentName: asString(item.studentName),
    studentAvatarUrl: asNullableString(item.studentAvatarUrl),
    productName: asString(item.productName),
    productNameAr:
      typeof item.productNameAr === "string" ? item.productNameAr : null,
    productType: asString(item.productType, "course"),
    status: asString(item.status),
    statusLabelAr:
      typeof item.statusLabelAr === "string" ? item.statusLabelAr : null,
    statusLabelEn:
      typeof item.statusLabelEn === "string" ? item.statusLabelEn : null,
    endsAt: asNullableString(item.endsAt),
    endsAtDisplay:
      typeof item.endsAtDisplay === "string" ? item.endsAtDisplay : null,
    courseId: asNullableString(item.courseId),
    bundleId: asNullableString(item.bundleId),
    features: Array.isArray(item.features)
      ? item.features.filter((feature): feature is string => typeof feature === "string")
      : null,
  };
}

async function callParentPaymentsApi<T>(
  action: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, fallbackMessage));
  }
}

export async function fetchParentPaymentsDashboard(): Promise<ParentPaymentsDashboard> {
  return callParentPaymentsApi(async () => {
    const response = await httpClient.get<ParentPaymentsDashboard>({
      url: PAYMENTS_URL,
    });
    const data = resolveApiData<ParentPaymentsDashboard>(response);
    return {
      activeSubscriptions: (data.activeSubscriptions ?? []).map(mapActiveSubscription),
      availableOffers: data.availableOffers ?? [],
      summary: data.summary ?? {
        totalSpent: 0,
        currency: "OMR",
        succeededCount: 0,
        pendingCount: 0,
        failedCount: 0,
      },
      recentTransactions: (data.recentTransactions ?? []).map(
        mapPaymentTransactionListItem,
      ),
    };
  }, "Failed to load parent payments");
}

export async function fetchParentPaymentTransactions(
  query: ParentPaymentTransactionsQuery,
): Promise<ParentPaymentTransactionsPage> {
  return callParentPaymentsApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `${PAYMENTS_URL}/transactions`,
      params: {
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
        ...(query.studentUserId ? { studentUserId: query.studentUserId } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.search?.trim() ? { search: query.search.trim() } : {}),
        ...(query.fromDate ? { fromDate: query.fromDate } : {}),
        ...(query.toDate ? { toDate: query.toDate } : {}),
        ...(query.method ? { method: query.method } : {}),
      },
    });

    const data = resolveApiData<unknown>(response);
    const payload = asRecord(data);
    const items = Array.isArray(data)
      ? data
      : Array.isArray(payload.items)
        ? payload.items
        : [];
    const headerMeta = parseXPaginationHeader(response.headers ?? {});
    const meta = resolveListPageMeta(
      { pageNumber: query.pageNumber, pageSize: query.pageSize },
      items.length,
      headerMeta,
      payload,
    );

    return {
      items: items.map(mapPaymentTransactionListItem),
      currentPage: meta.currentPage,
      pageSize: meta.pageSize,
      totalItems: meta.totalItems,
      totalPages: meta.totalPages,
      hasNextPage: meta.currentPage < meta.totalPages,
    };
  }, "Failed to load payment transactions");
}

export async function fetchParentPaymentTransactionDetail(
  transactionId: string,
): Promise<ParentPaymentTransactionDetail> {
  return callParentPaymentsApi(async () => {
    const response = await httpClient.get<ParentPaymentTransactionDetail>({
      url: `${PAYMENTS_URL}/transactions/${encodeURIComponent(transactionId)}`,
    });
    return resolveApiData<ParentPaymentTransactionDetail>(response);
  }, "Failed to load transaction details");
}

export async function createParentCheckoutSession(params: {
  studentUserId: string;
  courseId?: string;
  bundleId?: string;
}): Promise<CheckoutSessionDto> {
  return callParentPaymentsApi(async () => {
    const response = await httpClient.post<unknown>({
      url: CHECKOUT_SESSIONS_URL,
      params: {
        studentUserId: params.studentUserId,
        ...(params.courseId ? { courseId: params.courseId } : {}),
        ...(params.bundleId ? { bundleId: params.bundleId } : {}),
      },
    });
    const dto = mapCheckoutSessionDto(resolveApiData<unknown>(response));
    if (!dto) throw new Error("Checkout session was not created");
    return dto;
  }, "Failed to create checkout session");
}

export async function getParentCheckoutSession(sessionId: string): Promise<CheckoutSessionDto> {
  return callParentPaymentsApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `${CHECKOUT_SESSIONS_URL}/${encodeURIComponent(sessionId)}`,
    });
    const dto = mapCheckoutSessionDto(resolveApiData<unknown>(response));
    if (!dto) throw new Error("Checkout session not found");
    return dto;
  }, "Failed to load checkout session");
}

export async function applyParentCheckoutCoupon(
  sessionId: string,
  couponCode: string,
): Promise<CheckoutSessionDto> {
  return callParentPaymentsApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `${CHECKOUT_SESSIONS_URL}/${encodeURIComponent(sessionId)}/coupon`,
      params: { CouponCode: couponCode.trim() },
    });
    const dto = mapCheckoutSessionDto(resolveApiData<unknown>(response));
    if (!dto) throw new Error("Failed to apply coupon");
    return dto;
  }, "الكوبون غير صالح");
}

export async function redeemParentActivationCode(
  sessionId: string,
  code: string,
): Promise<CheckoutResultDto> {
  return callParentPaymentsApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `${CHECKOUT_SESSIONS_URL}/${encodeURIComponent(sessionId)}/activation-code/redeem`,
      params: { Code: code.trim() },
    });
    const dto = mapCheckoutResultDto(resolveApiData<unknown>(response));
    if (!dto) throw new Error("Failed to redeem activation code");
    return dto;
  }, "كود التفعيل غير صالح");
}

export async function initiateParentVisaPayment(
  sessionId: string,
): Promise<PaymentInitiateDto> {
  return callParentPaymentsApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `${CHECKOUT_SESSIONS_URL}/${encodeURIComponent(sessionId)}/visa/initiate`,
    });
    const dto = mapPaymentInitiateDto(resolveApiData<unknown>(response));
    if (!dto) throw new Error("Failed to initiate payment");
    return dto;
  }, "Failed to initiate payment");
}

export async function getParentCheckoutResult(sessionId: string): Promise<CheckoutResultDto> {
  return callParentPaymentsApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `${CHECKOUT_SESSIONS_URL}/${encodeURIComponent(sessionId)}/result`,
    });
    const dto = mapCheckoutResultDto(resolveApiData<unknown>(response));
    if (!dto) throw new Error("Checkout result not found");
    return dto;
  }, "Failed to load checkout result");
}

export async function resetParentCheckoutSession(
  sessionId: string,
): Promise<CheckoutSessionDto> {
  return callParentPaymentsApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `${CHECKOUT_SESSIONS_URL}/${encodeURIComponent(sessionId)}/reset`,
    });
    const dto = mapCheckoutSessionDto(resolveApiData<unknown>(response));
    if (!dto) throw new Error("Failed to reset checkout session");
    return dto;
  }, "Failed to reset checkout session");
}

export async function getParentCheckoutInvoice(
  sessionId: string,
): Promise<CheckoutInvoiceDto> {
  return callParentPaymentsApi(async () => {
    const response = await httpClient.get<unknown>({
      url: `${CHECKOUT_SESSIONS_URL}/${encodeURIComponent(sessionId)}/invoice`,
    });
    const dto = mapCheckoutInvoiceDto(resolveApiData<unknown>(response));
    if (!dto) throw new Error("Invoice not available");
    return dto;
  }, "Invoice not available");
}
