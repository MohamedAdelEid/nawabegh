"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BookOpen, Star, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { CourseDetailsModel } from "@/shared/domain/types/course.types";
import { DashboardSectionHeader } from "@/shared/presentation/components/dashboard";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user/UserAvatarImageOrInitials";

type CourseDetailsTeacherSectionProps = {
  course: CourseDetailsModel;
};

export function CourseDetailsTeacherSection({ course }: CourseDetailsTeacherSectionProps) {
  const t = useTranslations("student.dashboard.courseDetails");
  const locale = useLocale();
  const numberFormatter = new Intl.NumberFormat(locale.startsWith("ar") ? "ar" : "en-US");
  const teacher = course.teacher;
  console.log(course);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <DashboardSectionHeader title={t("sections.teacher")} />

      {!teacher ? (
        <p className="rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-6 text-sm text-[#64748b]">
          {t("teacher.empty")}
        </p>
      ) : (
        <article className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-[0px_4px_0px_0px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-start">
            <div className="relative mx-auto shrink-0 md:mx-0">
              {teacher.avatarUrl ? (
                <div className="relative size-28 overflow-hidden rounded-xl">
                  <Image src={teacher.avatarUrl} alt="" fill className="object-cover" sizes="112px" />
                </div>
              ) : (
                <UserAvatarImageOrInitials
                  trackKey={`${course.id}-details-teacher`}
                  name={teacher.fullName}
                  imageUrl={null}
                  size="md"
                  circleClassName="!size-28 !rounded-xl !text-2xl bg-primary text-white"
                />
              )}
              {teacher.isExpert ? (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#c7af6d] px-3 py-0.5 text-[10px] font-bold text-[#141c27]">
                  {teacher.expertBadgeLabel || t("teacher.expert")}
                </span>
              ) : null}
            </div>

            <div className="min-w-0 flex-1 space-y-3 text-right">
              <div>
                <h3 className="text-xl font-bold text-[#2b415e]">{teacher.fullName}</h3>
                {teacher.jobTitle ? (
                  <p className="text-sm text-[#64748b]">{teacher.jobTitle}</p>
                ) : null}
              </div>
              {teacher.about ? (
                <p className="text-sm leading-6 text-[#64748b]">{teacher.about}</p>
              ) : null}
              <div className="flex flex-wrap items-center justify-end gap-4 text-xs font-medium text-[#64748b]">
                {teacher.publishedCoursesCount > 0 ? (
                  <span className="inline-flex items-center gap-1">
                    <BookOpen className="size-3.5" aria-hidden />
                    {t("teacher.courses", {
                      count: numberFormatter.format(teacher.publishedCoursesCount),
                    })}
                  </span>
                ) : null}
                {teacher.rating > 0 ? (
                  <span className="inline-flex items-center gap-1">
                    <Star className="size-3.5 fill-[#c7af6d] text-[#c7af6d]" aria-hidden />
                    {t("teacher.rating", { value: teacher.rating.toFixed(1) })}
                  </span>
                ) : null}
                {teacher.studentCount > 0 ? (
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3.5" aria-hidden />
                    {t("teacher.students", {
                      count: numberFormatter.format(teacher.studentCount),
                    })}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </article>
      )}
    </motion.section>
  );
}
