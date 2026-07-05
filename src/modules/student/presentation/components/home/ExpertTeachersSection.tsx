"use client";

import Image from "next/image";
import { ChevronLeft, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Teacher } from "@/shared/domain/types/teacher.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user/UserAvatarImageOrInitials";
import { HomeSectionHeader } from "./HomeSectionHeader";

type ExpertTeacherCardProps = {
  teacher: Teacher;
};

function ExpertTeacherCard({ teacher }: ExpertTeacherCardProps) {
  const t = useTranslations("student.dashboard.home.teachers");
  const locale = useLocale();
  const countFormatter = new Intl.NumberFormat(locale.startsWith("ar") ? "ar" : "en");

  return (
    <article className="flex items-center gap-6 rounded-3xl border border-[#e2e8f0] bg-white p-6">
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <h3 className="text-lg font-bold text-[#2c4260]">{teacher.fullName}</h3>
        <p className="text-xs font-bold text-[#c7a55b]">
          {teacher.jobTitle || teacher.primarySubjectNameAr}
        </p>
        <div className="mt-1 flex items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1 font-bold text-[#2c4260]">
            <Star className="size-3 fill-[#c7af6d] text-[#c7af6d]" aria-hidden />
            {teacher.rating.toFixed(1)}
          </span>
          <span className="font-bold text-[#94a3b8]">
            {t("students", { count: countFormatter.format(teacher.studentCount) })}
          </span>
        </div>
        <button
          type="button"
          className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#2c4260]"
        >
          {t("viewProfile")}
          <ChevronLeft className="size-3.5" aria-hidden />
        </button>
      </div>

      <div className="relative shrink-0">
        <div className="size-24 overflow-hidden rounded-full border-2 border-[#e2e8f0]">
          {teacher.profileImageUrl ? (
            <Image
              src={teacher.profileImageUrl}
              alt=""
              width={96}
              height={96}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <UserAvatarImageOrInitials
              trackKey={teacher.teacherId}
              name={teacher.fullName}
              imageUrl={null}
              size="xxl"
            />
          )}
        </div>
        {teacher.isExpert ? (
          <span className="absolute -end-1 bottom-2 rounded-md bg-[#c7af6d] px-1.5 py-0.5 text-[9px] font-extrabold text-[#141c27]">
            {teacher.expertBadgeLabel || "EXPERT"}
          </span>
        ) : null}
      </div>
    </article>
  );
}

type ExpertTeachersSectionProps = {
  teachers: Teacher[];
  isLoading?: boolean;
};

export function ExpertTeachersSection({ teachers, isLoading }: ExpertTeachersSectionProps) {
  const t = useTranslations("student.dashboard.home.teachers");

  if (isLoading) {
    return (
      <section className="space-y-6">
        <HomeSectionHeader title={t("title")} />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-[162px] animate-pulse rounded-3xl bg-white/70" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <HomeSectionHeader
        title={t("title")}
        viewAllHref={ROUTES.USER.STUDENT.COURSES}
        viewAllLabel={t("browseAll")}
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {teachers.slice(0, 6).map((teacher) => (
          <ExpertTeacherCard key={teacher.teacherId} teacher={teacher} />
        ))}
      </div>
    </section>
  );
}
