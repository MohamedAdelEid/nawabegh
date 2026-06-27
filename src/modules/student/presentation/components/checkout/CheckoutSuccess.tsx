"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Download, FileText, Rocket, Star, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CheckoutResultDto } from "@/modules/student/domain/enrollment/enrollment.types";
import type { CourseDetailsModel } from "@/shared/domain/types/course.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user/UserAvatarImageOrInitials";
import { Button } from "@/shared/presentation/components/ui/button";

type CheckoutSuccessProps = {
  course: CourseDetailsModel;
  result: CheckoutResultDto;
  onDownloadInvoice?: () => void;
  isDownloadingInvoice?: boolean;
};

export function CheckoutSuccess({
  course,
  result,
  onDownloadInvoice,
  isDownloadingInvoice = false,
}: CheckoutSuccessProps) {
  const t = useTranslations("student.dashboard.checkout.success");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
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
          {result.message || t("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <span className="mb-3 inline-block rounded-full bg-[#c7af6d]/20 px-3 py-1 text-xs font-bold text-[#2b415e]">
            {t("currentCourse")}
          </span>
          <h3 className="mb-2 text-lg font-bold text-[#2b415e]">{course.title}</h3>
          <p className="mb-4 text-sm text-[#64748b]">{course.description}</p>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-[#64748b]">
              <span>{t("progress", { value: course.progressPercentage })}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#f1f5f9]">
              <div
                className="h-full rounded-full bg-[#c7af6d]"
                style={{ width: `${course.progressPercentage}%` }}
              />
            </div>
          </div>
        </article>

        {course.teacher ? (
          <article className="flex items-center gap-4 rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
            <UserAvatarImageOrInitials
              trackKey={`success-teacher-${course.id}`}
              name={course.teacher.fullName}
              imageUrl={course.teacher.avatarUrl || null}
              size="md"
            />
            <div>
              <p className="text-xs text-[#64748b]">{t("teacherLabel")}</p>
              <p className="font-bold text-[#2b415e]">{course.teacher.fullName}</p>
              <div className="mt-1 flex items-center gap-0.5 text-[#c7af6d]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3 fill-current" aria-hidden />
                ))}
              </div>
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
          <Star className="size-4 fill-[#c7af6d] text-[#c7af6d]" aria-hidden />
          {t("benefitsTitle")}
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-[#f8fafc] p-4">
            <FileText className="mb-2 size-5 text-[#c7af6d]" aria-hidden />
            <p className="text-sm font-bold text-[#2b415e]">{t("benefitContent")}</p>
            <p className="mt-1 text-xs text-[#64748b]">{t("benefitContentDesc")}</p>
          </div>
          <div className="rounded-lg bg-[#f8fafc] p-4">
            <Users className="mb-2 size-5 text-[#c7af6d]" aria-hidden />
            <p className="text-sm font-bold text-[#2b415e]">{t("benefitCommunity")}</p>
            <p className="mt-1 text-xs text-[#64748b]">{t("benefitCommunityDesc")}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          asChild
          className="h-12 rounded-xl bg-[#c7af6d] px-8 font-bold text-white hover:bg-[#b9a264]"
        >
          <Link href={ROUTES.USER.STUDENT.COURSE_DETAIL(course.id)}>
            <Rocket className="size-4" aria-hidden />
            {t("startLearning")}
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-12 rounded-xl border-2 border-[#e2e8f0] px-8 font-bold"
        >
          <Link href={ROUTES.USER.STUDENT.HOME}>{t("myDashboard")}</Link>
        </Button>
      </div>

      <p className="text-center text-xs text-[#94a3b8]">{t("support")}</p>
    </motion.div>
  );
}
