"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CirclePlus, Play, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { CourseAccessType } from "@/shared/domain/enums/course.enums";
import type { CourseCardModel } from "@/shared/domain/types/course.types";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user/UserAvatarImageOrInitials";
import { cn } from "@/shared/application/lib/cn";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { getCourseCtaVariant } from "./getCourseCta";

type CourseCardLayout = "grid" | "list";

type CourseCardProps = {
  course: CourseCardModel;
  index?: number;
  layout?: CourseCardLayout;
  className?: string;
};

function formatPrice(
  course: CourseCardModel,
  locale: string,
  freeLabel: string,
): string {
  if (course.accessType === CourseAccessType.Free) return freeLabel;
  const price = course.discountedPrice > 0 ? course.discountedPrice : course.originalPrice;
  const formatter = new Intl.NumberFormat(locale.startsWith("ar") ? "ar-EG" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return locale.startsWith("ar")
    ? `${formatter.format(price)} ج.م`
    : `EGP ${formatter.format(price)}`;
}

export function CourseCard({
  course,
  index = 0,
  layout = "grid",
  className,
}: CourseCardProps) {
  const t = useTranslations("student.dashboard.exploreCourses");
  const locale = useLocale();
  const isList = layout === "list";
  const ctaVariant = getCourseCtaVariant(course);
  const numberFormatter = new Intl.NumberFormat(locale.startsWith("ar") ? "ar" : "en-US");
  const priceLabel = formatPrice(course, locale, t("card.free"));
  const courseHref = ROUTES.USER.STUDENT.COURSE_DETAIL(course.id);

  const ctaButtonClassName = cn(
    "flex items-center justify-center gap-2 rounded-xl py-3 text-base font-bold transition-colors",
    isList ? "w-full sm:min-w-[160px] sm:px-4" : "mt-auto w-full",
    ctaVariant === "continue"
      ? "bg-[#d4af37] text-[#2b415e] hover:bg-[#c9a430]"
      : "bg-[#f1f5f9] text-[#2b415e] hover:bg-[#e2e8f0]",
  );

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: isList ? -2 : -6, transition: { duration: 0.25 } }}
      className={cn(
        "flex overflow-hidden rounded-[20px] bg-white shadow-[0px_8px_0px_0px_rgba(0,0,0,0.05)]",
        isList ? "flex-col sm:flex-row sm:items-stretch" : "flex-col",
        className,
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden",
          isList ? "h-48 w-full sm:h-auto sm:w-[280px] sm:min-w-[280px]" : "h-48 w-full",
        )}
      >
        {course.coverImageUrl ? (
          <Image
            src={course.coverImageUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={isList ? "(max-width: 640px) 100vw, 280px" : "(max-width: 768px) 100vw, 33vw"}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#2b415e] to-[#1e293b]" />
        )}
        {!isList ? (
          <div className="absolute bottom-3 start-3 rounded-lg bg-white/90 px-3 py-1 text-xs font-bold text-[#2b415e] backdrop-blur-sm">
            {priceLabel}
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "flex min-w-0 flex-1",
          isList
            ? "flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6"
            : "flex-col p-6",
        )}
      >
        <div className={cn("min-w-0 flex-1", isList ? "space-y-2" : undefined)}>
          <div className={cn("flex items-center justify-between gap-2", isList ? "mb-0" : "mb-3")}>
            <div className="flex items-center gap-1 text-xs text-[#64748b]">
              <Users className="size-3.5 shrink-0" aria-hidden />
              <span>
                {t("card.students", {
                  count: numberFormatter.format(course.enrolledStudentsCount),
                })}
              </span>
            </div>
            {course.levelLabel ? (
              <span className="shrink-0 rounded bg-[#f1f5f9] px-2 py-1 text-[10px] font-bold uppercase text-[#64748b]">
                {course.levelLabel}
              </span>
            ) : null}
          </div>

          <h3
            className={cn(
              "font-bold text-[#2b415e]",
              isList
                ? "line-clamp-1 text-lg leading-7 sm:line-clamp-2 sm:text-xl"
                : "mb-3 line-clamp-2 text-xl leading-7",
            )}
          >
            <Link href={courseHref} className="transition-colors hover:text-[#1e293b]">
              {course.title}
            </Link>
          </h3>

          <div className={cn("flex items-center gap-2", isList ? "" : "mb-3")}>
            <UserAvatarImageOrInitials
              trackKey={`${course.id}-teacher`}
              name={course.teacherFullName}
              imageUrl={course.teacherAvatarUrl}
              size="sm"
              circleClassName="!h-6 !w-6 !text-[10px] bg-primary text-white"
            />
            <span className="truncate text-[10px] font-medium text-[#64748b]">
              {course.teacherFullName}
            </span>
          </div>

          {course.description ? (
            <p
              className={cn(
                "text-sm leading-5 text-[#64748b]",
                isList ? "line-clamp-1 sm:line-clamp-2" : "mb-4 line-clamp-2",
              )}
            >
              {course.description}
            </p>
          ) : null}

          {course.isEnrolled ? (
            <div className={cn("space-y-2", isList ? "max-w-md pt-1" : "mb-4")}>
              <div className="text-xs font-medium text-[#64748b]">
                {t("card.progress", { value: course.progressPercentage })}
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#f1f5f9]">
                <motion.div
                  className="h-full rounded-full bg-[#d4af37]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, course.progressPercentage)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            "flex shrink-0 flex-col gap-3",
            isList ? "w-full sm:w-[180px] sm:items-stretch" : "w-full",
          )}
        >
          {isList ? (
            <span className="text-center text-sm font-bold text-[#2b415e] sm:text-end">
              {priceLabel}
            </span>
          ) : null}
          <Link href={courseHref} className={ctaButtonClassName}>
            {ctaVariant === "enrollFree" ? (
              <CirclePlus className="size-5 shrink-0" aria-hidden />
            ) : (
              <Play className="size-5 shrink-0" aria-hidden />
            )}
            {t(`card.cta.${ctaVariant}`)}
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
