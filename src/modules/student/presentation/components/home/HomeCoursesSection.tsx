"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CourseAccessType } from "@/shared/domain/enums/course.enums";
import type { CourseCardModel } from "@/shared/domain/types/course.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { getCourseCtaVariant } from "@/modules/student/presentation/components/explore-courses/getCourseCta";
import { HomeSectionHeader } from "./HomeSectionHeader";

type HomeCourseCardProps = {
  course: CourseCardModel;
};

function formatHomePrice(course: CourseCardModel, locale: string, freeLabel: string): string {
  if (course.accessType === CourseAccessType.Free) return freeLabel;
  const price = course.discountedPrice > 0 ? course.discountedPrice : course.originalPrice;
  const formatter = new Intl.NumberFormat(locale.startsWith("ar") ? "ar-EG" : "en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return locale.startsWith("ar") ? `${formatter.format(price)} ر.س` : `SAR ${formatter.format(price)}`;
}

function HomeCourseCard({ course }: HomeCourseCardProps) {
  const t = useTranslations("student.dashboard.home.courses");
  const tExplore = useTranslations("student.dashboard.exploreCourses");
  const locale = useLocale();
  const ctaVariant = getCourseCtaVariant(course);
  const isFree = course.accessType === CourseAccessType.Free;
  const priceLabel = formatHomePrice(course, locale, t("free"));

  const ctaLabel =
    ctaVariant === "continue"
      ? tExplore("card.cta.continue")
      : ctaVariant === "enrollFree"
        ? t("watchCourse")
        : t("joinCourse");

  return (
    <article className="flex min-w-[280px] flex-col overflow-hidden rounded-3xl border-2 border-[#e2e8f0] bg-white shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
      <div className="relative h-40 w-full">
        {course.coverImageUrl ? (
          <Image
            src={course.coverImageUrl}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[#dbe3f3]" />
        )}
        <span
          className={`absolute bottom-3 end-3 rounded-lg px-3 py-1 text-xs font-bold text-white ${
            isFree ? "bg-[#58cc02]" : "bg-[#2b415e]"
          }`}
        >
          {isFree ? t("freeBadge") : t("advancedBadge")}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div className="space-y-1 text-start">
          <h3 className="text-lg font-bold text-[#2b415e]">{course.title}</h3>
          <p className="text-sm text-[#64748b]">{course.teacherFullName}</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p
            className={`text-xl font-bold ${isFree ? "text-[#58cc02]" : "text-[#c7af6d]"}`}
          >
            {priceLabel}
          </p>
          <Link
            href={ROUTES.USER.STUDENT.COURSE_DETAIL(course.id)}
            className="rounded-xl bg-[#2b415e] px-5 py-2.5 text-sm font-bold text-white shadow-[0px_4px_0px_rgba(0,0,0,0.1)]"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}

type HomeCoursesSectionProps = {
  courses: CourseCardModel[];
  isLoading?: boolean;
};

export function HomeCoursesSection({ courses, isLoading }: HomeCoursesSectionProps) {
  const t = useTranslations("student.dashboard.home.courses");

  if (isLoading) {
    return (
      <section className="space-y-6">
        <HomeSectionHeader title={t("title")} />
        <div className="flex gap-6 overflow-hidden">
          <div className="h-[336px] w-[333px] shrink-0 animate-pulse rounded-3xl bg-white/70" />
          <div className="h-[336px] w-[333px] shrink-0 animate-pulse rounded-3xl bg-white/70" />
        </div>
      </section>
    );
  }

  const visibleCourses = courses.slice(0, 4);

  return (
    <section className="space-y-6">
      <HomeSectionHeader
        title={t("title")}
        viewAllHref={ROUTES.USER.STUDENT.COURSES}
        viewAllLabel={t("viewAll")}
      />
      <div className="-mx-1 flex gap-6 overflow-x-auto px-1 pb-2">
        {visibleCourses.map((course) => (
          <HomeCourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}
