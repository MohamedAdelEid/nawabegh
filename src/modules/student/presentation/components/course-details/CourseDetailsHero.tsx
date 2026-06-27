"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Play, Star, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { CourseDetailsModel } from "@/shared/domain/types/course.types";
import { cn } from "@/shared/application/lib/cn";
import { useCourseEnrollment } from "@/modules/student/application/hooks/useCourseEnrollment";
import { getCourseDetailsCtaVariant } from "./getCourseDetailsCta";

type CourseDetailsHeroProps = {
  course: CourseDetailsModel;
};

export function CourseDetailsHero({ course }: CourseDetailsHeroProps) {
  const t = useTranslations("student.dashboard.courseDetails");
  const tExplore = useTranslations("student.dashboard.exploreCourses");
  const locale = useLocale();
  const numberFormatter = new Intl.NumberFormat(locale.startsWith("ar") ? "ar" : "en-US");
  const ctaVariant = getCourseDetailsCtaVariant(course);
  const { handleCtaClick } = useCourseEnrollment(course);

  if (course.isEnrolled) {
    const nextTitle = course.nextStation?.name ?? course.nextLearningPath?.title ?? "";

    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="overflow-hidden rounded-[20px] bg-[#2b415e] p-6 text-white shadow-[0px_8px_0px_0px_rgba(0,0,0,0.05)] md:p-8"
      >
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
          <CheckCircle2 className="size-3.5 text-[#c7af6d]" aria-hidden />
          {t("hero.enrolledBadge")}
        </span>

        <h2 className="mb-2 text-2xl font-bold leading-9 md:text-3xl">{t("hero.welcomeTitle")}</h2>
        <p className="mb-6 max-w-2xl text-sm leading-6 text-[#b2c8eb]">{t("hero.welcomeSubtitle")}</p>

        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>{t("hero.progressLabel")}</span>
            <span>{t("hero.progressValue", { value: course.progressPercentage })}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-[#c7af6d] shadow-[0px_0px_10px_0px_rgba(199,175,109,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, course.progressPercentage)}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => void handleCtaClick()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c7af6d] px-6 py-3 text-base font-bold text-white drop-shadow-[0px_4px_0px_#a38f5a] transition-colors hover:bg-[#b9a264]"
          >
            <Play className="size-4 fill-current" aria-hidden />
            {t(`cta.${ctaVariant}`)}
          </button>
          {nextTitle ? (
            <p className="text-sm text-[#dfdfdf]">
              {course.nextStation
                ? t("hero.nextLesson", { title: nextTitle })
                : t("hero.nextPath", { title: nextTitle })}
            </p>
          ) : null}
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="overflow-hidden rounded-[20px] bg-[#2b415e] shadow-[0px_8px_0px_0px_rgba(0,0,0,0.05)]"
    >
      <div className="flex flex-col md:flex-row md:items-stretch">
        <div className="flex flex-1 flex-col justify-between gap-6 p-6 text-white md:p-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {course.subjectName ? (
                <span className="rounded-full bg-[#c7af6d] px-3 py-1 text-xs font-bold text-[#141c27]">
                  {course.subjectName}
                </span>
              ) : null}
              {course.isBestSeller ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                  <Star className="size-3 fill-[#c7af6d] text-[#c7af6d]" aria-hidden />
                  {tExplore("card.bestSeller")}
                </span>
              ) : null}
            </div>

            <h2 className="text-2xl font-bold leading-9 md:text-3xl">{course.title}</h2>
            {course.description ? (
              <p className="max-w-2xl text-sm leading-6 text-[#b2c8eb]">{course.description}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-[#dfdfdf]">
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4 text-[#c7af6d]" aria-hidden />
              {t("hero.students", {
                count: numberFormatter.format(course.enrolledStudentsCount),
              })}
            </span>
            {/* TODO: duration — wire when API exposes duration field */}
            {/* <span className="inline-flex items-center gap-1.5 opacity-60" title={t("hero.durationPlaceholder")}>
              <Clock className="size-4" aria-hidden />
              {course.durationLabel ?? t("hero.durationPlaceholder")}
            </span> */}
            {/* TODO: rating — wire when API exposes rating field */}
            {/* <span className="inline-flex items-center gap-1.5 opacity-60" title={t("hero.ratingPlaceholder")}>
              <Star className="size-4" aria-hidden />
              {course.ratingLabel ?? t("hero.ratingPlaceholder")}
            </span> */}
          </div>
        </div>

        {/* {course.coverImageUrl ? (
          <div className="relative h-48 w-full shrink-0 md:h-auto md:w-[320px]">
            <Image
              src={course.coverImageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 320px"
              priority
            />
          </div>
        ) : null} */}
      </div>
    </motion.section>
  );
}
