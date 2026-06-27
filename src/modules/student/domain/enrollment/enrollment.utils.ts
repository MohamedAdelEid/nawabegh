import {
  CheckoutPaymentMethod,
  CheckoutSessionStatus,
  PaymentTransactionStatus,
} from "@/modules/student/domain/enrollment/enrollment.enums";
import type {
  CheckoutInvoiceDto,
  CheckoutPricingDto,
  CheckoutResultDto,
  CheckoutSessionDto,
  PaymentInitiateDto,
} from "@/modules/student/domain/enrollment/enrollment.types";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" ? (value as UnknownRecord) : null;
}

function toNumber(value: unknown, fallback = 0): number {
  if (value == null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toOptionalString(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function mapCheckoutPricing(row: unknown): CheckoutPricingDto {
  const record = asRecord(row) ?? {};
  return {
    currency: toOptionalString(record.currency) || "SAR",
    originalPrice: toNumber(record.originalPrice),
    discountAmount: toNumber(record.discountAmount),
    vatRate: toNumber(record.vatRate),
    vatAmount: toNumber(record.vatAmount),
    finalPrice: toNumber(record.finalPrice),
  };
}

export function mapCheckoutSessionDto(item: unknown): CheckoutSessionDto | null {
  const row = asRecord(item);
  if (!row) return null;

  const sessionId = toOptionalString(row.sessionId);
  if (!sessionId) return null;

  return {
    sessionId,
    courseId: toOptionalString(row.courseId),
    studentId: toOptionalString(row.studentId),
    isFreeCourse: Boolean(row.isFreeCourse),
    status: toNumber(row.status, CheckoutSessionStatus.AwaitingMethod) as CheckoutSessionStatus,
    selectedMethod: toNumber(row.selectedMethod, CheckoutPaymentMethod.None) as CheckoutPaymentMethod,
    pricing: mapCheckoutPricing(row.pricing),
    expiresAtUtc: toOptionalString(row.expiresAtUtc),
    failureReason: row.failureReason != null ? toOptionalString(row.failureReason) : null,
    referenceNumber: toOptionalString(row.referenceNumber),
  };
}

export function mapCheckoutResultDto(item: unknown): CheckoutResultDto | null {
  const row = asRecord(item);
  if (!row) return null;

  const sessionId = toOptionalString(row.sessionId);
  if (!sessionId) return null;

  const enrollmentId = row.enrollmentId != null ? toOptionalString(row.enrollmentId) : null;

  return {
    sessionId,
    status: toNumber(row.status, CheckoutSessionStatus.AwaitingMethod) as CheckoutSessionStatus,
    enrollmentId: enrollmentId || null,
    message: toOptionalString(row.message),
    referenceNumber: toOptionalString(row.referenceNumber),
  };
}

export function mapPaymentInitiateDto(item: unknown): PaymentInitiateDto | null {
  const row = asRecord(item);
  if (!row) return null;

  const transactionId = toOptionalString(row.transactionId);
  const paymentUrl = toOptionalString(row.paymentUrl);
  if (!transactionId || !paymentUrl) return null;

  return {
    transactionId,
    sessionId: toOptionalString(row.sessionId),
    providerKey: toOptionalString(row.providerKey),
    providerTransactionId: toOptionalString(row.providerTransactionId),
    paymentUrl,
    status: toNumber(row.status, PaymentTransactionStatus.Initiated) as PaymentTransactionStatus,
    failureCode: row.failureCode != null ? toOptionalString(row.failureCode) : null,
    failureMessage: row.failureMessage != null ? toOptionalString(row.failureMessage) : null,
  };
}

export function mapCheckoutInvoiceDto(item: unknown): CheckoutInvoiceDto | null {
  const row = asRecord(item);
  if (!row) return null;

  return {
    referenceNumber: toOptionalString(row.referenceNumber),
    studentName: toOptionalString(row.studentName),
    courseTitle: toOptionalString(row.courseTitle),
    currency: toOptionalString(row.currency) || "SAR",
    originalPrice: toNumber(row.originalPrice),
    discountAmount: toNumber(row.discountAmount),
    vatAmount: toNumber(row.vatAmount),
    finalPrice: toNumber(row.finalPrice),
    paymentMethod: toOptionalString(row.paymentMethod),
    paidAt: toOptionalString(row.paidAt),
  };
}

export function checkoutStepFromResult(
  result: CheckoutResultDto,
): "processing" | "success" | "failed" {
  if (result.status === CheckoutSessionStatus.Succeeded && result.enrollmentId) {
    return "success";
  }
  if (result.status === CheckoutSessionStatus.Failed) {
    return "failed";
  }
  return "processing";
}

export function checkoutStepFromSession(
  session: CheckoutSessionDto,
): "payment" | "processing" | "success" | "failed" {
  if (session.status === CheckoutSessionStatus.Succeeded) return "success";
  if (session.status === CheckoutSessionStatus.Failed) return "failed";
  if (session.status === CheckoutSessionStatus.PendingPayment) return "processing";
  return "payment";
}
