"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { checkoutQueryKeys } from "@/modules/student/application/constants/checkoutQueryKeys";
import {
  useCheckoutMutations,
  useCheckoutResult,
  useCheckoutSession,
} from "@/modules/student/application/hooks/useCheckoutFlow";
import {
  useCourseDetails,
  type CourseDetailsInitialData,
} from "@/modules/student/application/hooks/useCourseDetails";
import {
  checkoutStepFromResult,
  checkoutStepFromSession,
} from "@/modules/student/domain/enrollment/enrollment.utils";
import { CheckoutSessionStatus } from "@/modules/student/domain/enrollment/enrollment.enums";
import type { CheckoutWizardStep } from "@/modules/student/domain/enrollment/enrollment.enums";
import type {
  CheckoutResultDto,
  CheckoutSessionDto,
} from "@/modules/student/domain/enrollment/enrollment.types";
import {
  DashboardBreadcrumb,
  DashboardPageHeader,
} from "@/shared/presentation/components/dashboard";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { extractApiErrorMessage } from "@/shared/infrastructure/api/apiResponse.utils";
import { getCheckoutInvoice } from "@/modules/student/infrastructure/api/checkout.api";
import { CheckoutFailed } from "./CheckoutFailed";
import { CheckoutOrderSummary } from "./CheckoutOrderSummary";
import { CheckoutPageSkeleton } from "./CheckoutSkeleton";
import {
  CheckoutPaymentPanel,
  type CheckoutPaymentMethodTab,
} from "./CheckoutPaymentPanel";
import { CheckoutProcessing } from "./CheckoutProcessing";
import { CheckoutStepper } from "./CheckoutStepper";
import { CheckoutSuccess } from "./CheckoutSuccess";

type CheckoutDashboardProps = {
  courseId?: string;
  initial?: CourseDetailsInitialData;
  initialSessionId?: string;
  initialResult?: CheckoutResultDto;
};

function resolveWizardStep(
  session: CheckoutSessionDto | undefined,
  result: CheckoutResultDto | undefined,
): CheckoutWizardStep {
  if (result) {
    const fromResult = checkoutStepFromResult(result);
    if (fromResult === "success" || fromResult === "failed") return fromResult;
    if (fromResult === "processing") return "processing";
  }
  if (!session) return "payment";
  if (session.status === CheckoutSessionStatus.Expired) return "failed";
  return checkoutStepFromSession(session);
}

export function CheckoutDashboard({
  courseId,
  initial,
  initialSessionId,
  initialResult,
}: CheckoutDashboardProps) {
  const t = useTranslations("student.dashboard.checkout");
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState(initialSessionId ?? "");
  const [activeTab, setActiveTab] = useState<CheckoutPaymentMethodTab>("visa");
  const [panelError, setPanelError] = useState<string | null>(null);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);

  const sessionQuery = useCheckoutSession({
    sessionId,
    enabled: Boolean(sessionId),
  });

  const session = sessionQuery.data;
  const effectiveCourseId = courseId || session?.courseId || "";
  const mutations = useCheckoutMutations(effectiveCourseId);
  const courseQuery = useCourseDetails({
    courseId: effectiveCourseId,
    initial,
    enabled: Boolean(effectiveCourseId),
  });

  useEffect(() => {
    if (initialSessionId || sessionId || !effectiveCourseId || mutations.createSession.isPending) {
      return;
    }
    mutations.createSession.mutate(undefined, {
      onSuccess: (created) => setSessionId(created.sessionId),
    });
  }, [initialSessionId, sessionId, effectiveCourseId, mutations.createSession]);
  const shouldPollResult =
    session?.status === CheckoutSessionStatus.PendingPayment ||
    session?.status === CheckoutSessionStatus.Succeeded ||
    session?.status === CheckoutSessionStatus.Failed;

  const resultQuery = useCheckoutResult(sessionId, Boolean(sessionId) && shouldPollResult);

  const result = initialResult ?? resultQuery.data ?? mutations.redeemCode.data ?? null;

  const { invalidate: invalidateCaches } = mutations;

  useEffect(() => {
    if (result?.enrollmentId) {
      void invalidateCaches();
    }
  }, [result?.enrollmentId, invalidateCaches]);
  const wizardStep = useMemo(
    () => resolveWizardStep(session, result ?? undefined),
    [session, result],
  );

  const stepperIndex = useMemo(() => {
    if (wizardStep === "payment") return 1 as const;
    if (wizardStep === "processing") return 2 as const;
    if (wizardStep === "success") return 4 as const;
    return 3 as const;
  }, [wizardStep]);

  const course = courseQuery.data;
  const sessionError =
    mutations.createSession.error instanceof Error
      ? mutations.createSession.error.message
      : sessionQuery.error instanceof Error
        ? sessionQuery.error.message
        : null;

  const handleApplyCoupon = async (code: string) => {
    if (!sessionId) return;
    setPanelError(null);
    try {
      await mutations.applyCoupon.mutateAsync({ sessionId, code });
    } catch (err) {
      setPanelError(extractApiErrorMessage(err, t("errors.coupon")));
    }
  };

  const handleInitiateVisa = async () => {
    if (!sessionId) return;
    setPanelError(null);
    try {
      const payment = await mutations.initiateVisa.mutateAsync(sessionId);
      window.location.href = payment.paymentUrl;
    } catch (err) {
      setPanelError(extractApiErrorMessage(err, t("errors.generic")));
    }
  };

  const handleRedeemCode = async (code: string) => {
    if (!sessionId) return;
    setPanelError(null);
    try {
      await mutations.redeemCode.mutateAsync({ sessionId, code });
    } catch (err) {
      setPanelError(extractApiErrorMessage(err, t("errors.activationCode")));
    }
  };

  const handleRetry = async () => {
    if (!sessionId) return;
    setPanelError(null);
    try {
      await mutations.resetSession.mutateAsync(sessionId);
      queryClient.removeQueries({ queryKey: checkoutQueryKeys.result(sessionId) });
      mutations.redeemCode.reset();
      await sessionQuery.refetch();
    } catch (err) {
      setPanelError(extractApiErrorMessage(err, t("errors.generic")));
    }
  };

  const handleDownloadInvoice = async () => {
    if (!sessionId) return;
    setIsDownloadingInvoice(true);
    try {
      const invoice = await getCheckoutInvoice(sessionId);
      const blob = new Blob([JSON.stringify(invoice, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `invoice-${invoice.referenceNumber || sessionId}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setPanelError(t("errors.invoice"));
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  if (
    (sessionQuery.isLoading && initialSessionId && !session) ||
    (courseQuery.isLoading && !course) ||
    (mutations.createSession.isPending && !sessionId && !initialSessionId)
  ) {
    return <CheckoutPageSkeleton />;
  }

  if (!course) {
    return (
      <div className="space-y-4">
        <ApiFailureAlert message={courseQuery.error instanceof Error ? courseQuery.error.message : null} />
        <Button type="button" variant="outline" onClick={() => void courseQuery.refetch()}>
          {t("errors.retry")}
        </Button>
      </div>
    );
  }

  if (sessionError && !session) {
    return (
      <div className="space-y-4">
        <ApiFailureAlert message={sessionError} fallbackMessage={t("errors.session")} />
        <Button
          type="button"
          variant="outline"
          onClick={() => mutations.createSession.mutate(undefined, {
            onSuccess: (s) => setSessionId(s.sessionId),
          })}
        >
          {t("errors.retry")}
        </Button>
      </div>
    );
  }

  if (!session) {
    return <CheckoutPageSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <DashboardBreadcrumb
          items={[
            { label: t("breadcrumb.home"), href: ROUTES.USER.STUDENT.HOME },
            { label: t("breadcrumb.courses"), href: ROUTES.USER.STUDENT.COURSES },
            { label: course.title, href: ROUTES.USER.STUDENT.COURSE_DETAIL(effectiveCourseId) },
            { label: t("breadcrumb.checkout") },
          ]}
        />
        <DashboardPageHeader title={t("page.title")} description={t("page.description")} />
      </div>

      {wizardStep !== "success" && wizardStep !== "failed" ? (
        <CheckoutStepper currentStep={stepperIndex} />
      ) : null}

      <AnimatePresence mode="wait">
        <motion.div
          key={wizardStep}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.3 }}
        >
          {wizardStep === "payment" ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
              <CheckoutPaymentPanel
                session={session}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onApplyCoupon={handleApplyCoupon}
                onInitiateVisa={handleInitiateVisa}
                onRedeemCode={handleRedeemCode}
                isApplyingCoupon={mutations.applyCoupon.isPending}
                isInitiatingVisa={mutations.initiateVisa.isPending}
                isRedeemingCode={mutations.redeemCode.isPending}
                errorMessage={panelError}
              />
              <CheckoutOrderSummary
                course={course}
                session={session}
                variant={activeTab === "activation" ? "activation" : "default"}
              />
            </div>
          ) : null}

          {wizardStep === "processing" ? (
            <CheckoutProcessing course={course} session={session} />
          ) : null}

          {wizardStep === "success" && result ? (
            <CheckoutSuccess
              course={course}
              result={result}
              onDownloadInvoice={handleDownloadInvoice}
              isDownloadingInvoice={isDownloadingInvoice}
            />
          ) : null}

          {wizardStep === "failed" && result ? (
            <CheckoutFailed
              course={course}
              session={session}
              result={result}
              onRetry={() => void handleRetry()}
              onChangeMethod={() => void handleRetry()}
              isRetrying={mutations.resetSession.isPending}
            />
          ) : null}

          {wizardStep === "failed" && !result ? (
            <CheckoutFailed
              course={course}
              session={session}
              result={{
                sessionId,
                status: CheckoutSessionStatus.Failed,
                enrollmentId: null,
                message: session.failureReason || t("errors.generic"),
                referenceNumber: session.referenceNumber,
              }}
              onRetry={() => void handleRetry()}
              onChangeMethod={() => void handleRetry()}
              isRetrying={mutations.resetSession.isPending}
            />
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
