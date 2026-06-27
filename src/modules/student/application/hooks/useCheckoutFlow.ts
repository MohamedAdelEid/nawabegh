"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { checkoutQueryKeys } from "@/modules/student/application/constants/checkoutQueryKeys";
import { invalidateEnrollmentCaches } from "@/modules/student/application/lib/invalidateEnrollmentCaches";
import type { CheckoutSessionDto } from "@/modules/student/domain/enrollment/enrollment.types";
import {
  applyCheckoutCoupon,
  createCheckoutSession,
  enrollFreeCourse,
  getCheckoutResult,
  getCheckoutSession,
  initiateVisaPayment,
  redeemActivationCode,
  resetCheckoutSession,
} from "@/modules/student/infrastructure/api/checkout.api";

type UseCheckoutSessionOptions = {
  sessionId: string;
  initial?: CheckoutSessionDto;
  enabled?: boolean;
};

export function useCheckoutSession({
  sessionId,
  initial,
  enabled = true,
}: UseCheckoutSessionOptions) {
  return useQuery({
    queryKey: checkoutQueryKeys.session(sessionId),
    queryFn: () => getCheckoutSession(sessionId),
    initialData: initial,
    enabled: Boolean(sessionId) && enabled,
    staleTime: 15_000,
  });
}

export function useCheckoutResult(sessionId: string, enabled = false) {
  return useQuery({
    queryKey: checkoutQueryKeys.result(sessionId),
    queryFn: () => getCheckoutResult(sessionId),
    enabled: Boolean(sessionId) && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 1) return 2500;
      return false;
    },
  });
}

export function useCheckoutMutations(courseId: string) {
  const queryClient = useQueryClient();
  const locale = useLocale();

  const invalidate = async () => {
    await invalidateEnrollmentCaches(queryClient, locale, courseId);
  };

  const createSession = useMutation({
    mutationFn: () => createCheckoutSession(courseId),
  });

  const enrollFree = useMutation({
    mutationFn: () => enrollFreeCourse(courseId),
    onSuccess: () => void invalidate(),
  });

  const applyCoupon = useMutation({
    mutationFn: ({ sessionId, code }: { sessionId: string; code: string }) =>
      applyCheckoutCoupon(sessionId, code),
    onSuccess: (data) => {
      queryClient.setQueryData(checkoutQueryKeys.session(data.sessionId), data);
    },
  });

  const redeemCode = useMutation({
    mutationFn: ({ sessionId, code }: { sessionId: string; code: string }) =>
      redeemActivationCode(sessionId, code),
    onSuccess: (data) => {
      queryClient.setQueryData(checkoutQueryKeys.result(data.sessionId), data);
      if (data.enrollmentId) void invalidate();
    },
  });

  const initiateVisa = useMutation({
    mutationFn: (sessionId: string) => initiateVisaPayment(sessionId),
  });

  const resetSession = useMutation({
    mutationFn: (sessionId: string) => resetCheckoutSession(sessionId),
    onSuccess: (data) => {
      queryClient.setQueryData(checkoutQueryKeys.session(data.sessionId), data);
    },
  });

  const pollResult = useMutation({
    mutationFn: (sessionId: string) => getCheckoutResult(sessionId),
    onSuccess: (data) => {
      queryClient.setQueryData(checkoutQueryKeys.result(data.sessionId), data);
      if (data.enrollmentId) void invalidate();
    },
  });

  return {
    createSession,
    enrollFree,
    applyCoupon,
    redeemCode,
    initiateVisa,
    resetSession,
    pollResult,
    invalidate,
  };
}
