"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parentCheckoutQueryKeys } from "@/modules/parent/application/constants/parentCheckoutQueryKeys";
import { invalidateParentEnrollmentCaches } from "@/modules/parent/application/lib/invalidateParentEnrollmentCaches";
import {
  applyParentCheckoutCoupon,
  createParentCheckoutSession,
  getParentCheckoutResult,
  getParentCheckoutSession,
  initiateParentVisaPayment,
  redeemParentActivationCode,
  resetParentCheckoutSession,
} from "@/modules/parent/infrastructure/api/parentPaymentsApi";
import type { CheckoutSessionDto } from "@/modules/student/domain/enrollment/enrollment.types";

type UseParentCheckoutSessionOptions = {
  sessionId: string;
  initial?: CheckoutSessionDto;
  enabled?: boolean;
};

export function useParentCheckoutSession({
  sessionId,
  initial,
  enabled = true,
}: UseParentCheckoutSessionOptions) {
  return useQuery({
    queryKey: parentCheckoutQueryKeys.session(sessionId),
    queryFn: () => getParentCheckoutSession(sessionId),
    initialData: initial,
    enabled: Boolean(sessionId) && enabled,
    staleTime: 15_000,
  });
}

export function useParentCheckoutResult(sessionId: string, enabled = false) {
  return useQuery({
    queryKey: parentCheckoutQueryKeys.result(sessionId),
    queryFn: () => getParentCheckoutResult(sessionId),
    enabled: Boolean(sessionId) && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 1) return 2500;
      return false;
    },
  });
}

type UseParentCheckoutMutationsParams = {
  studentUserId: string;
  courseId?: string;
  bundleId?: string;
};

export function useParentCheckoutMutations({
  studentUserId,
  courseId,
  bundleId,
}: UseParentCheckoutMutationsParams) {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    if (!studentUserId) return;
    await invalidateParentEnrollmentCaches(queryClient, studentUserId);
  };

  const createSession = useMutation({
    mutationFn: () =>
      createParentCheckoutSession({ studentUserId, courseId, bundleId }),
  });

  const applyCoupon = useMutation({
    mutationFn: ({ sessionId, code }: { sessionId: string; code: string }) =>
      applyParentCheckoutCoupon(sessionId, code),
    onSuccess: (data) => {
      queryClient.setQueryData(parentCheckoutQueryKeys.session(data.sessionId), data);
    },
  });

  const redeemCode = useMutation({
    mutationFn: ({ sessionId, code }: { sessionId: string; code: string }) =>
      redeemParentActivationCode(sessionId, code),
    onSuccess: (data) => {
      queryClient.setQueryData(parentCheckoutQueryKeys.result(data.sessionId), data);
      if (data.enrollmentId) void invalidate();
    },
  });

  const initiateVisa = useMutation({
    mutationFn: (sessionId: string) => initiateParentVisaPayment(sessionId),
  });

  const resetSession = useMutation({
    mutationFn: (sessionId: string) => resetParentCheckoutSession(sessionId),
    onSuccess: (data) => {
      queryClient.setQueryData(parentCheckoutQueryKeys.session(data.sessionId), data);
    },
  });

  const pollResult = useMutation({
    mutationFn: (sessionId: string) => getParentCheckoutResult(sessionId),
    onSuccess: (data) => {
      queryClient.setQueryData(parentCheckoutQueryKeys.result(data.sessionId), data);
      if (data.enrollmentId) void invalidate();
    },
  });

  return {
    createSession,
    applyCoupon,
    redeemCode,
    initiateVisa,
    resetSession,
    pollResult,
    invalidate,
  };
}
