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

async function callCheckoutApi<T>(
  action: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, fallbackMessage));
  }
}

export async function createCheckoutSession(courseId: string): Promise<CheckoutSessionDto> {
  const response = await httpClient.post<unknown>({
    url: "checkout/sessions",
    params: { CourseId: courseId },
  });
  const dto = mapCheckoutSessionDto(resolveApiData(response));
  if (!dto) throw new Error("Failed to create checkout session");
  return dto;
}

export async function getCheckoutSession(sessionId: string): Promise<CheckoutSessionDto> {
  const response = await httpClient.get<unknown>({
    url: `checkout/sessions/${sessionId}`,
  });
  const dto = mapCheckoutSessionDto(resolveApiData(response));
  if (!dto) throw new Error("Checkout session not found");
  return dto;
}

export async function applyCheckoutCoupon(
  sessionId: string,
  couponCode: string,
): Promise<CheckoutSessionDto> {
  return callCheckoutApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `checkout/sessions/${sessionId}/coupon`,
      params: { CouponCode: couponCode.trim() },
    });
    const dto = mapCheckoutSessionDto(resolveApiData(response));
    if (!dto) throw new Error("Failed to apply coupon");
    return dto;
  }, "الكوبون غير صالح");
}

export async function redeemActivationCode(
  sessionId: string,
  code: string,
): Promise<CheckoutResultDto> {
  return callCheckoutApi(async () => {
    const response = await httpClient.post<unknown>({
      url: `checkout/sessions/${sessionId}/activation-code/redeem`,
      params: { Code: code.trim() },
    });
    const dto = mapCheckoutResultDto(resolveApiData(response));
    if (!dto) throw new Error("Failed to redeem activation code");
    return dto;
  }, "كود التفعيل غير صالح");
}

export async function initiateVisaPayment(sessionId: string): Promise<PaymentInitiateDto> {
  const response = await httpClient.post<unknown>({
    url: "payments/visa/initiate",
    params: { SessionId: sessionId },
  });
  const dto = mapPaymentInitiateDto(resolveApiData(response));
  if (!dto) throw new Error("Failed to initiate payment");
  return dto;
}

export async function getCheckoutResult(sessionId: string): Promise<CheckoutResultDto> {
  const response = await httpClient.get<unknown>({
    url: `checkout/sessions/${sessionId}/result`,
  });
  const dto = mapCheckoutResultDto(resolveApiData(response));
  if (!dto) throw new Error("Checkout result not found");
  return dto;
}

export async function resetCheckoutSession(sessionId: string): Promise<CheckoutSessionDto> {
  const response = await httpClient.post<unknown>({
    url: `checkout/sessions/${sessionId}/reset`,
  });
  const dto = mapCheckoutSessionDto(resolveApiData(response));
  if (!dto) throw new Error("Failed to reset checkout session");
  return dto;
}

export async function getCheckoutInvoice(sessionId: string): Promise<CheckoutInvoiceDto> {
  const response = await httpClient.get<unknown>({
    url: `checkout/sessions/${sessionId}/invoice`,
  });
  const dto = mapCheckoutInvoiceDto(resolveApiData(response));
  if (!dto) throw new Error("Invoice not available");
  return dto;
}

export async function enrollFreeCourse(courseId: string): Promise<CheckoutResultDto> {
  const response = await httpClient.post<unknown>({
    url: `student/courses/${courseId}/enroll-free`,
  });
  const dto = mapCheckoutResultDto(resolveApiData(response));
  if (!dto) throw new Error("Failed to enroll");
  return dto;
}
