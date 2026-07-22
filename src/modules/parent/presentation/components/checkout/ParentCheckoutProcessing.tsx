"use client";

import { motion } from "framer-motion";
import { Clock, Headphones, Landmark, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ParentCourseSummary } from "@/modules/parent/domain/types/parentLearning.types";
import type { CheckoutSessionDto } from "@/modules/student/domain/enrollment/enrollment.types";
import { ParentCheckoutOrderSummary } from "./ParentCheckoutOrderSummary";
import { ParentCheckoutStepper } from "./ParentCheckoutStepper";

type ParentCheckoutProcessingProps = {
  course: ParentCourseSummary;
  session: CheckoutSessionDto;
  childName?: string | null;
};

export function ParentCheckoutProcessing({
  course,
  session,
  childName,
}: ParentCheckoutProcessingProps) {
  const t = useTranslations("parent.dashboard.checkout.processing");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <ParentCheckoutStepper currentStep={2} />

      <div className="mx-auto max-w-lg text-center">
        <span className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full border-2 border-dashed border-[#cbd5e1] bg-[#f8fafc]">
          <Loader2 className="size-8 animate-spin text-[#1e88e5]" aria-hidden />
        </span>
        <h2 className="mb-2 text-2xl font-bold text-[#2b415e]">{t("title")}</h2>
        <p className="text-sm leading-6 text-[#64748b]">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="rounded-[20px] bg-gradient-to-br from-[#1e293b] to-[#334155] p-6 text-white shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-lg font-bold italic">VISA</span>
              <Landmark className="size-6 text-[#1e88e5]" aria-hidden />
            </div>
            <p className="mb-6 font-mono text-lg tracking-widest">**** **** **** ****</p>
            <div className="flex items-end justify-between text-xs text-white/70">
              <span>{t("cardHolder")}</span>
              <span>MM/YY</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-[#e2e8f0] bg-white p-4 text-sm text-[#64748b]">
              <Clock className="size-5 shrink-0 text-[#1e88e5]" aria-hidden />
              {t("processingTime")}
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-[#e2e8f0] bg-white p-4 text-sm text-[#64748b]">
              <Headphones className="size-5 shrink-0 text-[#1e88e5]" aria-hidden />
              {t("support")}
            </div>
          </div>
        </div>

        <ParentCheckoutOrderSummary course={course} session={session} childName={childName} />
      </div>
    </motion.div>
  );
}
