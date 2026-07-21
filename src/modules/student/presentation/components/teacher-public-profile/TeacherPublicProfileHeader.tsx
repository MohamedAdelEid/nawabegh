"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { TeacherPublicProfile } from "@/shared/domain/types/teacher.types";
import {
  formatTeacherStudentCount,
  formatYearsOfExperience,
  getTeacherBadgeVariant,
} from "@/shared/domain/utils/teacher.utils";
import { cn } from "@/shared/application/lib/cn";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user/UserAvatarImageOrInitials";
import { TeacherPublicProfileShareButton } from "./TeacherPublicProfileShareButton";

type TeacherPublicProfileHeaderProps = {
  profile: TeacherPublicProfile;
  coursesCount: number;
};

function ProfileBadge({ profile }: { profile: TeacherPublicProfile }) {
  const t = useTranslations("student.dashboard.teacherPublicProfile.header");
  const variant =
    getTeacherBadgeVariant(profile) ?? (profile.isExpert ? "expert" : null);

  if (!variant) return null;

  return (
    <span
      className={cn(
        "absolute -bottom-3 start-1/2 z-10 -translate-x-1/2 rounded-lg px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide shadow-sm",
        variant === "expert"
          ? "bg-[#c7a55b] text-[#141c27]"
          : "bg-[#f97316] text-white",
      )}
    >
      {variant === "expert" ? t("badgeExpert") : t("badgePioneer")}
    </span>
  );
}

export function TeacherPublicProfileHeader({
  profile,
  coursesCount,
}: TeacherPublicProfileHeaderProps) {
  const t = useTranslations("student.dashboard.teacherPublicProfile.header");
  const locale = useLocale();
  const numberFormatter = new Intl.NumberFormat(locale.startsWith("ar") ? "ar" : "en");

  const stats = [
    {
      value: numberFormatter.format(coursesCount),
      label: t("statCourses"),
    },
    {
      value: formatTeacherStudentCount(profile.studentCount, locale),
      label: t("statStudents"),
    },
    {
      value: formatYearsOfExperience(profile.yearsOfExperience, locale),
      label: t("statExperience"),
    },
  ];

  return (
    <section className="rounded-[24px] bg-white p-6 shadow-[0px_8px_0px_0px_rgba(0,0,0,0.05)] md:p-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <div className="size-40 overflow-hidden rounded-[24px] border-4 border-[#f1f5f9] bg-[#f8fafc] sm:size-48">
              {profile.profileImageUrl ? (
                <Image
                  src={profile.profileImageUrl}
                  alt=""
                  width={192}
                  height={192}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserAvatarImageOrInitials
                  trackKey={profile.teacherId}
                  name={profile.fullName}
                  imageUrl={null}
                  size="xxl"
                />
              )}
            </div>
            <ProfileBadge profile={profile} />
          </div>

          <div className="min-w-0 text-center sm:text-start">
            <h1 className="text-2xl font-bold text-[#2b415e] md:text-3xl">{profile.fullName}</h1>
            {profile.jobTitle ? (
              <p className="mt-2 text-sm font-bold text-[#c7a55b] md:text-base">{profile.jobTitle}</p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
              {stats.map((stat, index) => (
                <div key={stat.label} className="flex items-center gap-4">
                  {index > 0 ? <span className="hidden h-8 w-px bg-[#e2e8f0] sm:block" aria-hidden /> : null}
                  <div className="text-center sm:text-start">
                    <p className="text-xl font-bold text-[#2b415e] md:text-2xl">{stat.value}</p>
                    <p className="text-xs font-medium text-[#64748b]">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-center lg:justify-end">
          <TeacherPublicProfileShareButton
            teacherId={profile.teacherId}
            fullName={profile.fullName}
          />
        </div>
      </div>
    </section>
  );
}
