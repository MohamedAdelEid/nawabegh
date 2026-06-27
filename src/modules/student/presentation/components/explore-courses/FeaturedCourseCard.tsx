"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { CourseCardModel } from "@/shared/domain/types/course.types";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user/UserAvatarImageOrInitials";
import { cn } from "@/shared/application/lib/cn";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { getCourseCtaVariant } from "./getCourseCta";

type FeaturedCourseCardProps = {
  course: CourseCardModel;
  className?: string;
};

export function FeaturedCourseCard({ course, className }: FeaturedCourseCardProps) {
  const t = useTranslations("student.dashboard.exploreCourses");
  const locale = useLocale();
  const isArabic = locale.startsWith("ar");
  const ctaVariant = getCourseCtaVariant(course);
  const courseHref = ROUTES.USER.STUDENT.COURSE_DETAIL(course.id);

  return (
    <motion.article
      dir="ltr"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className={cn(
        "relative isolate flex min-h-[453px] flex-col overflow-hidden rounded-[20px] bg-[#2b415e] shadow-[0px_8px_0px_0px_rgba(0,0,0,0.05)] md:col-span-2 md:flex-row",
        className,
      )}
    >
      {course.isBestSeller ? (
        <span className="absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-[#c7af6d] px-4 py-1 text-xs font-bold text-[#141c27] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
          {t("card.bestSeller")}
          <Star className="size-3 fill-[#141c27] text-[#141c27]" aria-hidden />
        </span>
      ) : null}

      <div
        className={cn(
          "order-2 flex min-w-0 flex-1 flex-col justify-between p-8 md:order-none",
          isArabic ? "text-right" : "text-left",
        )}
      >
        <div className="flex flex-col gap-[11px] pb-6">
          {(course.levelLabel || course.durationLabel) ? (
            <div className="flex w-full items-center justify-end gap-2">
              {course.durationLabel ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#c7af6d]">
                  {course.durationLabel}
                  <Clock className="size-3.5" aria-hidden />
                </span>
              ) : null}
              {course.levelLabel ? (
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase text-white">
                  {course.levelLabel}
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-bold leading-[37.5px] text-white md:text-[30px]">
              {course.title}
            </h3>

            <div className="flex items-center justify-end gap-2">
              <span className="text-[10px] font-medium text-[#dfdfdf]">
                {course.teacherFullName}
              </span>
              <UserAvatarImageOrInitials
                trackKey={`${course.id}-featured-teacher`}
                name={course.teacherFullName}
                imageUrl={course.teacherAvatarUrl}
                size="sm"
                circleClassName="!h-6 !w-6 !text-[10px] bg-white"
              />
            </div>

            {course.description ? (
              <p className="pt-1 text-sm leading-5 text-[#b2c8eb] line-clamp-2">
                {course.description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex w-full items-center justify-between">
          <Link
            href={courseHref}
            className="inline-flex w-[154px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#c7af6d] py-3 text-base font-bold text-white drop-shadow-[0px_4px_0px_#a38f5a] transition-colors hover:bg-[#b9a264]"
          >
            <ArrowLeft
              className={cn("size-4", !isArabic && "rotate-180")}
              aria-hidden
            />
            {t(`card.cta.${ctaVariant}`)}
          </Link>

          {course.isEnrolled ? (
            <div className="flex w-[114px] shrink-0 flex-col justify-between gap-2">
              <span className="text-xs font-bold text-white">
                {t("card.progress", { value: course.progressPercentage })}
              </span>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-[#c7af6d] shadow-[0px_0px_10px_0px_rgba(199,175,109,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, course.progressPercentage)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          ) : (
            <span className="w-[114px] shrink-0" aria-hidden />
          )}
        </div>
      </div>

      <div className="relative order-1 h-56 w-full shrink-0 overflow-hidden md:order-none md:h-[453px] md:w-1/2">
        {course.coverImageUrl ? (
          <Image
            src={course.coverImageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 321px"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#1e293b] to-[#2b415e]" />
        )}
      </div>
    </motion.article>
  );
}
