import type {
  CheckoutPaymentMethod,
  CheckoutSessionStatus,
  PaymentTransactionStatus,
} from "@/modules/student/domain/enrollment/enrollment.enums";

export type CheckoutPricingDto = {
  currency: string;
  originalPrice: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
  finalPrice: number;
};

export type CheckoutSessionDto = {
  sessionId: string;
  courseId: string;
  studentId: string;
  isFreeCourse: boolean;
  status: CheckoutSessionStatus;
  selectedMethod: CheckoutPaymentMethod;
  pricing: CheckoutPricingDto;
  expiresAtUtc: string;
  failureReason: string | null;
  referenceNumber: string;
};

export type CheckoutResultDto = {
  sessionId: string;
  status: CheckoutSessionStatus;
  enrollmentId: string | null;
  message: string;
  referenceNumber: string;
};

export type PaymentInitiateDto = {
  transactionId: string;
  sessionId: string;
  providerKey: string;
  providerTransactionId: string;
  paymentUrl: string;
  status: PaymentTransactionStatus;
  failureCode: string | null;
  failureMessage: string | null;
};

export type CheckoutInvoiceDto = {
  referenceNumber: string;
  studentName: string;
  courseTitle: string;
  currency: string;
  originalPrice: number;
  discountAmount: number;
  vatAmount: number;
  finalPrice: number;
  paymentMethod: string;
  paidAt: string;
};

/** UI-facing checkout session model */
export type CheckoutSessionModel = CheckoutSessionDto;

export type CheckoutResultModel = CheckoutResultDto;
