"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { parentCheckoutQueryKeys } from "@/modules/parent/application/constants/parentCheckoutQueryKeys";
import {
  useParentCheckoutMutations,
  useParentCheckoutResult,
  useParentCheckoutSession,
} from "@/modules/parent/application/hooks/useParentCheckout";
import { useParentChildren } from "@/modules/parent/application/hooks/useParentChildren";
import { useParentCourseSummary } from "@/modules/parent/application/hooks/useParentLearning";
import type { ParentCourseSummary } from "@/modules/parent/domain/types/parentLearning.types";
import { getParentCheckoutInvoice } from "@/modules/parent/infrastructure/api/parentPaymentsApi";
import { CheckoutSessionStatus } from "@/modules/student/domain/enrollment/enrollment.enums";
import type { CheckoutWizardStep } from "@/modules/student/domain/enrollment/enrollment.enums";
import {
  checkoutStepFromResult,
  checkoutStepFromSession,
} from "@/modules/student/domain/enrollment/enrollment.utils";
import type {
  CheckoutResultDto,
  CheckoutSessionDto,
} from "@/modules/student/domain/enrollment/enrollment.types";
import { extractApiErrorMessage } from "@/shared/infrastructure/api/apiResponse.utils";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { ParentCheckoutFailed } from "./ParentCheckoutFailed";
import { ParentCheckoutOrderSummary } from "./ParentCheckoutOrderSummary";
import {
  ParentCheckoutPaymentPanel,
  type ParentCheckoutPaymentMethodTab,
} from "./ParentCheckoutPaymentPanel";
import { ParentCheckoutProcessing } from "./ParentCheckoutProcessing";
import { ParentCheckoutPageSkeleton } from "./ParentCheckoutSkeleton";
import { ParentCheckoutStepper } from "./ParentCheckoutStepper";
import { ParentCheckoutSuccess } from "./ParentCheckoutSuccess";

type ParentCheckoutDashboardProps = {
  courseId?: string;
  studentUserId?: string;
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

function fallbackCourseSummary(session: CheckoutSessionDto): ParentCourseSummary {
  return {
    courseId: session.courseId,
    title: "",
    description: null,
    coverImageUrl: null,
    subjectName: null,
    gradeName: null,
    instructorName: null,
    instructorImageUrl: null,
    lessonsCount: 0,
    completedLessonsCount: 0,
    progressPercent: 0,
    isEnrolledForChild: false,
    enrollmentStatus: null,
    actionLabelAr: null,
    originalPrice: session.pricing.originalPrice,
    discountedPrice: session.pricing.finalPrice,
    currency: session.pricing.currency,
  };
}

export function ParentCheckoutDashboard({
  courseId,
  studentUserId,
  initialSessionId,
  initialResult,
}: ParentCheckoutDashboardProps) {
  const t = useTranslations("parent.dashboard.checkout");
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState(initialSessionId ?? "");
  const [activeTab, setActiveTab] = useState<ParentCheckoutPaymentMethodTab>("visa");
  const [panelError, setPanelError] = useState<string | null>(null);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);

  const sessionQuery = useParentCheckoutSession({
    sessionId,
    enabled: Boolean(sessionId),
  });

  const session = sessionQuery.data;
  const effectiveCourseId = courseId || session?.courseId || "";
  const effectiveStudentUserId = studentUserId || session?.studentId || "";

  const mutations = useParentCheckoutMutations({
    studentUserId: effectiveStudentUserId,
    courseId: effectiveCourseId,
  });

  const courseSummaryQuery = useParentCourseSummary(effectiveStudentUserId, effectiveCourseId);
  const childrenQuery = useParentChildren();
  const childName =
    childrenQuery.data?.find((child) => child.studentUserId === effectiveStudentUserId)
      ?.fullName ?? null;

  useEffect(() => {
    if (
      initialSessionId ||
      sessionId ||
      !effectiveCourseId ||
      !effectiveStudentUserId ||
      mutations.createSession.isPending
    ) {
      return;
    }
    mutations.createSession.mutate(undefined, {
      onSuccess: (created) => setSessionId(created.sessionId),
    });
  }, [
    initialSessionId,
    sessionId,
    effectiveCourseId,
    effectiveStudentUserId,
    mutations.createSession,
  ]);

  const shouldPollResult =
    session?.status === CheckoutSessionStatus.PendingPayment ||
    session?.status === CheckoutSessionStatus.Succeeded ||
    session?.status === CheckoutSessionStatus.Failed;

  const resultQuery = useParentCheckoutResult(sessionId, Boolean(sessionId) && shouldPollResult);

  const result = initialResult ?? resultQuery.data ?? mutations.redeemCode.data ?? null;

  const { invalidate: invalidateCaches } = mutations;

  useEffect(() => {
    if (result?.enrollmentId) {
      void invalidateCaches();
    }
  }, [result?.enrollmentId, invalidateCaches]);

  const wizardStep = useMemo(() => resolveWizardStep(session, result ?? undefined), [session, result]);

  const stepperIndex = useMemo(() => {
    if (wizardStep === "payment") return 1 as const;
    if (wizardStep === "processing") return 2 as const;
    if (wizardStep === "success") return 4 as const;
    return 3 as const;
  }, [wizardStep]);

  const course = courseSummaryQuery.data ?? (session ? fallbackCourseSummary(session) : null);

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
      queryClient.removeQueries({ queryKey: parentCheckoutQueryKeys.result(sessionId) });
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
      const invoice = await getParentCheckoutInvoice(sessionId);
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

  if (!effectiveStudentUserId && !initialSessionId) {
    return (
      <div className="space-y-4 rounded-[20px] border border-[#e2e8f0] bg-white p-8 text-center">
        <p className="text-[#64748b]">{t("errors.missingChild")}</p>
        <Button asChild className="mx-auto h-11 rounded-xl bg-[#1e88e5] font-bold text-white hover:bg-[#1976d2]">
          <Link href={ROUTES.USER.PARENT.CHILDREN}>{t("errors.backToChildren")}</Link>
        </Button>
      </div>
    );
  }

  if (
    (sessionQuery.isLoading && initialSessionId && !session) ||
    (mutations.createSession.isPending && !sessionId && !initialSessionId)
  ) {
    return <ParentCheckoutPageSkeleton />;
  }

  if (sessionError && !session) {
    return (
      <div className="space-y-4">
        <ApiFailureAlert message={sessionError} fallbackMessage={t("errors.session")} />
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            mutations.createSession.mutate(undefined, {
              onSuccess: (s) => setSessionId(s.sessionId),
            })
          }
        >
          {t("errors.retry")}
        </Button>
      </div>
    );
  }

  if (!session || !course) {
    return <ParentCheckoutPageSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-end">
        <nav className="flex items-center justify-end gap-2 text-sm text-[#94a3b8]">
          <span>{t("breadcrumb.checkout")}</span>
          <span>/</span>
          <Link href={ROUTES.USER.PARENT.COURSES_CATALOG} className="hover:text-[#2b415e]">
            {t("breadcrumb.courses")}
          </Link>
          <span>/</span>
          <Link href={ROUTES.USER.PARENT.HOME} className="hover:text-[#2b415e]">
            {t("breadcrumb.home")}
          </Link>
        </nav>
        <h1 className="text-2xl font-bold text-[#2b415e] md:text-3xl">{t("page.title")}</h1>
        <p className="text-sm text-[#64748b]">{t("page.description")}</p>
      </div>

      {wizardStep !== "success" && wizardStep !== "failed" ? (
        <ParentCheckoutStepper currentStep={stepperIndex} />
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
              <ParentCheckoutPaymentPanel
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
              <ParentCheckoutOrderSummary
                course={course}
                session={session}
                childName={childName}
                variant={activeTab === "activation" ? "activation" : "default"}
              />
            </div>
          ) : null}

          {wizardStep === "processing" ? (
            <ParentCheckoutProcessing course={course} session={session} childName={childName} />
          ) : null}

          {wizardStep === "success" && result ? (
            <ParentCheckoutSuccess
              course={course}
              result={result}
              studentUserId={effectiveStudentUserId}
              childName={childName}
              onDownloadInvoice={handleDownloadInvoice}
              isDownloadingInvoice={isDownloadingInvoice}
            />
          ) : null}

          {wizardStep === "failed" ? (
            <ParentCheckoutFailed
              course={course}
              session={session}
              childName={childName}
              result={
                result ?? {
                  sessionId,
                  status: CheckoutSessionStatus.Failed,
                  enrollmentId: null,
                  message: session.failureReason || t("errors.generic"),
                  referenceNumber: session.referenceNumber,
                }
              }
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
