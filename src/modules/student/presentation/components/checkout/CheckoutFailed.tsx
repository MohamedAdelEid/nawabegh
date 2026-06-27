"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, CreditCard, RefreshCw, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CheckoutResultDto } from "@/modules/student/domain/enrollment/enrollment.types";
import type { CourseDetailsModel } from "@/shared/domain/types/course.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { CheckoutOrderSummary } from "./CheckoutOrderSummary";
import type { CheckoutSessionDto } from "@/modules/student/domain/enrollment/enrollment.types";
import { Button } from "@/shared/presentation/components/ui/button";

type CheckoutFailedProps = {
  course: CourseDetailsModel;
  session: CheckoutSessionDto;
  result: CheckoutResultDto;
  onRetry: () => void;
  onChangeMethod: () => void;
  isRetrying?: boolean;
};

export function CheckoutFailed({
  course,
  session,
  result,
  onRetry,
  onChangeMethod,
  isRetrying = false,
}: CheckoutFailedProps) {
  const t = useTranslations("student.dashboard.checkout.failed");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="rounded-[20px] bg-rose-50 px-6 py-8 text-center">
        <span className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-rose-500 text-white">
          <AlertCircle className="size-8" aria-hidden />
        </span>
        <h2 className="mb-2 text-2xl font-bold text-rose-700">{t("title")}</h2>
        <p className="mx-auto max-w-lg text-sm leading-6 text-rose-600/80">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-[20px] border border-[#e2e8f0] bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#2b415e]">
            <AlertCircle className="size-5 text-rose-500" aria-hidden />
            {t("errorDetails")}
          </h3>

          <div className="mb-4 rounded-xl border border-[#fecaca] bg-rose-50/50 p-4">
            <p className="font-bold text-[#2b415e]">{t("cardRejected")}</p>
            <p className="mt-1 text-sm text-[#64748b]">
              {result.message || session.failureReason || t("cardRejectedDesc")}
            </p>
          </div>

          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 size-5 shrink-0 text-blue-600" aria-hidden />
              <div>
                <p className="font-bold text-[#2b415e]">{t("securityTitle")}</p>
                <p className="mt-1 text-sm text-[#64748b]">{t("securityDesc")}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              type="button"
              disabled={isRetrying}
              onClick={onRetry}
              className="h-12 rounded-xl bg-[#2b415e] font-bold text-white hover:bg-[#243650]"
            >
              <RefreshCw className="size-4" aria-hidden />
              {isRetrying ? t("retrying") : t("retryPayment")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onChangeMethod}
              className="h-12 rounded-xl border-2 border-[#c7af6d] bg-[#c7af6d]/10 font-bold text-[#2b415e]"
            >
              <CreditCard className="size-4" aria-hidden />
              {t("changeMethod")}
            </Button>
            <Link
              href={ROUTES.USER.STUDENT.COURSES}
              className="text-center text-sm font-medium text-[#64748b] hover:text-[#2b415e]"
            >
              {t("backToCourses")}
            </Link>
          </div>
        </section>

        <CheckoutOrderSummary course={course} session={session} />
      </div>
    </motion.div>
  );
}
