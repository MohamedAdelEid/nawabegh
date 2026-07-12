"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Star, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Teacher } from "@/shared/domain/types/teacher.types";
import {
  buildTeacherSubtitle,
  formatTeacherRating,
  formatTeacherStudentCount,
  getTeacherBadgeVariant,
} from "@/shared/domain/utils/teacher.utils";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user/UserAvatarImageOrInitials";

type TeacherDiscoveryCardProps = {
  teacher: Teacher;
  className?: string;
};

function TeacherBadge({ teacher }: { teacher: Teacher }) {
  const t = useTranslations("student.dashboard.teachersDiscovery.card");
  const variant = getTeacherBadgeVariant(teacher);

  if (!variant) return null;

  return (
    <span
      className={cn(
        "absolute -start-1 top-0 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide",
        variant === "expert"
          ? "bg-[#c7af6d] text-[#141c27]"
          : "bg-[#f97316] text-white",
      )}
    >
      {variant === "expert" ? t("badgeExpert") : t("badgePioneer")}
    </span>
  );
}

export function TeacherDiscoveryCard({ teacher, className }: TeacherDiscoveryCardProps) {
  const t = useTranslations("student.dashboard.teachersDiscovery.card");
  const locale = useLocale();
  const subtitle = buildTeacherSubtitle(teacher);
  const profileHref = ROUTES.USER.STUDENT.TEACHER_PROFILE(teacher.teacherId);

  return (
    <article
      className={cn(
        "flex flex-col rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]",
        className,
      )}
    >
      <div className="flex flex-1 flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="size-28 overflow-hidden rounded-full border-2 border-[#e2e8f0]">
            {teacher.profileImageUrl ? (
              <Image
                src={teacher.profileImageUrl}
                alt=""
                width={112}
                height={112}
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
          <TeacherBadge teacher={teacher} />
          {teacher.isExpert ? (
            <span className="absolute -bottom-1 -end-1 flex size-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
              <Star className="size-3.5 fill-current" aria-hidden />
            </span>
          ) : null}
        </div>

        <h3 className="text-xl font-bold text-[#2b415e]">{teacher.fullName}</h3>

        {subtitle ? (
          <p className="mt-2 text-sm font-bold text-[#c7af6d]">{subtitle}</p>
        ) : null}

        <div className="mt-4 flex items-center gap-4 rounded-xl bg-[#f8fafc] px-4 py-2">
          <div className="flex items-center gap-1 text-sm font-bold text-[#2b415e]">
            <Star className="size-3.5 fill-[#c7af6d] text-[#c7af6d]" aria-hidden />
            {formatTeacherRating(teacher.rating, locale)}
          </div>
          <span className="h-4 w-px bg-[#e2e8f0]" aria-hidden />
          <div className="flex items-center gap-1 text-sm font-bold text-[#2b415e]">
            <Users className="size-3.5 text-[#64748b]" aria-hidden />
            {t("students", {
              count: formatTeacherStudentCount(teacher.studentCount, locale),
            })}
          </div>
        </div>

        {teacher.location ? (
          <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-[#64748b]">
            {teacher.location}
          </p>
        ) : null}
      </div>

      <Link
        href={profileHref}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2c4260] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#243751]"
      >
        {t("viewCourses")}
        <ChevronLeft className="size-4" aria-hidden />
      </Link>
    </article>
  );
}
