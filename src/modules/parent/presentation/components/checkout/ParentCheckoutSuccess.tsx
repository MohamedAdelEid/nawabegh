"use client";

import Link from "next/link";
import { CheckCircle2, Download, FileText, MessageCircle, Rocket, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { ParentCourseSummary } from "@/modules/parent/domain/types/parentLearning.types";
import { ParentAvatar } from "@/modules/parent/presentation/components/home/ParentAvatar";
import type { CheckoutResultDto } from "@/modules/student/domain/enrollment/enrollment.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";

type ParentCheckoutSuccessProps = {
  course: ParentCourseSummary;
  result: CheckoutResultDto;
  studentUserId: string;
  childName?: string | null;
  onDownloadInvoice?: () => void;
  isDownloadingInvoice?: boolean;
};

export function ParentCheckoutSuccess({
  course,
  result,
  studentUserId,
  childName,
  onDownloadInvoice,
  isDownloadingInvoice = false,
}: ParentCheckoutSuccessProps) {
  const t = useTranslations("parent.dashboard.checkout.success");

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="relative overflow-hidden rounded-[20px] bg-[#2b415e] px-6 py-10 text-center text-white md:px-10">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-500"
        >
          <CheckCircle2 className="size-8 text-white" aria-hidden />
        </motion.span>
        <h2 className="mb-2 text-2xl font-bold md:text-3xl">{t("title")}</h2>
        <p className="mx-auto max-w-xl text-sm leading-6 text-[#b2c8eb]">
          {childName ? t("subtitleForChild", { name: childName }) : result.message || t("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <span className="mb-3 inline-block rounded-full bg-[#1e88e5]/10 px-3 py-1 text-xs font-bold text-[#2b415e]">
            {t("currentCourse")}
          </span>
          <h3 className="mb-2 text-lg font-bold text-[#2b415e]">{course.title}</h3>
          {course.description ? (
            <p className="mb-4 line-clamp-2 text-sm text-[#64748b]">{course.description}</p>
          ) : null}
        </article>

        {course.instructorName ? (
          <article className="flex items-center gap-4 rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
            <ParentAvatar url={course.instructorImageUrl} name={course.instructorName} className="size-12" />
            <div>
              <p className="text-xs text-[#64748b]">{t("teacherLabel")}</p>
              <p className="font-bold text-[#2b415e]">{course.instructorName}</p>
            </div>
          </article>
        ) : null}
      </div>

      {result.referenceNumber ? (
        <div className="flex flex-col gap-3 rounded-xl border border-[#e2e8f0] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#64748b]">
            <FileText className="size-4" aria-hidden />
            {t("reference", { value: result.referenceNumber })}
          </span>
          {onDownloadInvoice ? (
            <button
              type="button"
              disabled={isDownloadingInvoice}
              onClick={onDownloadInvoice}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#2b415e] hover:underline"
            >
              <Download className="size-4" aria-hidden />
              {t("downloadInvoice")}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
        <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-[#2b415e]">
          <Users className="size-4 text-[#1e88e5]" aria-hidden />
          {t("benefitsTitle")}
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-[#f8fafc] p-4">
            <FileText className="mb-2 size-5 text-[#1e88e5]" aria-hidden />
            <p className="text-sm font-bold text-[#2b415e]">{t("benefitContent")}</p>
            <p className="mt-1 text-xs text-[#64748b]">{t("benefitContentDesc")}</p>
          </div>
          <div className="rounded-lg bg-[#f8fafc] p-4">
            <MessageCircle className="mb-2 size-5 text-[#1e88e5]" aria-hidden />
            <p className="text-sm font-bold text-[#2b415e]">{t("benefitCommunity")}</p>
            <p className="mt-1 text-xs text-[#64748b]">{t("benefitCommunityDesc")}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild className="h-12 rounded-xl bg-[#1e88e5] px-8 font-bold text-white hover:bg-[#1976d2]">
          <Link href={ROUTES.USER.PARENT.CHILD_COURSE_JOURNEY(studentUserId, course.courseId)}>
            <Rocket className="size-4" aria-hidden />
            {t("startLearning")}
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12 rounded-xl border-2 border-[#e2e8f0] px-8 font-bold">
          <Link href={ROUTES.USER.PARENT.CHILD_COURSES(studentUserId)}>{t("myDashboard")}</Link>
        </Button>
      </div>

      <p className="text-center text-xs text-[#94a3b8]">{t("support")}</p>
    </motion.div>
  );
}
