"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Award,
  Laptop,
  MessageCircle,
  Play,
  Users,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { CourseDetailsModel } from "@/shared/domain/types/course.types";
import { cn } from "@/shared/application/lib/cn";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user/UserAvatarImageOrInitials";
import { useCourseEnrollment } from "@/modules/student/application/hooks/useCourseEnrollment";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { formatCoursePrice } from "./formatCoursePrice";
import { getCourseDetailsCtaVariant } from "./getCourseDetailsCta";

type CourseDetailsSidebarProps = {
  course: CourseDetailsModel;
};

function CourseBenefitsList() {
  const t = useTranslations("student.dashboard.courseDetails");

  const benefits = [
    { icon: Award, label: t("sidebar.benefitCertificate") },
    { icon: Laptop, label: t("sidebar.benefitAccess") },
    { icon: Users, label: t("sidebar.benefitCommunity") },
  ];

  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-[0px_4px_0px_0px_rgba(0,0,0,0.03)]">
      <h3 className="mb-4 text-base font-bold text-[#2b415e]">{t("sidebar.benefitsTitle")}</h3>
      <ul className="space-y-3">
        {benefits.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-3 text-sm text-[#64748b]">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#f1f5f9] text-[#2b415e]">
              <Icon className="size-4" aria-hidden />
            </span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PromoVideoPreview({ course }: { course: CourseDetailsModel }) {
  const t = useTranslations("student.dashboard.courseDetails");

  if (!course.promoVideoUrl && !course.coverImageUrl) return null;

  return (
    <div className="relative overflow-hidden rounded-xl">
      {course.coverImageUrl ? (
        <div className="relative aspect-video w-full">
          <Image
            src={course.coverImageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="360px"
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-[#2b415e]" />
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
        <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-[#2b415e] shadow-lg">
          <Play className="ms-0.5 size-6 fill-current" aria-hidden />
        </span>
      </div>
      <span className="sr-only">{t("sidebar.promoVideo")}</span>
    </div>
  );
}

function SidebarNotEnrolled({ course }: { course: CourseDetailsModel }) {
  const t = useTranslations("student.dashboard.courseDetails");
  const locale = useLocale();
  const ctaVariant = getCourseDetailsCtaVariant(course);
  const price = formatCoursePrice(course, locale, t("cta.enrollFree"));
  const { handleCtaClick, isPending, error } = useCourseEnrollment(course);

  return (
    <motion.aside
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="space-y-4"
    >
      <PromoVideoPreview course={course} />

      <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-[0px_4px_0px_0px_rgba(0,0,0,0.03)]">
        <div className="mb-4 space-y-1 text-right">
          <p className="text-3xl font-bold text-[#2b415e]">{price.current}</p>
          {price.hasDiscount && price.original ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="text-sm text-[#94a3b8] line-through">{price.original}</span>
              {course.discountPercent > 0 ? (
                <span className="rounded bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600">
                  {t("sidebar.discount", { value: course.discountPercent })}
                </span>
              ) : null}
            </div>
          ) : null}
          {price.hasDiscount ? (
            <p className="text-xs text-[#64748b]">{t("sidebar.discountOffer")}</p>
          ) : null}
        </div>

        {error ? <ApiFailureAlert message={error} className="mb-3" /> : null}

        <button
          type="button"
          disabled={isPending}
          onClick={() => void handleCtaClick()}
          className="w-full rounded-xl bg-[#2b415e] py-3.5 text-base font-bold text-white transition-colors hover:bg-[#243650] disabled:opacity-60"
        >
          {isPending ? t("cta.enrolling") : t(`cta.${ctaVariant}`)}
        </button>
      </div>

      <CourseBenefitsList />

      {course.chat.name ? (
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 opacity-75 shadow-[0px_4px_0px_0px_rgba(0,0,0,0.03)]">
          <h3 className="mb-2 text-base font-bold text-[#2b415e]">{course.chat.name}</h3>
          <p className="mb-4 text-sm text-[#64748b]">{t("sidebar.communityDescription")}</p>
          <button
            type="button"
            disabled
            className="w-full rounded-xl bg-[#f1f5f9] py-3 text-sm font-bold text-[#94a3b8]"
          >
            {t("sidebar.enterChatDisabled")}
          </button>
        </div>
      ) : null}
    </motion.aside>
  );
}

function SidebarEnrolled({ course }: { course: CourseDetailsModel }) {
  const t = useTranslations("student.dashboard.courseDetails");
  const teacher = course.teacher;
  const ctaVariant = getCourseDetailsCtaVariant(course);
  const { handleCtaClick } = useCourseEnrollment(course);

  return (
    <motion.aside
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="space-y-4"
    >
      {teacher ? (
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-[0px_4px_0px_0px_rgba(0,0,0,0.03)]">
          <h3 className="mb-4 text-base font-bold text-[#2b415e]">{t("sidebar.instructorTitle")}</h3>
          <div className="flex items-center gap-3">
            <UserAvatarImageOrInitials
              trackKey={`${course.id}-sidebar-teacher`}
              name={teacher.fullName}
              imageUrl={teacher.avatarUrl || null}
              size="md"
              circleClassName="!size-12"
            />
            <div className="min-w-0 text-right">
              <p className="font-bold text-[#2b415e]">{teacher.fullName}</p>
              {teacher.jobTitle ? (
                <p className="text-xs text-[#64748b]">{teacher.jobTitle}</p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            className="mt-4 w-full rounded-xl border-2 border-[#e2e8f0] bg-white py-3 text-sm font-bold text-[#2b415e] transition-colors hover:bg-[#f8fafc]"
          >
            {t("teacher.messageCta")}
          </button>
        </div>
      ) : null}

      <div className="rounded-xl bg-[#2b415e] p-5 text-white shadow-[0px_4px_0px_0px_rgba(0,0,0,0.05)]">
        <div className="mb-3 flex items-center gap-2">
          <MessageCircle className="size-5 text-[#c7af6d]" aria-hidden />
          <h3 className="text-base font-bold">{t("sidebar.communityTitle")}</h3>
        </div>
        <p className="mb-4 text-sm leading-6 text-[#b2c8eb]">{t("sidebar.communityDescription")}</p>

        {course.chat.previewParticipantAvatarUrls.length > 0 ? (
          <div className="mb-4 flex items-center justify-end">
            <div className="flex -space-x-2 space-x-reverse">
              {course.chat.previewParticipantAvatarUrls.slice(0, 3).map((url, i) => (
                <div
                  key={`${url}-${i}`}
                  className="relative size-8 overflow-hidden rounded-full border-2 border-[#2b415e]"
                >
                  <Image src={url} alt="" fill className="object-cover" sizes="32px" />
                </div>
              ))}
            </div>
            {course.chat.additionalParticipantsCount > 0 ? (
              <span className="ms-2 text-xs font-bold text-[#c7af6d]">
                +{course.chat.additionalParticipantsCount}
              </span>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          disabled={!course.chat.canEnterChat}
          className={cn(
            "w-full rounded-xl py-3 text-sm font-bold transition-colors",
            course.chat.canEnterChat
              ? "bg-[#c7af6d] text-white hover:bg-[#b9a264]"
              : "bg-white/10 text-white/50",
          )}
        >
          {t("sidebar.enterChat")}
        </button>
      </div>

      <CourseBenefitsList />

      <button
        type="button"
        onClick={() => void handleCtaClick()}
        className="w-full rounded-xl bg-[#c7af6d] py-3.5 text-base font-bold text-white drop-shadow-[0px_4px_0px_#a38f5a] transition-colors hover:bg-[#b9a264]"
      >
        {t(`cta.${ctaVariant}`)}
      </button>
    </motion.aside>
  );
}

export function CourseDetailsSidebar({ course }: CourseDetailsSidebarProps) {
  return course.isEnrolled ? (
    <SidebarEnrolled course={course} />
  ) : (
    <SidebarNotEnrolled course={course} />
  );
}
